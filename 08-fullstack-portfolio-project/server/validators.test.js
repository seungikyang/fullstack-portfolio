import { describe, expect, it } from "vitest";
import {
  validateApplication,
  validateProject,
  validateRegister
} from "./validators.js";

describe("validateRegister", () => {
  it("이메일과 비밀번호가 유효하면 errors가 비어 있다", () => {
    const { value, errors } = validateRegister({
      name: "테스트",
      email: "Test@Example.com",
      password: "password123"
    });

    expect(errors).toEqual([]);
    expect(value.email).toBe("test@example.com");
    expect(value.name).toBe("테스트");
  });

  it("이메일에 @가 없으면 오류를 반환한다", () => {
    const { errors } = validateRegister({
      email: "no-at-sign",
      password: "password123"
    });

    expect(errors).toContain("올바른 이메일을 입력하세요.");
  });

  it("비밀번호가 8자 미만이면 오류를 반환한다", () => {
    const { errors } = validateRegister({
      email: "user@example.com",
      password: "short"
    });

    expect(errors).toContain("비밀번호는 8자 이상이어야 합니다.");
  });

  it("이름이 없으면 기본값 '학습자'를 사용한다", () => {
    const { value } = validateRegister({
      email: "user@example.com",
      password: "password123"
    });

    expect(value.name).toBe("학습자");
  });
});

describe("validateApplication", () => {
  const validPayload = {
    company: "테스트 SI",
    role: "풀스택 개발자",
    status: "지원완료",
    priority: "보통",
    stack: "React, Node.js"
  };

  it("필수 값이 모두 있으면 errors가 비어 있다", () => {
    const { value, errors } = validateApplication(validPayload);

    expect(errors).toEqual([]);
    expect(value.stack).toEqual(["React", "Node.js"]);
  });

  it("회사명이 비어 있으면 오류를 반환한다", () => {
    const { errors } = validateApplication({ ...validPayload, company: "  " });

    expect(errors).toContain("회사명을 입력하세요.");
  });

  it("허용되지 않은 상태값이면 오류를 반환한다", () => {
    const { errors } = validateApplication({ ...validPayload, status: "이상한값" });

    expect(errors).toContain("지원 상태가 올바르지 않습니다.");
  });

  it("partial=true이면 누락된 필드는 검증하지 않는다", () => {
    const { value, errors } = validateApplication({ status: "면접" }, true);

    expect(errors).toEqual([]);
    expect(value).toEqual({ status: "면접" });
  });

  it("stack을 배열로 줘도 정상 파싱된다", () => {
    const { value } = validateApplication({
      ...validPayload,
      stack: ["React", "  Express  ", ""]
    });

    expect(value.stack).toEqual(["React", "Express"]);
  });
});

describe("validateProject", () => {
  it("이름과 요약이 있으면 errors가 비어 있다", () => {
    const { errors } = validateProject({
      name: "Career Hub",
      summary: "포트폴리오"
    });

    expect(errors).toEqual([]);
  });

  it("이름과 요약이 없으면 두 오류 모두 반환한다", () => {
    const { errors } = validateProject({});

    expect(errors).toContain("프로젝트 이름을 입력하세요.");
    expect(errors).toContain("프로젝트 요약을 입력하세요.");
  });

  it("status 기본값은 '개발중'이다", () => {
    const { value } = validateProject({ name: "x", summary: "y" });

    expect(value.status).toBe("개발중");
  });
});
