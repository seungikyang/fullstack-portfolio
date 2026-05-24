// 공유 패키지의 타입 가드와 경로 헬퍼 단위 테스트.
import { describe, expect, it } from "vitest";
import { ApiRoutes, isNote, type Note } from "./index.js";

describe("isNote", () => {
  it("올바른 Note는 true", () => {
    const note: Note = {
      id: "abc",
      title: "t",
      body: "b",
      tags: ["x"],
      createdAt: new Date().toISOString()
    };
    expect(isNote(note)).toBe(true);
  });

  it("필수 필드가 빠지면 false", () => {
    expect(isNote({ id: "x", title: "t" })).toBe(false);
    expect(isNote({})).toBe(false);
  });

  it("tags가 배열이 아니면 false", () => {
    expect(isNote({ id: "x", title: "t", body: "b", tags: "not-array", createdAt: "now" })).toBe(
      false
    );
  });

  it("null/undefined/원시값은 false", () => {
    expect(isNote(null)).toBe(false);
    expect(isNote(undefined)).toBe(false);
    expect(isNote("note")).toBe(false);
    expect(isNote(42)).toBe(false);
  });
});

describe("ApiRoutes", () => {
  it("정적 경로는 상수다", () => {
    expect(ApiRoutes.health).toBe("/api/health");
    expect(ApiRoutes.openapi).toBe("/api/openapi.json");
    expect(ApiRoutes.notes).toBe("/api/notes");
  });

  it("noteById는 id를 경로에 포함한다", () => {
    expect(ApiRoutes.noteById("abc-123")).toBe("/api/notes/abc-123");
  });
});
