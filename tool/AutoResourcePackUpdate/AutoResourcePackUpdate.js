const https = require("https"); // 引入HTTPS模块，用于发起HTTPS请求
const fs = require("fs"); // 引入文件系统模块，用于读写文件
const path = require("path"); // 引入路径模块，用于处理文件路径
const yaml = require("yaml"); // 引入YAML解析模块，用于解析YAML文件
const log = require("../modules/log.js"); // 引入日志模块，用于输出日志信息

// 取目录
const scriptDir = process.pkg // 判断是否是pkg打包的可执行文件
  ? path.dirname(process.execPath) // 如果是pkg打包，获取可执行文件所在目录
  : path.dirname(process.argv[1]); // 否则获取脚本文件所在目录

// 获取保存文件夹（必须传入命令行参数）
const saveFolder = process.argv[2]; // 从命令行第三个参数获取保存文件夹路径

// 检查是否传入参数
if (!saveFolder) { // 如果没有传入保存文件夹参数
  log.info("错误：请传入资源包保存文件夹路径!"); // 输出错误提示信息
  process.exit(1); // 终止程序，退出码为1表示有错误
}

const urlFile = { size: 0, url: "" }; // 定义云端文件对象，存储文件大小和下载URL
const localFile = { // 定义本地文件对象
  size: 0, // 本地文件大小
  url: path.join(saveFolder, "橘南生.zip") // 本地文件完整路径
};

// 读取本地文件大小
(() => { // 使用立即执行函数读取本地文件大小
  try { // 尝试执行以下操作
    localFile.size = fs.statSync(localFile.url).size; // 同步获取文件状态并读取文件大小
  } catch { // 如果读取失败（文件不存在）
    localFile.size = 0; // 文件不存在则将大小设为0
  }
})();

async function main() { // 定义主函数，使用async支持异步操作
  try { // 尝试执行主逻辑
    log.info(`资源包保存位置: ${saveFolder}`); // 输出资源包保存位置
    log.info("正在获取下载链接..."); // 输出提示信息
    const urlList = await fetchYmlToJson("https://docs.rosyju.top/tool/url.yml"); // 异步获取YML文件并解析为JSON
    log.info(`获取到直链数：${urlList.length}`); // 输出获取到的直链数量
    log.info("正在测试可用直链..."); // 输出提示信息

    await urlTest(urlList); // 异步测试所有直链的可用性

    if (!urlFile.url || urlFile.size <= 0) { // 如果没有找到可用的URL或文件大小无效
      log.info("所有直链均不可用!"); // 输出提示信息
      return; // 提前返回，结束程序
    }

    log.info(`可用直链: ${decodeURIComponent(urlFile.url)}`); // 输出解码后的可用直链
    log.info(`本地资源包大小: ${(localFile.size / 1024 / 1024).toFixed(2)}MB`); // 输出本地文件大小（转换为MB）
    log.info(`云端资源包大小: ${(urlFile.size / 1024 / 1024).toFixed(2)}MB`); // 输出云端文件大小（转换为MB）

    if (localFile.size === urlFile.size) { // 如果本地和云端文件大小相同
      log.info("本地资源包已是最新，无需下载"); // 输出提示信息
      return; // 提前返回，不进行下载
    }

    log.info("开始下载最新资源包..."); // 输出提示信息
    await downloadFile(urlFile.url, localFile.url); // 异步下载文件
  } catch (err) { // 如果主逻辑执行过程中出错
    log.info(`程序异常：${err.message}`); // 输出异常信息
  }
}

// 下载 YML
async function fetchYmlToJson(url) { // 定义异步函数，用于获取并解析YML文件
  return new Promise((resolve, reject) => { // 返回一个Promise对象
    https.get(url, (res) => { // 发起HTTPS GET请求
      if (res.statusCode < 200 || res.statusCode >= 300) { // 如果响应状态码不是2xx成功状态
        return reject(new Error(`状态码：${res.statusCode}`)); // 拒绝Promise，返回错误信息
      }
      let data = ""; // 定义变量存储接收到的数据
      res.on("data", chunk => data += chunk); // 监听data事件，接收数据块并拼接到data
      res.on("end", () => { // 监听end事件，数据接收完成
        try { // 尝试解析YML
          resolve(yaml.parse(data)); // 解析YML数据并解析Promise
        } catch { // 如果解析失败
          reject(new Error("YML解析失败")); // 拒绝Promise，返回错误信息
        }
      });
    }).on("error", reject); // 监听error事件，拒绝Promise
  });
}

