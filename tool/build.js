const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const log = require("./modules/log.js");
// 完全保留你原来的配置
const fileDirList = {
  modules: "./modules",
};

// 创建输出目录
fs.mkdirSync("../docs/public/tool", { recursive: true });

// 新建 zip

const dirPath = "../docs/public/tool/";
fs.readdirSync(dirPath).forEach((item) => {
  fs.rmSync(path.join(dirPath, item), { recursive: true, force: true });
});

const zip = new AdmZip();

for (let key in fileDirList) {
  zip.addLocalFolder(fileDirList[key], key);
}

zip.writeZip("../docs/public/tool/tool.zip");

console.log("✅ 压缩完成！");

fs.copyFileSync("./package.json", "../docs/public/tool/package.json");

log.info("✅ package.json复制完成！");

fs.copyFileSync("./start.exe", "../docs/public/tool/start.exe");

log.info("✅ start.exe复制完成！");
