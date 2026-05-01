/**
 * 丢弃指定槽位的所有物品
 * @param {object} bot - mineflayer 机器人实例
 * @param {number} slot - 要丢弃的物品槽位号
 */
export async function removeItem(bot, slot) {
  if (slot == "all") {
    // 丢弃所有物品
    for (let i = 9; i < 44; i++) {
      try {
        // 获取该槽位的物品
        const item = await bot.inventory.slots[i];
        // 如果槽位为空，直接返回
        if (!item) {
          continue;
        }
        // 执行丢弃操作（丢弃该槽位所有物品）
        await bot.tossStack(item);
        continue
      } catch (err) {
        continue
      }
    }
    return `已成功丢弃所有物品`;
  }
  try {
    slot = Number(slot);
    // 获取该槽位的物品
    const item = bot.inventory.slots[slot];
    
    // 如果槽位为空，直接返回
    if (!item) {
      return `槽位 ${slot} 没有物品，无需丢弃`;
    }

    // 执行丢弃操作（丢弃该槽位所有物品）
    await bot.tossStack(item);
    return `已成功丢弃槽位 ${slot} 的物品: ${item.name} (数量: ${item.count})`;
  } catch (err) {
    return `丢弃槽位 ${slot} 物品失败: ${err}`;
  }
}