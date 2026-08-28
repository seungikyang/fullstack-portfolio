// 학습 답안을 채우기 전에도 실행 가능한 프로그램 빌드와 문법을 검증하는 스크립트
// 실행 방법: 저장소 루트에서 `npm run verify:programs`
const { spawnSync } = require("node:child_process");

// Windows에서는 npm 명령이 npm.cmd(배치 파일)라서 호출 이름이 다르다. OS를 보고 골라 쓴다.
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

// 검증 목록. `node --check`는 파일을 실행하지 않고 문법만 확인하므로
// 학습자가 아직 빈칸을 다 채우지 않은 코드도 안전하게 검사할 수 있다.
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

// 목록의 검사를 순서대로 실행하고, 하나라도 실패하면 즉시 종료한다.
// (뒤의 결과와 섞이지 않게, 처음 실패한 원인만 화면에 남긴다)
for (const check of checks) {
  console.log(`\n[프로그램 검증] ${check.label}`);
  // spawnSync: 자식 프로세스를 실행하고 그 프로세스가 끝날 때까지 기다린다.
  const result = spawnSync(check.command, check.args, {
    cwd: __dirname + "/..", // scripts/가 아니라 저장소 루트에서 명령을 실행한다
    stdio: "inherit", // 자식 출력을 그대로 이 화면에 보여준다
  });

  // 프로세스 자체를 못 띄운 경우(명령 없음 등)
  if (result.error) {
    console.error(`${check.label} 실행에 실패했습니다.`, result.error.message);
    process.exit(1);
  }
  // 검사가 실패한 경우. 자식의 종료 코드를 그대로 넘겨 CI가 실패를 알 수 있게 한다.
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\n학습자 안전 프로그램 검증이 통과했습니다.");
