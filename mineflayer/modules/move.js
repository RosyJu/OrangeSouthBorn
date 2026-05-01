import mineflayerPathfinder from "mineflayer-pathfinder";
const { pathfinder, Movements, goals } = mineflayerPathfinder;
const { GoalBlock } = goals;

export async function move(bot, x, y, z) {
  try {
    let physics = bot.physicsEnabled;
    if (!physics) {
      bot.physicsEnabled = true;
    }

    // 参数校验
    if (!bot) {
      console.log("移动失败：bot 实例不存在");
      return false;
    }
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      console.log(`移动失败：坐标无效 (${x}, ${y}, ${z})`);
      return false;
    }

    try {
      // 加载插件
      if (!bot.pathfinder) {
        bot.loadPlugin(pathfinder);
      }

      const defaultMove = new Movements(bot);
      bot.pathfinder.setMovements(defaultMove);
      const goal = new GoalBlock(x, y, z);

      // 修复超时：先处理状态，再 reject
      await Promise.race([
        bot.pathfinder.goto(goal),
        new Promise((_, reject) => {
          setTimeout(() => {
            if (!physics) {
              bot.physicsEnabled = false;
            }
            // ❌ 删掉 bot.end()！！！
            // bot.end();

            reject(new Error("移动超时 : 30秒内未到达目标"));
          }, 30000);
        }),
      ]);

      // 移动成功 → 必须 return true
      if (!physics) {
        bot.physicsEnabled = false;
      }
      return true;

    } catch (err) {
      // 失败还原物理
      if (!physics) {
        bot.physicsEnabled = false;
      }

      const errorMsg = err.message || "未知错误";
      if (bot.pathfinder) {
        bot.pathfinder.stop();
      }

      console.log(`❌ 移动失败 (${x}, ${y}, ${z})：${errorMsg}`);

      // 失败必须 return false
      return false;
    }
  } catch (err) {
    console.error(`❌ 移动失败 (${x}, ${y}, ${z})：${err.message || "未知错误"}`);
    return false;
  }
}