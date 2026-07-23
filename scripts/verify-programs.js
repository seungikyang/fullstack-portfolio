// 학습 답안을 채우기 전에도 실행 가능한 프로그램 빌드와 문법을 검증하는 스크립트
const { spawnSync } = require("node:child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const checks = [
  {
    command: npmCommand,
    args: ["run", "build", "--prefix", "03-react-todo"],
    label: "03 React production build",
  },
  {
    command: process.execPath,
    args: ["--check", "02-javascript-basics/starter/app.js"],
    label: "02 JavaScript syntax",
  },
  {
    command: process.execPath,
    args: ["--check", "04-node-board-api/src/server.js"],
    label: "04 Node API syntax",
  },
  {
    command: process.execPath,
    args: ["--check", "05-database-mongodb/src/server.js"],
    label: "05 MongoDB API syntax",
  },
  {
    command: process.execPath,
    args: ["--check", "06-login-auth/src/server.js"],
    label: "06 authentication API syntax",
  },
  {
    command: process.execPath,
    args: ["--check", "07-project-deploy/src/server.js"],
    label: "07 deployment server syntax",
  },
  {
    command: process.execPath,
    args: ["--check", "07-project-deploy/public/app.js"],
    label: "07 browser script syntax",
  },
  {
    command: npmCommand,
    args: ["run", "check", "--prefix", "16-security"],
    label: "16 security starter syntax",
  },
];

for (const check of checks) {
  console.log(`\n[프로그램 검증] ${check.label}`);
  const result = spawnSync(check.command, check.args, {
    cwd: __dirname + "/..",
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`${check.label} 실행에 실패했습니다.`, result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\n학습자 안전 프로그램 검증이 통과했습니다.");
