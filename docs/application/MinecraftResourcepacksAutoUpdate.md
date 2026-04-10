# Minecraft资源包自动更新

## 简介

- 为了防止每次```橘南生```资源包更新时,玩家无法即使获取更新内容而推出的应用程序
- 该资源以Node.js为基础制作

## 前置准备

- Windows10或Windows11系统

## 安装

1. 在QQ群中下载```MinecraftResourcepacksAutoUpdate.exe```应用程序文件
   ![](/public/QQ群文件-MinecraftResourcepacksAutoUpdate.exe.png)
2. 将```MinecraftResourcepacksAutoUpdate.exe```复制到版本文件夹中
   - 预计为;版本文件夹路径: ```.minecraft\versions\<版本号>\MinecraftResourcepacksAutoUpdate.exe```
   - 通过PCL打开版本文件夹;打开PCL-版本设置-概览-版本文件夹;
   ![](/public/PCL-版本文件夹.png)
3. 设置PCL启动前执行命令
   ```bash
   start /wait "" "{version_path}MinecraftResourcepacksAutoUpdate.exe"
   ```
   - 通过PCL打开版本文件夹;打开PCL-版本设置-设置-高级选项-启动前执行命令;
   ![](/public/PCL-启动前执行命令.png)
4. 勾选```等待命令执行完后再继续启动```选项
   ![](/public/PCL-等待命令执行完后再继续启动.png)
5. 启动```Minecraft```,进行测试

## 源码

```javascript
const https = require("https");
const fs = require("fs");
const path = require("path");
const scriptDir = process.pkg ? path.dirname(process.execPath) : path.dirname(process.argv[1]);
const urlFile = { size: 0, url: "https://gitee.com/RosyJu/orange-south-born/raw/MagicTown/橘南生.zip" };
const localFile = { size: 0 ,url:`${scriptDir}/resourcepacks/橘南生.zip`};
(() => {
  try {
    localFile.size = fs.statSync(localFile.url).size;

  } catch (err) {
    return null;
  }
})();
if (localFile.size == 0) {
  console.log("资源包文件不存在");
  console.log("开始获取资源包链接");
  const req = https.request(urlFile.url, { method: "HEAD" }, (res) => {
    req.destroy();
    urlFile.size = Number(res.headers["content-length"]);
    if (urlFile.size == 0) {
      console.log("云端链接获取失败");
      process.exit();
    } else {
      console.log("云端链接获取成功");
      download(urlFile.url, localFile.url);
    }
  });
  req.end();
} else {
  console.log("开始获取云端资源包大小");
  const req = https.request(urlFile.url, { method: "HEAD" }, (res) => {
    req.destroy();
    urlFile.size = Number(res.headers["content-length"]);
    if (urlFile.size == 0) {
      console.log("云端链接获取失败");
      process.exit();
    } else {
      console.log("云端链接获取成功");
      console.log(`本地资源包大小: ${localFile.size} 字节, 云端资源包大小: ${urlFile.size} 字节`);
      if (urlFile.size != localFile.size) {
        console.log("本地资源包大小与云端资源包大小不同");
        download(urlFile.url, localFile.url);
      } else {
        console.log("本地资源包大小与云端资源包大小相同");
        process.exit();
      }
    }
  });
  req.end();
}
function download(url, savePath) {
  https.get(url, (res) => {
    const chunks = [];
    const totalSize = parseInt(res.headers["content-length"]);
    let downloadedSize = 0;
    console.log("文件总大小: " + (totalSize / 1024 / 1024).toFixed(2) + "MB");
    res.on("data", (chunk) => {
      chunks.push(chunk);
      downloadedSize += chunk.length;
      const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
      process.stdout.write(`\r下载进度: ${percent}%`);
    });
    res.on("end", () => {
      process.stdout.write(`\r✅ 下载完成！        \n`);
      fs.writeFileSync(savePath, Buffer.concat(chunks));
      process.exit();
    });
  });
}
process.stdin.resume();
```