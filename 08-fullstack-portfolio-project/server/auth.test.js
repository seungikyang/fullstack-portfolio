import { describe, expect, it } from "vitest";
import { hashPassword, requireAuth, signToken, verifyPassword } from "./auth.js";

describe("hashPassword / verifyPassword", () => {
  it("같은 비밀번호는 검증을 통과한다", async () => {
    const hash = await hashPassword("password123");
    await expect(verifyPassword("password123", hash)).resolves.toBe(true);
  });

  it("다른 비밀번호는 검증에 실패한다", async () => {
    const hash = await hashPassword("password123");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("해시는 평문과 달라야 한다", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    expect(hash.length).toBeGreaterThan(20);
  });
});

describe("signToken / requireAuth", () => {
  function runRequireAuth(token) {
    const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
    let statusCode = 200;
    let body = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        body = payload;
        return this;
      }
    };
    let nextCalled = false;
    requireAuth(req, res, () => {
      nextCalled = true;
    });
    return { req, statusCode, body, nextCalled };
  }

  it("유효한 토큰이면 next()가 호출되고 req.user가 채워진다", () => {
    const token = signToken({ id: "42", email: "user@example.com", name: "테스터" });
    const { req, nextCalled, statusCode } = runRequireAuth(token);

    expect(nextCalled).toBe(true);
    expect(statusCode).toBe(200);
    expect(req.user).toEqual({
      id: "42",
      email: "user@example.com",
      name: "테스터"
    });
  });

  it("토큰이 없으면 401을 응답한다", () => {
    const { statusCode, body, nextCalled } = runRequireAuth(undefined);

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(401);
    expect(body.message).toMatch(/토큰/);
  });

  it("위조된 토큰이면 401을 응답한다", () => {
    const { statusCode, nextCalled } = runRequireAuth("not-a-real-token");

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(401);
  });
});
