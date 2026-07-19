// supertest를 이용한 Express 통합 테스트. 서버를 실제 listen 시키지 않고 createApp을 직접 호출한다.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./index.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

describe("Career Hub API", () => {
  let dir;
  let dataFile;
  let app;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), "career-hub-api-"));
    dataFile = join(dir, "data.json");
    process.env.SEED_DEMO = "false";
    app = await createApp({ dataFile });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("GET /api/health 는 ok 응답을 반환한다", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, service: "career-hub" });
  });

  it("운영 환경에서 JWT_SECRET이 없으면 앱 생성을 거부한다", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousJwtSecret = process.env.JWT_SECRET;
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;

    try {
      await expect(createApp({ dataFile: join(dir, "production-data.json") })).rejects.toThrow(
        /32자 이상의 안전한 JWT_SECRET/
      );
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      process.env.JWT_SECRET = previousJwtSecret;
    }
  });

  it("SEED_DEMO=true를 명시한 경우에만 데모 로그인이 가능하다", async () => {
    const payload = { email: "demo@careerhub.dev", password: "demo1234" };
    const disabledLogin = await request(app).post("/api/auth/login").send(payload);
    const previousSeedDemo = process.env.SEED_DEMO;

    try {
      process.env.SEED_DEMO = "true";
      const demoApp = await createApp({ dataFile: join(dir, "demo-data.json") });
      const enabledLogin = await request(demoApp).post("/api/auth/login").send(payload);

      expect(disabledLogin.status).toBe(401);
      expect(enabledLogin.status).toBe(200);
    } finally {
      process.env.SEED_DEMO = previousSeedDemo;
    }
  });

  it("인증 없이 보호 API를 호출하면 401을 반환한다", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  it("회원가입은 201과 토큰을 반환하며 passwordHash를 노출하지 않는다", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "테스터", email: "tester@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("배포 도메인과 같은 서버에서 보낸 Origin 요청도 회원가입을 처리한다", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Origin", "https://career-hub.fly.dev")
      .send({ name: "배포 사용자", email: "deploy@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("허용하지 않은 교차 출처의 preflight에는 CORS 허용 헤더를 보내지 않는다", async () => {
    const res = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://attacker.example")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).not.toBe(500);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("인증 요청이 15분에 20회를 넘으면 429를 반환한다", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      const limitedApp = await createApp({ dataFile: join(dir, "rate-limit-data.json") });
      const statuses = [];
      for (let attempt = 0; attempt < 21; attempt += 1) {
        const response = await request(limitedApp)
          .post("/api/auth/login")
          .send({ email: "missing@example.com", password: "password123" });
        statuses.push(response.status);
      }

      expect(statuses.slice(0, 20).every((status) => status === 401)).toBe(true);
      expect(statuses[20]).toBe(429);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("잘못된 JSON은 서버 오류가 아닌 400으로 분류한다", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send("{");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JSON 요청 본문/);
  });

  it("1MB를 넘는 JSON 본문은 413으로 분류한다", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ name: "가".repeat(1_100_000) }));

    expect(res.status).toBe(413);
    expect(res.body.message).toMatch(/1MB/);
  });

  it("같은 이메일로 두 번 가입하면 409를 반환한다", async () => {
    const payload = { name: "t", email: "dup@example.com", password: "password123" };
    await request(app).post("/api/auth/register").send(payload).expect(201);
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(409);
  });

  it("같은 이메일의 동시 가입은 하나만 저장하고 201과 409를 반환한다", async () => {
    const payload = { name: "동시 가입", email: "race@example.com", password: "password123" };
    const responses = await Promise.all([
      request(app).post("/api/auth/register").send(payload),
      request(app).post("/api/auth/register").send(payload)
    ]);
    const stored = JSON.parse(readFileSync(dataFile, "utf8"));

    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(stored.users.filter((user) => user.email === payload.email)).toHaveLength(1);
  });

  it("잘못된 비밀번호 로그인은 401을 반환한다", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "t", email: "user@example.com", password: "password123" })
      .expect(201);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("로그인 본문이 없으면 400 검증 오류를 반환한다", async () => {
    const res = await request(app).post("/api/auth/login");

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("올바른 이메일을 입력하세요.");
    expect(res.body.errors).toContain("비밀번호를 입력하세요.");
  });

  describe("인증된 사용자의 CRUD 흐름", () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "u", email: "u@example.com", password: "password123" });
      token = res.body.token;
    });

    it("지원 현황 생성 → 수정 → 삭제 라이프사이클이 동작한다", async () => {
      const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          company: "테스트 SI",
          role: "풀스택",
          status: "지원완료",
          priority: "높음",
          stack: "React, Express"
        })
        .expect(201);

      expect(created.body.stack).toEqual(["React", "Express"]);

      const patched = await request(app)
        .patch(`/api/applications/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "면접" })
        .expect(200);

      expect(patched.body.status).toBe("면접");

      await request(app)
        .delete(`/api/applications/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const list = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(list.body).toHaveLength(0);
    });

    it("필수 필드가 비면 400 검증 오류를 반환한다", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({ company: "", role: "", status: "지원완료" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it("존재하지 않는 application id 수정은 404를 반환한다", async () => {
      const res = await request(app)
        .patch("/api/applications/9999")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "면접" });

      expect(res.status).toBe(404);
    });

    it("취업 워크북을 조회하고 저장한다", async () => {
      const empty = await request(app)
        .get("/api/workbook")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(empty.body.targetRole).toBe("");

      const saved = await request(app)
        .patch("/api/workbook")
        .set("Authorization", `Bearer ${token}`)
        .send({
          targetRole: "Java 백엔드 개발자",
          targetDate: "2026-09-01",
          weeklyGoal: "지원서 두 곳 제출",
          resumeReady: true
        })
        .expect(200);

      expect(saved.body).toMatchObject({
        targetRole: "Java 백엔드 개발자",
        weeklyGoal: "지원서 두 곳 제출",
        resumeReady: true
      });
    });

    it("취업 워크북의 잘못된 체크 값은 400을 반환한다", async () => {
      const res = await request(app)
        .patch("/api/workbook")
        .set("Authorization", `Bearer ${token}`)
        .send({ resumeReady: "완료" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain("이력서 준비 상태가 올바르지 않습니다.");
    });

    it("대시보드는 현재 사용자의 카운트를 반환한다", async () => {
      await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          company: "A",
          role: "r",
          status: "면접",
          priority: "보통",
          stack: ""
        })
        .expect(201);

      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.totalApplications).toBe(1);
      expect(res.body.startedApplicationCount).toBe(1);
      expect(res.body.interviewCount).toBe(1);
      expect(res.body.readinessTotal).toBe(4);
      expect(res.body.readinessDone).toBe(0);
    });

    it("대시보드 준비도는 목표·실행·제출 자료·실제 지원의 네 단계를 계산한다", async () => {
      const workbookResponse = await request(app)
        .patch("/api/workbook")
        .set("Authorization", `Bearer ${token}`)
        .send({
          targetRole: "Java 백엔드 개발자",
          targetDate: "2026-09-01",
          weeklyGoal: "포트폴리오 검증",
          nextAction: "오늘 테스트 실행",
          resumeReady: true,
          portfolioReady: true,
          selfIntroReady: true,
          mockInterviewReady: true
        })
        .expect(200);
      const application = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          company: "A",
          role: "백엔드",
          status: "준비중",
          priority: "보통",
          stack: ""
        })
        .expect(201);
      const project = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Career Hub", summary: "취업 워크북", status: "개발중", stack: "" })
        .expect(201);

      expect(workbookResponse.body.targetRole).toBe("Java 백엔드 개발자");

      const inProgress = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(inProgress.body).toMatchObject({
        startedApplicationCount: 0,
        completedProjectCount: 0,
        readinessDone: 2,
        readinessTotal: 4,
        readinessPercent: 50
      });

      await request(app)
        .patch(`/api/applications/${application.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "지원완료" })
        .expect(200);
      await request(app)
        .patch(`/api/projects/${project.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "완료" })
        .expect(200);

      const completed = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(completed.body).toMatchObject({
        startedApplicationCount: 1,
        completedProjectCount: 1,
        readinessDone: 4,
        readinessTotal: 4,
        readinessPercent: 100
      });
    });
  });

  it("알 수 없는 /api 경로는 404를 반환한다", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("응답에 helmet의 보안 헤더가 포함된다", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers).toHaveProperty("x-frame-options");
  });

  it("응답에 X-Request-Id가 포함된다", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("클라이언트가 보낸 X-Request-Id는 그대로 echo된다", async () => {
    const traceId = "test-trace-id-123";
    const res = await request(app).get("/api/health").set("X-Request-Id", traceId);
    expect(res.headers["x-request-id"]).toBe(traceId);
  });

  it("GET /api/openapi.json은 OpenAPI 3 스펙을 반환한다", async () => {
    const res = await request(app).get("/api/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toBe("Career Hub API");
    expect(res.body.paths).toHaveProperty("/api/auth/login");
    expect(res.body.paths).toHaveProperty("/api/workbook");
  });
});
