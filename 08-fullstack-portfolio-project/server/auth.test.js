import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertAuthConfig,
  hashPassword,
  preparePasswordCheck,
  requireAuth,
  signToken,
  verifyPassword
} from "./auth.js";

const testSecret = "test-secret-with-at-least-32-characters";
let previousNodeEnv;
let previousJwtSecret;

// 인증 설정은 process.env라는 전역 상태를 사용하므로 테스트 전 값을 보관하고 테스트 후 반드시 복원한다.
beforeEach(() => {
  previousNodeEnv = process.env.NODE_ENV;
  previousJwtSecret = process.env.JWT_SECRET;
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = testSecret;
});

afterEach(() => {
  process.env.NODE_ENV = previousNodeEnv;

  if (previousJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousJwtSecret;
  }
});

describe("hashPassword / verifyPassword", () => {
  it("같은 비밀번호는 검증을 통과한다", async () => {
    const hash = await hashPassword("password123");
    await expect(verifyPassword("password123", hash)).resolves.toBe(true);
  });

  it("다른 비밀번호는 검증에 실패한다", async () => {
    const hash = await hashPassword("password123");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("저장된 해시가 없으면 가짜 해시와 비교한 뒤 실패한다", async () => {
    await expect(verifyPassword("password123", undefined)).resolves.toBe(false);
    await expect(verifyPassword("career-hub-dummy-password", "")).resolves.toBe(false);
  });

  it("서버 시작 때 가짜 해시를 준비하면 없는 계정 로그인에서 해시를 새로 만들지 않는다", async () => {
    await preparePasswordCheck();
    const hashSpy = vi.spyOn(bcrypt, "hash");
    const compareSpy = vi.spyOn(bcrypt, "compare");
    try {
      await expect(verifyPassword("password123", undefined)).resolves.toBe(false);
      expect(hashSpy).not.toHaveBeenCalled();
      expect(compareSpy).toHaveBeenCalledTimes(1);
    } finally {
      hashSpy.mockRestore();
      compareSpy.mockRestore();
    }
  });

  it("해시는 평문과 달라야 한다", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("bcrypt가 자르는 72바이트 초과 비밀번호는 해시하거나 인증하지 않는다", async () => {
    const password = "가".repeat(24);
    const hash = await hashPassword(password);

    await expect(hashPassword(`${password}x`)).rejects.toThrow(/72바이트/);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword(`${password}x`, hash)).resolves.toBe(false);
  });
});

describe("signToken / requireAuth", () => {
  function runRequireAuth(token, scheme = "Bearer") {
    const req = { headers: token ? { authorization: `${scheme} ${token}` } : {} };
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

  it("인증 방식 이름 Bearer는 대소문자를 구분하지 않고, 다른 방식은 거절한다", () => {
    const token = signToken({ id: "7", email: "case@example.com", name: "대소문자" });

    expect(runRequireAuth(token, "bearer").nextCalled).toBe(true);
    expect(runRequireAuth(token, "BEARER").req.user.id).toBe("7");
    expect(runRequireAuth(token, "Basic").statusCode).toBe(401);
  });

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

  it("만료된 HS256 토큰이면 401을 응답한다", () => {
    const token = jwt.sign({ sub: "42" }, testSecret, {
      algorithm: "HS256",
      expiresIn: -1
    });
    const { statusCode, nextCalled } = runRequireAuth(token);

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(401);
  });

  it("다른 secret으로 서명한 HS256 토큰이면 401을 응답한다", () => {
    const token = jwt.sign({ sub: "42" }, "another-secret-with-at-least-32-chars", {
      algorithm: "HS256",
      expiresIn: "1h"
    });
    const { statusCode, nextCalled } = runRequireAuth(token);

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(401);
  });
});

describe("assertAuthConfig", () => {
  it("운영 환경에서 JWT_SECRET이 없으면 시작을 거부한다", () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;

    expect(() => assertAuthConfig()).toThrow(/32자 이상의 안전한 JWT_SECRET/);
  });

  it("운영 환경에서 예제 JWT_SECRET이면 시작을 거부한다", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "change-this-secret-before-deploy";

    expect(() => assertAuthConfig()).toThrow(/32자 이상의 안전한 JWT_SECRET/);
  });

  it("운영 환경에서 32자 이상의 JWT_SECRET이면 통과한다", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = testSecret;

    expect(() => assertAuthConfig()).not.toThrow();
  });
});
