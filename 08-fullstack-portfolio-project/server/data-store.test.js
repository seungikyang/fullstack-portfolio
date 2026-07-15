import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JsonStore, toPublicUser } from "./data-store.js";

describe("JsonStore", () => {
  let dir;
  let store;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "career-hub-store-"));
    store = new JsonStore(join(dir, "data.json"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("처음 생성 시 빈 데이터로 시작한다", () => {
    expect(store.listUsers()).toEqual([]);
  });

  it("createUser는 자동 증가 id를 부여한다", () => {
    const first = store.createUser({
      name: "A",
      email: "a@x.com",
      passwordHash: "hash"
    });
    const second = store.createUser({
      name: "B",
      email: "b@x.com",
      passwordHash: "hash"
    });

    expect(first.id).toBe("1");
    expect(second.id).toBe("2");
  });

  it("이메일은 소문자로 정규화되어 저장된다", () => {
    store.createUser({ name: "A", email: "Foo@Example.COM", passwordHash: "h" });
    expect(store.findUserByEmail("foo@example.com")).not.toBeNull();
    expect(store.findUserByEmail("FOO@example.com")).not.toBeNull();
  });

  it("listApplications는 사용자별로만 반환한다", () => {
    const u1 = store.createUser({ name: "u1", email: "u1@x.com", passwordHash: "h" });
    const u2 = store.createUser({ name: "u2", email: "u2@x.com", passwordHash: "h" });

    store.createApplication(u1.id, {
      company: "A",
      role: "r",
      status: "지원완료",
      priority: "보통",
      stack: []
    });
    store.createApplication(u2.id, {
      company: "B",
      role: "r",
      status: "지원완료",
      priority: "보통",
      stack: []
    });

    expect(store.listApplications(u1.id)).toHaveLength(1);
    expect(store.listApplications(u2.id)).toHaveLength(1);
    expect(store.listApplications(u1.id)[0].company).toBe("A");
  });

  it("updateApplication은 다른 사용자의 데이터를 수정할 수 없다", () => {
    const u1 = store.createUser({ name: "u1", email: "u1@x.com", passwordHash: "h" });
    const u2 = store.createUser({ name: "u2", email: "u2@x.com", passwordHash: "h" });
    const app = store.createApplication(u1.id, {
      company: "A",
      role: "r",
      status: "지원완료",
      priority: "보통",
      stack: []
    });

    const result = store.updateApplication(u2.id, app.id, { status: "면접" });
    expect(result).toBeNull();
    expect(store.listApplications(u1.id)[0].status).toBe("지원완료");
  });

  it("deleteApplication은 삭제 성공 시 true, 없는 id는 false를 반환한다", () => {
    const u = store.createUser({ name: "u", email: "u@x.com", passwordHash: "h" });
    const app = store.createApplication(u.id, {
      company: "A",
      role: "r",
      status: "지원완료",
      priority: "보통",
      stack: []
    });

    expect(store.deleteApplication(u.id, app.id)).toBe(true);
    expect(store.deleteApplication(u.id, "9999")).toBe(false);
  });

  it("저장된 데이터는 새로운 인스턴스에서도 읽힌다", () => {
    const u = store.createUser({ name: "u", email: "u@x.com", passwordHash: "h" });
    store.createProject(u.id, {
      name: "n",
      summary: "s",
      status: "개발중",
      stack: []
    });

    const reopened = new JsonStore(store.filePath);
    expect(reopened.listProjects(u.id)).toHaveLength(1);
  });

  it("사용자별 취업 워크북을 생성하고 다시 수정한다", () => {
    const u1 = store.createUser({ name: "u1", email: "u1@x.com", passwordHash: "h" });
    const u2 = store.createUser({ name: "u2", email: "u2@x.com", passwordHash: "h" });

    expect(store.getWorkbook(u1.id).targetRole).toBe("");

    store.updateWorkbook(u1.id, { targetRole: "백엔드 개발자", resumeReady: true });
    store.updateWorkbook(u1.id, { weeklyGoal: "이력서 완성" });

    expect(store.getWorkbook(u1.id)).toMatchObject({
      targetRole: "백엔드 개발자",
      weeklyGoal: "이력서 완성",
      resumeReady: true
    });
    expect(store.getWorkbook(u2.id).targetRole).toBe("");
  });
});

describe("toPublicUser", () => {
  it("passwordHash를 노출하지 않는다", () => {
    const publicUser = toPublicUser({
      id: "1",
      name: "n",
      email: "e@x.com",
      passwordHash: "secret",
      createdAt: "2026-05-22"
    });

    expect(publicUser).not.toHaveProperty("passwordHash");
    expect(publicUser).toEqual({
      id: "1",
      name: "n",
      email: "e@x.com",
      createdAt: "2026-05-22"
    });
  });

  it("null이면 null을 반환한다", () => {
    expect(toPublicUser(null)).toBeNull();
  });
});
