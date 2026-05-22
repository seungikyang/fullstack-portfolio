// supertest를 이용한 Express 통합 테스트. 서버를 실제 listen 시키지 않고 createApp을 직접 호출한다.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./index.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

describe("Career Hub API", () => {
  let dir;
  let app;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), "career-hub-api-"));
    process.env.SEED_DEMO = "false";
    app = await createApp({ dataFile: join(dir, "data.json") });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("GET /api/health 는 ok 응답을 반환한다", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, service: "career-hub" });
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

  it("같은 이메일로 두 번 가입하면 409를 반환한다", async () => {
    const payload = { name: "t", email: "dup@example.com", password: "password123" };
    await request(app).post("/api/auth/register").send(payload).expect(201);
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(409);
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

    it("대시보드는 현재 사용자의 카운트를 반환한다", async () => {
      await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          company: "A", role: "r", status: "면접", priority: "보통", stack: ""
        })
        .expect(201);

      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.totalApplications).toBe(1);
      expect(res.body.interviewCount).toBe(1);
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
  });
});
