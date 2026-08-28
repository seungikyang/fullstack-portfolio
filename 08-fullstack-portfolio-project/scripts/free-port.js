// Career Hub 개발 서버가 사용할 포트의 기존 수신 프로세스를 종료하는 스크립트
import { execFile as execFileCallback } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

// 콜백 방식 execFile을 await할 수 있는 Promise 방식으로 바꾼다.
const execFile = promisify(execFileCallback);

// lsof/fuser 결과에서 양의 정수 PID만 골라 중복 없이 반환한다.
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

// Windows netstat의 LISTENING 행 중 요청한 로컬 포트에 해당하는 PID만 찾는다.
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

// 조회 명령은 "찾은 프로세스 없음"을 종료 코드 1로 알릴 수 있어 빈 결과로 처리한다.
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

// macOS/Linux에서는 lsof를 먼저 쓰고, 설치되지 않았으면 fuser로 한 번 더 시도한다.
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

// 운영체제마다 포트를 확인하는 명령이 달라 여기서 분기한다.
async function findListeningPids(port) {
  if (process.platform === "win32") {
    const output = await runPidCommand("netstat", ["-ano", "-p", "tcp"]);
    return parseWindowsPids(output, port);
  }

  return findUnixPids(port);
}

// signal 0은 실제 종료 신호를 보내지 않고 프로세스 존재 여부만 확인한다.
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

// 먼저 정상 종료(SIGTERM)를 기다리고, 계속 살아 있을 때만 강제 종료(SIGKILL)한다.
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

// 명령행 첫 인자를 포트로 사용하고, 생략하면 Career Hub 웹 포트 3000을 고른다.
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

  // 안전을 위해 이 정리 스크립트 자신의 PID는 종료 대상에서 제외한다.
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

// 테스트에서 import할 때는 main을 실행하지 않고 파싱·종료 함수만 검증할 수 있게 한다.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`개발 포트를 정리하지 못했습니다. ${error.message}`);
    process.exitCode = 1;
  });
}
