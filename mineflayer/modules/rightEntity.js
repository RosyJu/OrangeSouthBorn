export async function rightEntity(bot, e) {
  // 示例：找 10 格内最近的 item_display
  const maxRange = 3; // 最大搜索半径（格）
  const nearestInRange = bot.nearestEntity((entity) => {
    // 1. 先匹配实体类型
    // console.log(entity)
    const isTarget = entity.name === e;
    if (!isTarget) return false;

    // 2. 再判断距离是否在范围内
    const dist = bot.entity.position.distanceTo(entity.position);
    return dist <= maxRange;
  });

  return nearestInRange;
}