// 개발 포트 점유 프로세스 출력에서 정확한 PID를 찾는 동작을 검증하는 테스트
import { spawn } from "node:child_process";
import { once } from "node:events";
import process from "node:process";
import { describe, expect, it } from "vitest";
import { parsePids, parseWindowsPids, terminatePid } from "./free-port.js";

describe("개발 포트 PID 파서", () => {
  it("Unix 명령의 PID를 중복 없이 반환한다", () => {
    expect(parsePids("1234\n5678\n1234\n")).toEqual([1234, 5678]);
  });

  it("Windows netstat에서 정확히 3000번을 수신하는 PID만 반환한다", () => {
    const output = [
      "TCP    0.0.0.0:3000       0.0.0.0:0       LISTENING       1234",
      "TCP    127.0.0.1:30000    0.0.0.0:0       LISTENING       5678",
      "TCP    [::]:3000          [::]:0          LISTENING       1234",
      "TCP    127.0.0.1:3000     127.0.0.1:50000 ESTABLISHED     9999"
    ].join("\r\n");

    expect(parseWindowsPids(output, 3000)).toEqual([1234]);
  });

  it("테스트가 만든 대기 프로세스를 종료한다", async () => {
    const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
      stdio: "ignore"
    });
    await once(child, "spawn");

    try {
      await terminatePid(child.pid);

      if (child.exitCode === null && child.signalCode === null) {
        await once(child, "exit");
      }

      expect(child.exitCode !== null || child.signalCode !== null).toBe(true);
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL");
      }
    }
  });
});
