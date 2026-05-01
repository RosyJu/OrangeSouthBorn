import mcData from 'minecraft-data';

/**
 * 获取机器人背包物品（仅返回名称、数量、槽位）
 * @param {object} bot - mineflayer 机器人实例
 * @returns {Array} 物品列表 [{ name, count, slot }]
 */
export function getInventory(bot) {
  try {
    const data = mcData(bot.version);
    const items = [];
    // console.log(data.items)
    for (const slot of bot.inventory.slots) {
      if (!slot) continue;

      const itemInfo = data.items[slot.type];
      // console.log(slot)
      let name = JSON.stringify(slot.components.find(c => c.type === 'custom_name')?.data) || JSON.stringify(slot.components.find(c => c.type === 'item_name')?.data) || 0
      let temp = {
        id: itemInfo?.name || `unknown`,
        count: slot.count,
        slot: slot.slot,
        // customName: JSON.stringify(slot.components.find(c => c.type === 'custom_name')?.data) || JSON.stringify(slot.components.find(c => c.type === 'item_name')?.data) ||`unknown`,
        // name: name ? extractText(JSON.parse(name)) : `unknown`
      }
      if (name) {
        temp.name = extractText(JSON.parse(name))
      }
      items.push(temp);
    }
    return items;
  } catch (err) {
    return ('获取背包失败:', err);
    // return [];
  }
}

function extractText(nbtData) {
  let result = '';

  function traverse(obj) {
    if (!obj || typeof obj !== 'object') return;

    // 1. 处理普通 text
    if (obj.text && obj.text.type === 'string' && obj.text.value) {
      result += obj.text.value;
    }

    // 2. 处理翻译键（保留！）
    if (obj.translate && obj.translate.value) {
      result += `[${obj.translate.value}]`;
    }

    // 3.  compound 结构
    if (obj.value) {
      traverse(obj.value);
    }

    // 4. extra 列表
    if (obj.extra && obj.extra.value) {
      traverse(obj.extra.value);
    }

    // 5. 数组
    if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item));
    }

    // 🔥 【删除了造成无限重复的全局遍历】 这就是核心BUG！
  }

  traverse(nbtData);
  return result.trim();
}