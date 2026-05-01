const mineflayer = require("mineflayer");
const readline = require("readline");

const sel = require("../modules/sel.js");

// 全局实例
let bot = null;
let rl = null;

// ====================== 主函数 ======================
async function main() {
  // 先清理旧机器人 + 旧监听
  if (bot) {
    bot.removeAllListeners();
    bot.end();
  }

  // 创建新机器人
  bot = mineflayer.createBot({
    auth: "microsoft",
    username: "1933729053@qq.com",
    host: "w28.kkwmc.cn",
    port: 7088,
    version: "",
    hideErrors: true,
  });

  // 资源包自动接受
  bot.on("resourcePack", (url, hash) => {
    log("📦 收到资源包，自动接受");
    bot.acceptResourcePack();
  });

  bot._client.on("add_resource_pack", (data) => {
    log("📦 收到资源包（新版 1.21+ 协议）");
    bot._client.write("resource_pack_receive", {
      uuid: data.uuid,
      result: 0,
    });
  });

  // 登录成功
  bot.on("login", () => {
    log("✅ 登录成功！正在进入服务器...");
  });

  // ✅ 关键：只有进入服务器后，才初始化输入权限
  bot.on("spawn", () => {
    log("🎉 机器人已进入服务器！现在可以输入指令");
    initConsoleInput(); // 启用输入
  });

  // 服务器聊天日志
  bot.on("message", (msg) => {
    if (
      msg
        .toString()
        .trim()
        .match(/^(\d+)\/(\d+) players sleeping$/)
    ) {
      return;
    }
    if (
      msg
        .toString()
        .trim()
        .match(/^.+ has made the advancement \[.+]$/)
    ) {
      return;
    }
    console.log(msg.toAnsi());
  });

  // 错误 → 重连
  bot.on("error", (err) => {
    log("❌ 触发不可预知的错误 : 准备重连");

    // 其他错误才重连
    log("🔄 3秒后自动重连...");
    destroyConsoleInput(); // 销毁输入
    bot.end();
    setTimeout(main, 3000);
  });

  // 断开连接
  bot.on("end", () => {
    log("❌ 已断开连接");
    destroyConsoleInput(); // 销毁输入
  });

  // 被踢出
  bot.on("kicked", (reason) => {
    log("🚫 被服务器踢出：" + reason);
    destroyConsoleInput();
    bot.end();
    setTimeout(main, 3000);
  });
}

// ====================== 控制台输入（只在 spawn 后启用）======================
function initConsoleInput() {
  // 先销毁旧的
  // if (rl) {
  //   rl.removeAllListeners();
  // }
  destroyConsoleInput();

  // 创建 readline
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  rl.setPrompt("> ");
  rl.prompt();

  // 发送指令
  rl.on("line", (text) => {
    const t = text.trim();
    if (!t) return rl.prompt();

    // 只有 bot 存在且在线，才能发送
    if (bot && bot._client && !bot._client.destroyed) {
      // console.log("【发送】:", t);
      if (!checkCommand(t)) {
        return;
      }
      try {
        bot.chat(t);
      } catch {}
    } else {
      log("⚠️ 机器人未在线，无法发送");
    }

    rl.prompt();
  });
}

// 销毁输入（机器人关闭时调用）
function destroyConsoleInput() {
  if (rl) {
    rl.removeAllListeners();
    rl.close();
    rl = null;
  }
}

// ====================== 安全日志 ======================
function log(msg) {
  if (rl) {
    // 先清空当前输入行 → 关键修复
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  // 输出日志
  console.log(msg);

  // 重新显示输入框和用户正在输入的内容
  if (rl) rl.prompt(true);
}

// 启动
main();

const checkCommand = (text) => {
  if (!text.startsWith("/")) {
    return false;
  }
  text = parseCommand(text);
  switch (text[0]) {
    case "sel":
      if (text[1] == "value") {
        log(`角点1: ${sel.value.points_a[0]} ${sel.value.points_a[1]} ${sel.value.points_a[2]}`);
        log(`角点2: ${sel.value.points_b[0]} ${sel.value.points_b[1]} ${sel.value.points_b[2]}`);
        log(`区域大小: ${sel.value.points_b[0] - sel.value.points_a[0] + 1} * ${sel.value.points_b[1] - sel.value.points_a[1] + 1} * ${sel.value.points_b[2] - sel.value.points_a[2] + 1} = ${((sel.value.points_b[0] - sel.value.points_a[0] + 1) * (sel.value.points_b[1] - sel.value.points_a[1] + 1) * (sel.value.points_b[2] - sel.value.points_a[2] + 1))}`);
      } else {
        log(sel.set([text[1], text[2], text[3]], [text[4], text[5], text[6]]));
      }
      break;
    case "end":
      bot.end();
      // log("✅ 重启中...");
      // bot.once('end', () => {
      //   setTimeout(main, 1);
      // });
      break;
    case "restart":
      rl = null;
      bot.end();
      // log("✅ 重启中...");
      // rl.removeAllListeners();
      bot.once('end', () => {
        log("✅ 重启中...");
        setTimeout(main, 500);
      });
      break;
    default:
      return true;
  }
};

function parseCommand(str) {
  // 空值保护
  if (!str || typeof str !== "string") {
    return [];
  }

  // 1. 去掉开头的 /（如果有）
  const trimmed = str.startsWith("/") ? str.slice(1) : str;

  // 2. 去除首尾空格 + 按【任意空格】分割成数组
  const args = trimmed.trim().split(/\s+/);

  // 3. 过滤空字符串（防止极端情况）
  return args.filter(Boolean);
}
