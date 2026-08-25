// Career Hub 개발 서버가 사용할 포트의 기존 수신 프로세스를 종료하는 스크립트
import { execFile as execFileCallback } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

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

async function findListeningPids(port) {
  if (process.platform === "win32") {
    const output = await runPidCommand("netstat", ["-ano", "-p", "tcp"]);
    return parseWindowsPids(output, port);
  }

  return findUnixPids(port);
}

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

async function main() {
  const port = Number(process.argv[2] || 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("1부터 65535 사이의 포트 번호가 필요합니다.");
  }

  if (process.env.SKIP_DEV_PORT_CLEANUP === "true") {
    console.log(`${port}번 포트 정리를 건너뜁니다.`);
    return;
  }

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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`개발 포트를 정리하지 못했습니다. ${error.message}`);
    process.exitCode = 1;
  });
}
