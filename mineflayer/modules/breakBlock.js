import { getBlockInfo } from './getBlockInfo.js';

export function breakBlock(bot, [x, y, z]) {

  try {
    bot.dig(getBlockInfo(bot, x, y, z));
    return `成功破坏`;
  } catch (err) {
    return `破坏失败：${err.message}`;
  }
}