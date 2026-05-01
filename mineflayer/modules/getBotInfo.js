export function getBotInfo(bot) {
    return {
        name: bot.username,
        position: bot.player.entity.position,
        health: bot.health,
        food: bot.food,
        foodSaturation: bot.foodSaturation
    };
}
