import fs from 'fs';
import yaml from 'yaml';

// 读取配置
const config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'));

// 深拷贝配置（你原来的逻辑）
export const value = JSON.parse(JSON.stringify(config));