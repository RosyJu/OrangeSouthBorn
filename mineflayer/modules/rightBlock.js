// 顶部必须写这个
import vec3 from 'vec3';

/**
 * 右键点击方块（返回字符串结果）
 * @param {object} bot
 * @param {number[]} pos
 * @returns {Promise<string>}
 */
export async function rightClickBlockFace(bot, [x, y, z]) {
  try {
    // 坐标校验
    x = Number(x);
    y = Number(y);
    z = Number(z);
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return "坐标必须是数字";
    }

    // 获取方块
    const blockPos = vec3(Math.floor(x), Math.floor(y), Math.floor(z));
    const block = bot.blockAt(blockPos);

    // if (!block) {
    //   return "该位置没有方块";
    // }

    // 看向方块中心
    const lookAtPos = block.position.offset(0.5, 0.5, 0.5);
    await bot.lookAt(lookAtPos, true);
    await bot.waitForTicks(1);

    // 右键方块
    await bot.activateBlock(block);

    return "成功右键点击方块";

  } catch (err) {
    return "右键失败：" + err.message;
  }
}