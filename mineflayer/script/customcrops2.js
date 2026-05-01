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
  await sleep(3000);
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

  console.log(goals.z);

  // 真正的 S 型路线遍历
  while (true) {
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
      // x++;
      // if (x == goals.x.length) {
      //   x = 0;
      // }
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
    // await bot.waitForTicks(5);
    for (let i = 0; i < 5; i++) {
      // await bot.waitForTicks(5);
      let item_display = await rightEntity(bot, "interaction");
      // await bot.waitForTicks(1);
      if (item_display) {
        await bot.activateEntityAt(
          item_display,
          item_display.position.offset(0, 0.5, 0),
        );
      }
      await bot.waitForTicks(3);
    }
    await bot.waitForTicks(1);

    await setItemSlot(bot, 9);

    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        for (let plantX = -2; plantX <= 2; plantX++) {
          for (let plantZ = -2; plantZ <= 2; plantZ++) {
            let heldItem = bot.heldItem;
            if (heldItem) {
              await removeItem(bot, heldItem.slot);
            }
            await rightClickBlockFace(bot, [x + plantX, y, z + plantZ]);
          }
        }
      } else if (i == 2) {
        function checkZ(array, z) {
          // 判断是不是真数组
          if (!Array.isArray(array)) {
            return -1;
          }
          return array.indexOf(z);
        }

        let items = await getInventory(bot);

        let seed = {
          火龙果: await findMatchingItems(items, {
            id: "sugar",
            name: "火龙果种子",
          }),
          葡萄: await findMatchingItems(items, {
            id: "sugar",
            name: "葡萄种子",
          }),
          辣椒: await findMatchingItems(items, {
            id: "sugar",
            name: "辣椒种子",
          }),
        };
        let seedBool = { 火龙果: false, 葡萄: false, 辣椒: false };
        if (seed.火龙果.length) {
          await setItemSlot(bot, seed.火龙果[0].slot);
          await setItemSlot(bot, 10);
          seedBool.火龙果 = true;
          bot.waitForTicks(1);
        }
        if (seed.葡萄.length) {
          await setItemSlot(bot, seed.葡萄[0].slot);
          await setItemSlot(bot, 11);
          seedBool.葡萄 = true;
          bot.waitForTicks(1);
        }
        if (seed.辣椒.length) {
          await setItemSlot(bot, seed.辣椒[0].slot);
          await setItemSlot(bot, 12);
          seedBool.辣椒 = true;
          bot.waitForTicks(1);
        }

        await bot.waitForTicks(1);

        await eat(bot, "apple");

        for (let i = 13; i < 30; i++) {
          await removeItem(bot, i);
        }
        let check = checkZ(goals.z, z) + 1;
        if (check != 0) {
          if (check >= 1 && check < 6 && seedBool.火龙果) {
            safeLog("片区:" + check + " 火龙果");
            await setItemSlot(bot, 10);
            bot.waitForTicks(1);
            for (let plantX = -2; plantX <= 2; plantX++) {
              for (let plantZ = -2; plantZ <= 2; plantZ++) {
                await rightClickBlockFace(bot, [x + plantX, y - 1, z + plantZ]);
              }
            }
            await setItemSlot(bot, 10);
          } else if (check >= 6 && check < 11 && seedBool.葡萄) {
            safeLog("片区:" + check + " 葡萄");
            await setItemSlot(bot, 11);
            bot.waitForTicks(1);
            for (let plantX = -2; plantX <= 2; plantX++) {
              for (let plantZ = -2; plantZ <= 2; plantZ++) {
                await rightClickBlockFace(bot, [x + plantX, y - 1, z + plantZ]);
              }
            }
            await setItemSlot(bot, 11);
          } else if (check >= 11 && check < 16 && seedBool.辣椒) {
            safeLog("片区:" + check + " 辣椒");
            await setItemSlot(bot, 12);
            bot.waitForTicks(1);
            for (let plantX = -2; plantX <= 2; plantX++) {
              for (let plantZ = -2; plantZ <= 2; plantZ++) {
                await rightClickBlockFace(bot, [x + plantX, y - 1, z + plantZ]);
              }
            }
            await setItemSlot(bot, 12);
          }
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
