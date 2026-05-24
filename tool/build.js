const fs = require('fs');
const AdmZip = require('adm-zip');

// 完全保留你原来的配置
const fileDirList = {
  modules: './modules',
};

// 创建输出目录
fs.mkdirSync('../docs/public/tool', { recursive: true });

// 新建 zip
const zip = new AdmZip();

// 循环添加，自动保留一层文件夹名（key = modules）
for (let key in fileDirList) {
  // key = modules（文件夹名）
  // fileDirList[key] = ./modules（源路径）
  zip.addLocalFolder(fileDirList[key], key);
}

// 输出文件
zip.writeZip('../docs/public/tool/tool.zip');

console.log('✅ 压缩完成！');