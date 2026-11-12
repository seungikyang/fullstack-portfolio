// 회원가입부터 기록 추가·수정·삭제까지 실제 서버에 요청해서 확인하는 자동 검사 도구다.
// smoke test는 핵심 기능이 이어서 동작하는지 빠르게 확인하는 검사다.
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 실제 저장 기록을 건드리지 않도록 검사 전용 문 번호(포트)와 임시 자료 파일을 사용한다.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 5300 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;
const tempDir = await mkdtemp(path.join(os.tmpdir(), "career-hub-test-"));
const dataFile = path.join(tempDir, "test-data.json");

let logs = "";

// assert는 '예상한 결과가 맞는가?'를 확인한다. 맞지 않으면 이유와 함께 검사를 멈춘다.
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// 같은 요청 방법을 반복하지 않도록 한곳에 모았다. 서버의 상태 코드가 예상한 숫자인지도 확인한다.
async function request(pathname, { method = "GET", token, body, expected = 200 } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status !== expected) {
    const text = await response.text();
    throw new Error(`${method} ${pathname} expected ${expected}, got ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// 서버가 준비되기 전에 검사를 시작하면 실패한다. '서버가 살아 있나요?'라고 최대 8초 동안 확인한다.
async function waitForServer() {
  const deadline = Date.now() + 8000;

  while (Date.now() < deadline) {
    // 검사 서버가 꺼졌다면(예: 포트가 이미 사용 중) 같은 포트의 다른 서버에 요청하지 않도록 멈춘다.
    if (server.exitCode !== null) {
      throw new Error(`검사 서버가 시작하지 못하고 종료했습니다.\n${logs}`);
    }

    try {
      const health = await request("/api/health");
      if (health.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw new Error(`서버가 시간 안에 시작하지 않았습니다.\n${logs}`);
}

// 지금 쓰는 Node로 검사할 서버 프로그램을 따로 실행한다. 현재 검사는 요청을 보내는 역할을 한다.
const server = spawn(process.execPath, ["server/index.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    DATA_FILE: dataFile,
    JWT_SECRET: "smoke-test-secret",
    SEED_DEMO: "false",
    CLIENT_ORIGIN: "http://localhost:3000"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});

server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

// 검사 순서: 서버 준비 → 가입·로그인 → 워크북 저장 → 지원·프로젝트 추가·수정·삭제 → 준비도 확인.
try {
  await waitForServer();
  // 로그인 확인표가 없는 사람이 내 정보 창구를 열려고 하면 거절해야 한다.
  await request("/api/me", { expected: 401 });

  // 회원가입 뒤 확인표를 받는지, 비밀번호 해시는 화면에 보내지 않는지 확인한다.
  const register = await request("/api/auth/register", {
    method: "POST",
    expected: 201,
    body: {
      name: "테스트 사용자",
      email: "test@example.com",
      password: "password123"
    }
  });

  assert(register.token, "회원가입 응답에 토큰이 없습니다.");
  assert(!register.user.passwordHash, "회원가입 응답에 passwordHash가 노출되었습니다.");

  // 틀린 비밀번호에는 401(로그인 확인 실패), 맞는 비밀번호에는 확인표가 와야 한다.
  await request("/api/auth/login", {
    method: "POST",
    expected: 401,
    body: {
      email: "test@example.com",
      password: "wrong-password"
    }
  });

  const login = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: "test@example.com",
      password: "password123"
    }
  });

  const token = login.token;
  // 새 계정의 워크북은 빈 값인지, 수정 요청(PATCH)을 보내면 입력이 저장되는지 확인한다.
  const initialWorkbook = await request("/api/workbook", { token });
  assert(initialWorkbook.targetRole === "", "새 워크북의 목표 직무가 비어 있지 않습니다.");

  const workbook = await request("/api/workbook", {
    method: "PATCH",
    token,
    body: {
      targetRole: "Java 백엔드 개발자",
      targetDate: "2026-09-01",
      weeklyGoal: "지원서 두 곳 제출",
      nextAction: "첫 공고 분석",
      resumeReady: true,
      portfolioReady: true,
      selfIntroReady: true,
      mockInterviewReady: true,
      reflection: "API smoke test로 저장을 확인했습니다."
    }
  });

  assert(workbook.targetRole === "Java 백엔드 개발자", "워크북 저장이 반영되지 않았습니다.");

  // 지원 기록을 추가한 뒤 일부를 고친다. 'React, Java'가 기술 이름 목록으로 바뀌는지도 확인한다.
  const application = await request("/api/applications", {
    method: "POST",
    token,
    expected: 201,
    body: {
      company: "테스트 SI",
      role: "풀스택 개발자",
      status: "지원완료",
      dueDate: "2026-06-01",
      stack: "React, Express",
      priority: "높음",
      memo: "smoke test"
    }
  });

  assert(application.id, "지원 기록 id가 없습니다.");
  assert(application.stack.length === 2, "지원 기록 stack 파싱이 실패했습니다.");

  const patchedApplication = await request(`/api/applications/${application.id}`, {
    method: "PATCH",
    token,
    body: {
      status: "면접"
    }
  });

  assert(patchedApplication.status === "면접", "지원 기록 수정이 반영되지 않았습니다.");

  // 프로젝트를 추가하고 대시보드가 두 종류의 기록 개수를 반영하는지 확인한다.
  const project = await request("/api/projects", {
    method: "POST",
    token,
    expected: 201,
    body: {
      name: "Career Hub",
      summary: "취업 준비 fullstack 앱",
      status: "개발중",
      stack: "React, Node.js, JWT",
      highlight: "인증과 CRUD를 검증했습니다."
    }
  });

  const dashboard = await request("/api/dashboard", { token });
  assert(dashboard.totalApplications === 1, "대시보드 지원 건수가 올바르지 않습니다.");
  assert(dashboard.projectCount === 1, "대시보드 프로젝트 건수가 올바르지 않습니다.");

  // 프로젝트 완료와 준비 항목을 갖추면 네 단계 준비도가 100%가 되어야 한다.
  await request(`/api/projects/${project.id}`, {
    method: "PATCH",
    token,
    body: {
      status: "완료"
    }
  });

  const completedDashboard = await request("/api/dashboard", { token });
  assert(completedDashboard.readinessPercent === 100, "취업 준비도 계산이 올바르지 않습니다.");

  // 생성한 자료를 삭제하고 목록에서 실제로 사라졌는지까지 확인한다.
  await request(`/api/applications/${application.id}`, { method: "DELETE", token, expected: 204 });
  await request(`/api/projects/${project.id}`, { method: "DELETE", token, expected: 204 });

  const applications = await request("/api/applications", { token });
  const projects = await request("/api/projects", { token });
  assert(applications.length === 0, "지원 기록 삭제가 반영되지 않았습니다.");
  assert(projects.length === 0, "프로젝트 삭제가 반영되지 않았습니다.");

  console.log("Career Hub API smoke test가 통과했습니다.");
} finally {
  // 중간에 검사가 실패했어도 finally는 실행된다. 검사 서버를 종료하고 임시 자료를 지운다.
  server.kill("SIGTERM");
  await rm(tempDir, { recursive: true, force: true });
}
