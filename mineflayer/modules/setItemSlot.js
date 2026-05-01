/**
 * 交换 bot 手中物品 与 指定背包槽位 的物品（支持空气/空槽）
 * @param {object} bot - mineflayer bot 实例
 * @param {number} slot - 要交换的背包槽位（快捷栏 0-8，背包 9-35 等）
 * @returns {Promise<void>}
 */
export async function setItemSlot(bot, slot) {
  // 获取当前鼠标选中的槽位（手中物品槽）
  const heldSlot = bot.quickBarSlot + 36; // 快捷栏转背包真实槽位

  // 安全判断
  if (heldSlot === slot) return;
  if (!bot.inventory) return;

  try {
    // ==============================
    // 真正发包交换（游戏内会同步）
    // ==============================
    await bot.clickWindow(heldSlot, 0, 0);  // 拿起手中物品
    await bot.clickWindow(slot, 0, 0);      // 放到目标槽
    await bot.clickWindow(heldSlot, 0, 0);  // 把原来的物品拿回手中
  } catch (err) {
    return ('交换物品失败:', err.message);
  }
}