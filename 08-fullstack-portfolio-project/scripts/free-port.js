// 개발 화면의 문 번호(포트) 3000을 이미 쓰는 프로그램이 있으면 종료하는 실행 도구다.
// 운영체제에서 사용 중인 프로그램 번호(PID)를 찾고, 종료를 요청한 뒤 자리가 비었는지 확인한다.
import { execFile as execFileCallback } from "node:child_process";
import { realpathSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

// execFile은 운영체제 명령을 실행한다. promisify는 명령이 끝날 때까지 await로 기다리게 바꾼다.
const execFile = promisify(execFileCallback);

// 명령이 알려준 프로그램 번호 중 1 이상의 정수만 고르고, Set으로 중복 번호를 뺀다.
export function parsePids(output) {
  return [
    ...new Set(
      output
        .split(/\s+/)
        .map(Number)
        .filter((pid) => Number.isInteger(pid) && pid > 0)
    )
  ];
}

// Windows에서는 netstat로 사용 중인 문 번호를 찾는다. 요청을 기다리는(LISTENING) 행만 고른다.
export function parseWindowsPids(output, port) {
  const portSuffix = `:${port}`;
  const pids = output.split(/\r?\n/).flatMap((line) => {
    const columns = line.trim().split(/\s+/);
    const [protocol, localAddress, , state, pid] = columns;

    if (protocol !== "TCP" || state !== "LISTENING" || !localAddress?.endsWith(portSuffix)) {
      return [];
    }

    return [pid];
  });

  return parsePids(pids.join(" "));
}

// 명령이 종료 코드 1로 '사용 중인 프로그램 없음'을 알려주면 빈 결과로 처리한다.
async function runPidCommand(command, args) {
  try {
    const { stdout } = await execFile(command, args);
    return stdout;
  } catch (error) {
    if (error.code === 1) {
      return error.stdout || "";
    }

    throw error;
  }
}

// macOS/Linux에서는 lsof로 찾는다. 도구가 설치되지 않았으면 fuser로 다시 찾아본다.
async function findUnixPids(port) {
  try {
    const output = await runPidCommand("lsof", ["-nP", `-tiTCP:${port}`, "-sTCP:LISTEN"]);
    return parsePids(output);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    try {
      const output = await runPidCommand("fuser", ["-n", "tcp", String(port)]);
      return parsePids(output);
    } catch (fallbackError) {
      if (fallbackError.code === "ENOENT") {
        throw new Error("포트 확인 명령(lsof 또는 fuser)을 찾을 수 없습니다.", {
          cause: fallbackError
        });
      }

      throw fallbackError;
    }
  }
}

// Windows와 macOS/Linux는 조회 명령이 다르므로 실행 중인 운영체제에 맞는 방법을 고른다.
async function findListeningPids(port) {
  if (process.platform === "win32") {
    const output = await runPidCommand("netstat", ["-ano", "-p", "tcp"]);
    return parseWindowsPids(output, port);
  }

  return findUnixPids(port);
}

// 신호 번호 0은 '이 프로그램이 아직 있나요?'만 확인한다. 종료시키는 신호는 아니다.
function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") {
      return false;
    }

    throw error;
  }
}

// 먼저 SIGTERM으로 '정리하고 종료해주세요'를 알린다. 기다려도 실행 중이면 SIGKILL로 강제 종료한다.
export async function terminatePid(pid) {
  if (process.platform === "win32") {
    await execFile("taskkill", ["/PID", String(pid), "/T", "/F"]);
    return;
  }

  process.kill(pid, "SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (isRunning(pid)) {
    process.kill(pid, "SIGKILL");
  }
}

// 명령 뒤에 적은 첫 숫자를 문 번호로 사용한다. 생략하면 개발 화면의 3000번을 사용한다.
async function main() {
  const port = Number(process.argv[2] || 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("1부터 65535 사이의 포트 번호가 필요합니다.");
  }

  // 컨테이너처럼 다른 프로세스를 종료하면 안 되는 환경은 명시적으로 건너뛸 수 있다.
  if (process.env.SKIP_DEV_PORT_CLEANUP === "true") {
    console.log(`${port}번 포트 정리를 건너뜁니다.`);
    return;
  }

  // 자기 자신의 프로그램 번호는 종료 목록에서 빼서 정리 도구가 스스로 멈추지 않게 한다.
  const pids = (await findListeningPids(port)).filter((pid) => pid !== process.pid);

  if (pids.length === 0) {
    console.log(`${port}번 포트를 사용할 수 있습니다.`);
    return;
  }

  for (const pid of pids) {
    await terminatePid(pid);
  }

  console.log(`${port}번 포트를 사용 중이던 프로세스(PID ${pids.join(", ")})를 종료했습니다.`);
}

// 자동 검사에서 import할 때는 main을 실행하지 않는다. 실제 프로그램을 종료하지 않고 함수를 검사한다.
// 링크된 폴더에서 실행해도 알아보도록 실행 경로를 실제 경로로 바꿔서 비교한다.
function isEntryPoint() {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  main().catch((error) => {
    console.error(`개발 포트를 정리하지 못했습니다. ${error.message}`);
    process.exitCode = 1;
  });
}
