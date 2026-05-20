// const readline = require("readline");

import readline from "readline";
import consola from "consola";
import vec3 from "vec3";

import { getInventory } from "../modules/getInventory.js";
import { move } from "../modules/move.js";
import { setItemSlot } from "../modules/setItemSlot.js";
import { removeItem } from "../modules/removeItem.js";
import { rightClickBlockFace } from "../modules/rightBlock.js";
import { eat } from "../modules/eat.js";
import { rightEntity } from "../modules/rightEntity.js";

let plantNum = 0;

// let stop = 0;

export async function customcrops(bot, goalInfo, waterHeight, rl) {
  function safeLog(...args) {
    try {
      if (rl) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
      }
      consola.log(...args);
      if (rl) rl.prompt(true);
    } catch (error) {
      consola.log("❌ 错误：" + error.message);
    }
  }
  await sleep(1000);
  if (!goalInfo) return;

  let goals = { x: [], z: [] };

  for (let i = 0; i < goalInfo.x; i++) {
    goals.x.push(goalInfo.point.x);
    goalInfo.point.x = goalInfo.point.x + 5;
  }
  for (let i = 0; i < goalInfo.z; i++) {
    goals.z.push(goalInfo.point.z);
    goalInfo.point.z = goalInfo.point.z + 5;
  }

  // console.log(goals.z);

  // 真正的 S 型路线遍历
  while (true) {
    await bot.chat("/home xlg")
    await bot.waitForTicks(80);
    for (let x = 0; x < goals.x.length; x++) {
      const currentX = goals.x[x];
      const y = goalInfo.point.y;

      // ✅ 关键：偶数行正序，奇数行倒序 = S型
      if (x % 2 === 0) {
        // 正序 z: 0 → 1 → 2 → ...
        for (let z = 0; z < goals.z.length; z++) {
          const currentZ = goals.z[z];
          let fuck = await safemove(
            bot,
            currentX,
            y,
            currentZ,
            waterHeight,
            goals,
            safeLog,
          );
          if (!fuck) {
            break;
          } else {
            plantNum++;
            safeLog(`✅ 已种植 ${plantNum} 个水果`);
          }
        }
      } else {
        // 倒序 z: 最后 → ... → 1 → 0
        for (let z = goals.z.length - 1; z >= 0; z--) {
          const currentZ = goals.z[z];
          let fuck = await safemove(
            bot,
            currentX,
            y,
            currentZ,
            waterHeight,
            goals,
            safeLog,
          );
          if (!fuck) {
            break;
          } else {
            plantNum++;
            safeLog(`✅ 已种植 ${plantNum} 个水果`);
          }
        }
      }
    }
  }
}

async function safemove(bot, x, y, z, waterHeight, goals, safeLog) {
  //   let fruitStr = "火龙果";
  if (!(await move(bot, x, y, z))) {
    return false;
  }
  // stop = 0
  let inv = await getInventory(bot);

  let waterBucket = findMatchingItems(inv, {
    id: "golden_horse_armor",
    name: "铱制浇水壶",
  });

  if (waterBucket) {
    await setItemSlot(bot, waterBucket[0].slot);

    // console.log(waterBucket[0]);

    await bot.waitForTicks(1);

    // console.log(bot.heldItem);
    let waterStrCount;
    try {
      waterStrCount = (
        bot.heldItem.componentMap
          .get("lore")
          .data[0].value.extra.value.value[0].text.value.match(/뀃/g) || []
      ).length;
    } catch (error) {
      waterStrCount = 3;
    }

    await bot.waitForTicks(1);
    for (let i = 3; i > waterStrCount; i--) {
      // console.log(vec3(x + 0.5, y + waterHeight, z + 0.5));
      await bot.lookAt(vec3(x + 0.5, y + waterHeight, z + 0.5), true);
      await rightClickBlockFace(bot, [x + 0.5, y + waterHeight, z + 0.5]);
      await bot.waitForTicks(1);
    }

    await rightClickBlockFace(bot, [x, y, z]);
    await bot.lookAt(vec3(x, y - 1, z));
    await bot.waitForTicks(1);
    // bot.look(0,90)
    let item_display = await rightEntity(bot, "interaction");
    for (let i = 0; i < 3; i++) {
      // let item_display = await rightEntity(bot, "interaction");
      if (item_display) {
        bot.activateEntityAt(
          item_display,
          item_display.position.offset(0, 0.1, 0),
        );
      }
      await bot.waitForTicks(1);
    }
    await bot.waitForTicks(1);

    await setItemSlot(bot, 9);

    await bot.waitForTicks(1);

    await eat(bot, "apple");

    for (let i = 0; i < 2; i++) {
      // if (i < 2) {
        for (let plantX = -2; plantX <= 2; plantX++) {
          // await bot.waitForTicks(1);
          for (let plantZ = -2; plantZ <= 2; plantZ++) {
            let heldItem = bot.heldItem;
            if (heldItem) {
              await removeItem(bot, heldItem.slot);
            }
            await rightClickBlockFace(bot, [x + plantX, y, z + plantZ]);
            // await bot.waitForTicks(1);
          }
        }
    }
  }
  return true;
}

/**
 * 从物品数组中找到匹配条件的所有元素
 * @param {Array} items 物品数组（你的背包/箱子物品）
 * @param {Object} condition 匹配条件（如 { id: 'apple', name: '大蒜' }）
 * @returns {Array} 匹配到的元素数组
 */
function findMatchingItems(items, condition) {
  return items.filter((item) => {
    // 遍历条件里的每一个 key，必须全部满足才算匹配
    for (const key in condition) {
      // 如果 item 没有这个属性 或者 值不相等 → 不匹配
      if (item[key] !== condition[key]) {
        return false;
      }
    }
    // 所有条件都满足
    return true;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
