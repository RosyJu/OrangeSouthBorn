process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const mineflayer = require("mineflayer");
const readline = require("readline");
const consola = require("consola");
const rightblock = require("../modules/rightBlock");
const sel = require("../modules/sel");
const config = require("../modules/config");
const getInventory = require("../modules/getInventory");
const setItemSlot = require("../modules/setItemSlot");
const removeItem = require("../modules/removeItem");
const move = require("../modules/move");
const getBlockInfo = require("../modules/getBlockInfo");
const breakBlock = require("../modules/breakBlock");
const getBotInfo = require("../modules/getBotInfo");
const eat = require("../modules/eat");
const getItemInfo = require("../modules/getItemInfo");
const rightEntity = require("../modules/rightEntity");

const script = {
  customcrops: require("../script/customcrops"),
  customcrops2: require("../script/customcrops2"),
};

let bot = null;
let rl = null; // 全局唯一输入实例
let isRestarting = false;

// ==============================================
// 安全日志
// ==============================================
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

// ==============================================
// 彻底销毁所有（包括 RL）
// ==============================================
function destroyAll() {
  try {
    // 1. 销毁输入框（完全关闭）
    if (rl) {
      rl.close();
      rl = null;
    }

    // 2. 销毁机器人
    if (bot) {
      bot.removeAllListeners();
      bot.end();
      bot = null;
    }

    // 3. 清进程监听
    process.removeAllListeners();
  } catch (e) {}
}

// ==============================================
// 全新创建输入框（每次重启都调用）
// ==============================================
function createInput() {
  // 先确保旧的已经死了
  if (rl) {
    rl.close();
    rl = null;
  }

  // 全新创建
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: " >>> ",
  });

  rl.prompt();

  rl.on("line", async (input) => {
    const cmd = input.trim();
    if (cmd && bot && bot._client) {
      const ok = await checkCommand(cmd);
      if (!ok) {
        bot.chat(cmd);
      }
    }
    rl.prompt();
  });

  rl.on("close", () => {
    if (!isRestarting) process.exit(0);
  });
}

// ==============================================
// 主程序
// ==============================================
async function main() {
  destroyAll();
  isRestarting = false;

  bot = mineflayer.createBot(config.value);

  bot.on("resourcePack", () => {
    safeLog("📦 自动接受资源包");
    bot.acceptResourcePack();
  });

  bot._client.on("add_resource_pack", (data) => {
    bot._client.write("resource_pack_receive", {
      uuid: data.uuid,
      result: 0,
    });
  });

  bot.on("login", () => {
    safeLog("✅ 登录成功！正在进入服务器...");
  });

  bot.on("spawn", () => {
    safeLog("🎉 机器人已进入服务器！可输入指令");
    createInput(); // 每次出生都全新创建输入

    setTimeout(() => {
      autoStart(bot);
    }, 5000); // 5000 毫秒 = 5 秒
  });

  bot.on("message", (msg) => {
    const text = msg.toString().trim();
    if (text.match(/players sleeping|advancement/)) return;
    safeLog(msg.toAnsi());
  });

  bot.on("error", (err) => {
    safeLog("❌ 错误：" + err.message);
  });

  bot.on("end", () => {
    safeLog("❌ 已断开连接");
    restart();
  });

  bot.on("kicked", (reason) => {
    safeLog("🚫 被服务器踢出：" + JSON.stringify(reason));
  });
}

// ==============================================
// 重启
// ==============================================
function restart() {
  if (isRestarting) return;
  isRestarting = true;

  safeLog("🔄 完全重启中...");

  setTimeout(() => {
    main();
  }, 600);
}

// ==============================================
// 命令
// ==============================================
async function checkCommand(text) {
  if (!text.startsWith("/")) return false;
  const args = parseCommand(text);

  switch (args[0]) {
    case "sel":
      if (args[1] === "value") {
        safeLog(
          `角点1: ${sel.value.points_a[0]} ${sel.value.points_a[1]} ${sel.value.points_a[2]}`,
        );
        safeLog(
          `角点2: ${sel.value.points_b[0]} ${sel.value.points_b[1]} ${sel.value.points_b[2]}`,
        );
        const x = Math.abs(sel.value.points_b[0] - sel.value.points_a[0]) + 1;
        const y = Math.abs(sel.value.points_b[1] - sel.value.points_a[1]) + 1;
        const z = Math.abs(sel.value.points_b[2] - sel.value.points_a[2]) + 1;
        safeLog(`区域大小: ${x} * ${y} * ${z} = ${x * y * z}`);
      } else {
        safeLog(
          sel.set([args[1], args[2], args[3]], [args[4], args[5], args[6]]),
        );
      }
      return true;

    case "end":
      bot.end();
      return true;

    case "restart":
      restart();
      return true;

    case "rightblock":
      rightblock.rightClickBlockFace(bot, [args[1], args[2], args[3]], args[4]);
      return true;

    case "inv":
      safeLog(getInventory.getInventory(bot));
      return true;

    case "hold":
      safeLog(setItemSlot.setItemSlot(bot, Number(args[1])));
      return true;

    case "remove":
      safeLog(removeItem.removeItem(bot, args[1]));
      return true;

    case "move":
      safeLog(
        move.move(bot, Number(args[1]), Number(args[2]), Number(args[3])),
      );
      return true;

    case "getitem":
      safeLog(getItemInfo.getItemInfo(bot));
      return true;

    case "getblock":
      safeLog(
        getBlockInfo.getBlockInfo(
          bot,
          Number(args[1]),
          Number(args[2]),
          Number(args[3]),
        ),
      );
      return true;

    case "break":
      safeLog(
        breakBlock.breakBlock(bot, [
          Number(args[1]),
          Number(args[2]),
          Number(args[3]),
        ]),
      );
      return true;

    case "info":
      safeLog(getBotInfo.getBotInfo(bot));
      return true;

    case "eat":
      safeLog(eat.eat(bot, args[1]));
      return true;

    case "rightentity":
      safeLog(await rightEntity.rightEntity(bot, args[1]));
      return true;

    case "script":
      switch (args[1]) {
        case "customcrops":
          safeLog(script.customcrops.customCrops(bot, sel.value, rl));
          break;
        case "customcrops2":
          safeLog(
            script.customcrops2.customcrops(
              bot,
              { point: { x: -108636, y: 271, z: 137763 }, x: 9, z: 15 },
              3,
              rl,
            ),
          );
          break;
        default:
          safeLog("❌ 未找到该脚本");
          break;
      }
      return true;

    default:
      return false;
  }
}

function parseCommand(str) {
  if (!str || typeof str !== "string") return [];
  const trimmed = str.startsWith("/") ? str.slice(1) : str;
  return trimmed.trim().split(/\s+/).filter(Boolean);
}

async function autoStart(bot) {
  try {
    await script.customcrops2.customcrops(
      bot,
      { point: { x: -108636, y: 271, z: 137763 }, x: 9, z: 15 },
      3,
      rl,
    );
  } catch (error) {
    bot.end();
    safeLog(`发生错误 : ${error.message}`);
    return;
  }
}

main();
