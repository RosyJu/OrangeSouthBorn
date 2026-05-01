// const readline = require("readline");

import readline from "readline";
import consola from "consola";

import { getInventory } from "../modules/getInventory.js";
import { move } from "../modules/move.js";
import { setItemSlot } from "../modules/setItemSlot.js";
import { removeItem } from "../modules/removeItem.js";
import { rightClickBlockFace } from "../modules/rightBlock.js";

let plantNum = 0;

export async function customCrops(bot, sel, rl) {
  // console.log(sel);
  if (sel.points_a[1] != sel.points_b[1]) {
    return "❌ 请选择一个水平面";
  }
  let point_a = { x: null, y: sel.points_a[1], z: null };
  let point_b = { x: null, y: sel.points_b[1], z: null };
  if (sel.points_a[0] > sel.points_b[0]) {
    point_a.x = sel.points_b[0];
    point_b.x = sel.points_a[0];
  } else {
    point_a.x = sel.points_a[0];
    point_b.x = sel.points_b[0];
  }
  if (sel.points_a[2] > sel.points_b[2]) {
    point_a.z = sel.points_b[2];
    point_b.z = sel.points_a[2];
  } else {
    point_a.z = sel.points_a[2];
    point_b.z = sel.points_b[2];
  }

  let startX = Number(point_a.x);
  let endX = Number(point_b.x);
  let startZ = Number(point_a.z);
  let endZ = Number(point_b.z);
  let y = point_a.y;

  // 确定遍历方向（从小到大）
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minZ = Math.min(startZ, endZ);
  const maxZ = Math.max(startZ, endZ);

  while (true) {
    let reverse = false; // 控制是否反向走（S型核心）

    // 遍历 X 轴（每一行）
    for (let x = minX; x <= maxX; x++) {
      // Z 轴根据 reverse 决定正向 / 反向（S型往返）
      if (!reverse) {
        // 正向走
        for (let z = minZ; z <= maxZ; z++) {
          let safemoveReturn = await safemove(bot, x, y, z)
          if (!safemoveReturn) {
            break;
          } else {
            safeLog(safemoveReturn);
          };
        }
      } else {
        // 反向走
        for (let z = maxZ; z >= minZ; z--) {
          let safemoveReturn = await safemove(bot, x, y, z)
          if (!safemoveReturn) {
            break;
          } else {
            safeLog(safemoveReturn);
          };
        }
      }
      // 切换方向（下一行反过来走）
      reverse = !reverse;
    }
  }

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
}

async function safemove(bot, x, y, z) {
  if (!await move(bot, x, y, z)) {
    return false;
  }

  await killItem(bot);

  await rightClickBlockFace(bot, [x, y, z]);

  await sleep(1);

  await setItemSlot(bot, 9);

  await rightClickBlockFace(bot, [x, y - 1, z]);

  plantNum++;

  return `✅ 已种植 ${plantNum} 个`;
  // safeLog(`✅ 已种植 ${plantNum} 个`);
}

async function killItem(bot) {
  let inv = getInventory(bot);

  let seed = { id: "sugar", name: "辣椒种子" };
  let fruit = { id: "apple", name: "火龙果" };

  // ==============================================
  // 修复点：每次移动后都重新获取最新种子列表，不丢种子
  // ==============================================
  let slotNum = 9;
  for (; slotNum <= 34; slotNum++) {
    inv = getInventory(bot);
    let seedIndex = findMatchingItems(inv, seed);
    let seedItem = seedIndex[slotNum - 9];

    // ==========================================
    // 优化点：如果当前槽位已经是种子了，就跳过！不移动！
    // ==========================================
    const currentSlotItem = inv.find((i) => i.slot === slotNum);
    const isCurrentSlotSeed = currentSlotItem
      ? currentSlotItem.id === seed.id && currentSlotItem.name === seed.name
      : false;

    if (isCurrentSlotSeed) {
      continue; // 已经是种子 → 跳过，不动
    }

    // 只有不是种子的槽位，才放种子
    if (seedItem) {
      await setItemSlot(bot, seedItem.slot);
      await setItemSlot(bot, slotNum);
      await sleep(80);
    }
  }

  inv = getInventory(bot);
  let fruitIndex = findMatchingItems(inv, fruit);

  if (fruitIndex.length > 0) {
    await setItemSlot(bot, fruitIndex[0].slot);

    if (bot.food < 20) {
      await sleep(500);
      await bot.activateItem();
      await sleep(2000);
    }

    await setItemSlot(bot, 35);
  }

  // 清空 36~44
  for (let i = 0; i < 9; i++) {
    await removeItem(bot, 36 + i);
  }
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
