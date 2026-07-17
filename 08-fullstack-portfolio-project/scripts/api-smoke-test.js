// Career Hub API의 인증과 CRUD 흐름을 자동으로 확인하는 smoke test 파일
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 5300 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;
const tempDir = await mkdtemp(path.join(os.tmpdir(), "career-hub-test-"));
const dataFile = path.join(tempDir, "test-data.json");

let logs = "";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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

async function waitForServer() {
  const deadline = Date.now() + 8000;

  while (Date.now() < deadline) {
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

try {
  await waitForServer();
  await request("/api/me", { expected: 401 });

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
  assert(dashboard.readinessPercent === 100, "취업 준비도 계산이 올바르지 않습니다.");

  await request(`/api/projects/${project.id}`, {
    method: "PATCH",
    token,
    body: {
      status: "완료"
    }
  });

  await request(`/api/applications/${application.id}`, { method: "DELETE", token, expected: 204 });
  await request(`/api/projects/${project.id}`, { method: "DELETE", token, expected: 204 });

  const applications = await request("/api/applications", { token });
  const projects = await request("/api/projects", { token });
  assert(applications.length === 0, "지원 기록 삭제가 반영되지 않았습니다.");
  assert(projects.length === 0, "프로젝트 삭제가 반영되지 않았습니다.");

  console.log("Career Hub API smoke test가 통과했습니다.");
} finally {
  server.kill("SIGTERM");
  await rm(tempDir, { recursive: true, force: true });
}
