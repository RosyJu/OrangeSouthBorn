// const format = (level,msg) => {
//   return `${level.toUpperCase()} ${msg}`;

// }

let raw = false

const levels = {
    info: "\x1b[37m",
    error: "\x1b[31m",
    warn: "\x1b[33m",
    debug: "\x1b[90m",
}

function format(level,msg) {
  if (!levels[level]) {
    level = "error"
    msg = "未知等级level"
  }
  return `[${date()}] ${levels[level]}[${level}] - ${msg}\x1b[0m`;
}

function date() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
}
const info = Object.assign(
  (msg) => {
    if (raw) {
        console.log(`\n${format("info", msg)}`)
        raw = false
    } else {
        console.log(format("info", msg))
    }
    },
  { raw: (msg) => {
    msg = format("info", msg);
    process.stdout.write('\r' + msg);
    raw = true
  }}
);

const error = Object.assign(
  (msg) => {
    if (raw) {
        console.log(`\n${format("error", msg)}`)
        raw = false
    } else {
        console.log(format("error", msg))
    }
    },
  { raw: (msg) => {
    msg = format("error", msg);
    process.stdout.write('\r' + msg);
    raw = true
  }}
);

const warn = Object.assign(
  (msg) => {
    if (raw) {
        console.log(`\n${format("warn", msg)}`)
        raw = false
    } else {
        console.log(format("warn", msg))
    }
    },
  { raw: (msg) => {
    msg = format("warn", msg);
    process.stdout.write('\r' + msg);
    raw = true
  }}
);

const debug = Object.assign(
  (msg) => {
    if (raw) {
        console.log(`\n${format("debug", msg)}`)
        raw = false
    } else {
        console.log(format("debug", msg))
    }
    },
  { raw: (msg) => {
    msg = format("debug", msg);
    process.stdout.write('\r' + msg);
    raw = true
  }}
);

// const createLog = Object.assign(
//   (msg) => console.log(format("debug", msg)),
//   { raw: (msg) => {
//     const msg = format("debug", msg);
//     process.stdout.write('\r' + msg);
//   }}
// );

module.exports = {
  info,
  error,
  warn,
  debug
};