// 测试链接
async function urlTest(urlList) { // 定义异步函数，用于测试URL列表的可用性
  for (const url of urlList) { // 遍历所有URL
    try { // 尝试测试当前URL
      log.info(`测试链接：${url}`); // 输出正在测试的URL
      const { size, finalUrl } = await getRemoteFileSize(url); // 异步获取远程文件大小
      if (size > 0) { // 如果文件大小有效
        urlFile.size = size; // 保存文件大小
        urlFile.url = finalUrl; // 保存最终URL
        return; // 找到可用的URL，提前返回
      }
    } catch (e) { // 如果测试失败
      log.info(`链接无效：${e.message}`); // 输出错误信息
    }
  }
}

// 获取文件大小（支持重定向）
function getRemoteFileSize(url) { // 定义函数，用于获取远程文件大小
  return new Promise((resolve, reject) => { // 返回一个Promise对象
    const req = https.request(url, { method: "HEAD" }, (res) => { // 发起HEAD请求（只获取响应头）
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { // 如果是3xx重定向且有location头部
        const decodedLocation = decodeURIComponent(res.headers.location); // 解码重定向地址
        log.info(`检测到重定向,新地址: ${decodedLocation}`); // 输出重定向信息
        req.destroy(); // 销毁当前请求
        getRemoteFileSize(res.headers.location).then(resolve).catch(reject); // 递归请求重定向后的地址
        return; // 提前返回
      }
      
      req.destroy(); // 销毁请求
      const size = Number(res.headers["content-length"]); // 从响应头获取文件大小并转换为数字
      if (size > 0) { // 如果文件大小有效
        resolve({ size, finalUrl: url }); // 解析Promise，返回文件大小和最终URL
      } else { // 如果文件大小无效
        reject(new Error("无法获取大小")); // 拒绝Promise，返回错误信息
      }
    });

    req.on("error", () => reject(new Error("请求失败"))); // 监听error事件，拒绝Promise
    req.end(); // 结束请求
  });
}

// 下载文件（带进度、自动创建目录）
async function downloadFile(url, savePath) { // 定义异步函数，用于下载文件
  const dir = path.dirname(savePath); // 获取文件所在目录路径
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // 如果目录不存在，递归创建目录

  return new Promise((resolve, reject) => { // 返回一个Promise对象
    https.get(url, (res) => { // 发起HTTPS GET请求
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { // 如果是3xx重定向且有location头部
        const decodedLocation = decodeURIComponent(res.headers.location); // 解码重定向地址
        log.info(`下载时检测到重定向,新地址: ${decodedLocation}`); // 输出重定向信息
        downloadFile(res.headers.location, savePath).then(resolve).catch(reject); // 递归下载重定向后的地址
        return; // 提前返回
      }
      
      if (res.statusCode < 200 || res.statusCode >= 300) { // 如果响应状态码不是2xx成功状态
        return reject(new Error(`下载失败 状态码：${res.statusCode}`)); // 拒绝Promise，返回错误信息
      }

      const chunks = []; // 定义数组存储数据块
      let downloaded = 0; // 定义变量记录已下载字节数
      const total = urlFile.size; // 获取文件总大小

      res.on("data", chunk => { // 监听data事件，接收数据块
        chunks.push(chunk); // 将数据块添加到数组
        downloaded += chunk.length; // 累加已下载字节数
        const p = ((downloaded / total) * 100).toFixed(1); // 计算下载百分比（保留1位小数）
        log.info.raw(`下载进度：${p}%`); // 输出下载进度（覆盖同一行）
      });

      res.on("end", () => { // 监听end事件，数据接收完成
        fs.writeFileSync(savePath, Buffer.concat(chunks)); // 将所有数据块合并并写入文件
        log.info(`下载完成!`); // 输出下载完成提示
        resolve(); // 解析Promise
      });

      res.on("error", reject); // 监听error事件，拒绝Promise
    }).on("error", reject); // 监听error事件，拒绝Promise
  });
}

main(); // 调用主函数，启动程序
