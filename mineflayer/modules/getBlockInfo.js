// var v = require("vec3");
import v from "vec3";
/**
 * @param {import("mineflayer").Bot} bot
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function getBlockInfo(bot, x, y, z) {
  // 坐标取整（MC 方块必须是整数）
  const fx = Math.floor(x)
  const fy = Math.floor(y)
  const fz = Math.floor(z)

  // ✅ 官方 async API：自动加载区块，永远不会返回 null
  const block = bot.world.getBlock(v(fx, fy, fz))
  // console.log(block)
  return block
}