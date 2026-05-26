const fs = require("fs");
const https = require("https");
const AdmZip = require("adm-zip");
const { execSync } = require('child_process');

const log = require("./modules/log.js");

fs.mkdirSync("/temp", { recursive: true });

const buildPath = "/temp";

const main = async () => {
  const getUrlBuffer = async (url, onProgress) => {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          // 请求失败
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`请求失败，状态码：${res.statusCode}`));
          }

          const chunks = [];
          // 总大小（字节）
          const totalSize = parseInt(res.headers["content-length"], 10) || 0;
          // 已下载大小
          let downloadedSize = 0;

          // 接收数据片段 + 计算进度
          res.on("data", (chunk) => {
            chunks.push(chunk);
            downloadedSize += chunk.length;

            // 有总长度才计算进度
            if (totalSize && typeof onProgress === "function") {
              const percent = ((downloadedSize / totalSize) * 100).toFixed(2);
              onProgress(percent, downloadedSize, totalSize);
            }
          });

          // 接收完成，合并成 Buffer
          res.on("end", () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
          });

          // 错误监听
          res.on("error", (err) => reject(err));
        })
        .on("error", (err) => reject(err));
    });
  };
  const buffer = {
    // node: {
    //   url: "https://nodejs.org/dist/v22.22.3/node-v22.22.3-win-x64.zip",
    //   path: "/",
    // },
    package: { url: "https://docs.rosyju.top/tool/package.json", path: "/" },
    tool: { url: "https://docs.rosyju.top/tool/tool.zip", path: "/" },
  };
  for (const key in buffer) {
    const item = buffer[key];
    const bufferData = await getUrlBuffer(
      item.url,
      (percent, downloadedSize, totalSize) => {
        log.info.raw(
          `已下载: ${downloadedSize} / ${totalSize} 字节 ; 下载进度：${percent}%`,
        );
      },
    );
    fs.writeFileSync((item.url).split('/').pop(), bufferData);
    log.info(`✅ ${key} 下载完成！`);
  }

  // 处理node

  //adm-zip解压下载的https://nodejs.org/dist/v22.22.3/node-v22.22.3-win-x64.zip文件到node目录下
  const zipPath = "node-v22.22.3-win-x64.zip";
  const nodeDir = "node";

  if (fs.existsSync(zipPath)) {
    log.info("正在解压 Node.js...");
    
    // 创建 node 目录
    fs.mkdirSync(nodeDir, { recursive: true });
    
    // 使用 adm-zip 解压
    const zip = new AdmZip(zipPath);
    
    // 获取 zip 中的所有条目
    const zipEntries = zip.getEntries();
    
    // 找到内部根文件夹名称
    const innerFolder = zipEntries.find(entry => entry.isDirectory).entryName.split("/")[0];
    
    // 解压并重新组织文件结构（移除内部根文件夹）
    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        // 移除内部根文件夹前缀
        const targetPath = entry.entryName.replace(`${innerFolder}/`, "");
        const fullTargetPath = `${nodeDir}/${targetPath}`;
        
        // 确保目标目录存在
        const targetDir = fullTargetPath.substring(0, fullTargetPath.lastIndexOf("/"));
        fs.mkdirSync(targetDir, { recursive: true });
        
        // 写入文件
        fs.writeFileSync(fullTargetPath, entry.getData());
      }
    });
    
    log.info("✅ Node.js 解压完成！");
    
    // 清理 zip 文件
    fs.unlinkSync(zipPath);
    log.info("已清理 zip 文件");
  } else {
    log.error("未找到 Node.js zip 文件！");
  }

  // 解压下载的https://docs.rosyju.top/tool/tool.zip文件,直接铺开在当前目录
  const toolZipPath = "tool.zip";

  if (fs.existsSync(toolZipPath)) {
    log.info("正在解压 tool.zip...");
    
    // 使用 adm-zip 解压
    const zip = new AdmZip(toolZipPath);
    
    // 获取 zip 中的所有条目
    const zipEntries = zip.getEntries();
    
    // 解压文件到当前目录
    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const targetPath = entry.entryName;
        
        // 确保目标目录存在
        const targetDir = targetPath.substring(0, targetPath.lastIndexOf("/"));
        if (targetDir) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // 写入文件
        fs.writeFileSync(targetPath, entry.getData());
      }
    });
    
    log.info("✅ tool.zip 解压完成！");
    
    // 清理 zip 文件
    fs.unlinkSync(toolZipPath);
    log.info("已清理 tool.zip 文件");
  } else {
    log.error("未找到 tool.zip 文件！");
  }

  execSync('.\\node\\npm i', {
    stdio: 'inherit'  // 关键：让控制台输出安装日志
});

};

main();
