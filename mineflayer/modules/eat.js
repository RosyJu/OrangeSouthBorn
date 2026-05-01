import {getInventory} from './getInventory.js';
import {setItemSlot} from './setItemSlot.js';

export async function eat(bot,food) {
  const inv = await getInventory(bot);
  bot.setQuickBarSlot(8)
  if (bot.food < 20) {
    const foodItems = findMatchingItems(inv, {id: food});
    if (foodItems.length > 0) {
      await setItemSlot(bot, foodItems[0].slot);
      bot.activateItem();
      await sleep(2000);
    }
  } else {
    return "已饱食，无需进食！";
  }
}

/**
 * 从物品数组中找到匹配条件的所有元素
 * @param {Array} items 物品数组（你的背包/箱子物品）
 * @param {Object} condition 匹配条件（如 { id: 'apple', name: '大蒜' }）
 * @returns {Array} 匹配到的元素数组
 */
function findMatchingItems(items, condition) {
  return items.filter(item => {
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
