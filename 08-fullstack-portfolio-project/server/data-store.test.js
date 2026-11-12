import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JsonStore, toPublicUser } from "./data-store.js";

describe("JsonStore", () => {
  let dir;
  let store;

  // 저장소 테스트마다 새 폴더를 만들면 파일 영속성은 검증하면서 테스트끼리는 완전히 격리할 수 있다.
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "career-hub-store-"));
    store = new JsonStore(join(dir, "data.json"));
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("createUser는 정규화된 이메일 중복을 저장하지 않는다", () => {
    const first = store.createUser({ name: "A", email: "same@example.com", passwordHash: "h" });
    const duplicate = store.createUser({
      name: "B",
      email: "SAME@example.com",
      passwordHash: "h"
    });

    expect(first).not.toBeNull();
    expect(duplicate).toBeNull();
    expect(store.listUsers()).toHaveLength(1);
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

  it("워크북 최초 저장은 빈 값이어도 기록하고 동일 값 재저장은 건너뛴다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T01:00:00Z"));
    expect(store.getWorkbookHistory("1")).toEqual([]);
    const first = store.updateWorkbook("1", {});
    vi.setSystemTime(new Date("2026-10-04T01:00:00Z"));
    store.updateWorkbook("1", {});
    store.updateWorkbook("1", { targetRole: "", resumeReady: false });
    expect(store.getWorkbookHistory("1")).toHaveLength(1);
    expect(store.getWorkbook("1").updatedAt).toBe(first.updatedAt);
  });

  it("같은 시각의 부분 수정도 최신순 전체 스냅샷을 남기고 이전 기록을 보존한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T01:00:00Z"));
    store.updateWorkbook("1", { targetRole: "Java 백엔드", resumeReady: true });
    store.updateWorkbook("1", { weeklyGoal: "README 작성" });
    const [latest, previous] = store.getWorkbookHistory("1");
    expect(latest.savedAt).toBe(previous.savedAt);
    expect(latest.workbook).toMatchObject({
      targetRole: "Java 백엔드",
      weeklyGoal: "README 작성",
      resumeReady: true
    });
    expect(previous.workbook.weeklyGoal).toBe("");
    expect(Number(latest.id)).toBeGreaterThan(Number(previous.id));
    latest.workbook.targetRole = "응답 객체 변경";
    expect(store.getWorkbook("1").targetRole).toBe("Java 백엔드");
    expect(store.getWorkbookHistory("1")[0].workbook.targetRole).toBe("Java 백엔드");
    expect(new JsonStore(store.filePath).getWorkbookHistory("1")).toEqual(
      store.getWorkbookHistory("1")
    );
  });

  it("사용자별 최신 100개만 보관하고 다른 사용자의 이력은 유지한다", () => {
    store.updateWorkbook("2", { weeklyGoal: "다른 사용자 목표" });
    for (let index = 0; index < 101; index += 1) {
      store.updateWorkbook("1", { weeklyGoal: `목표 ${index}` });
    }
    const history = store.getWorkbookHistory("1");
    expect(history).toHaveLength(100);
    expect(history[0].workbook.weeklyGoal).toBe("목표 100");
    expect(history.at(-1).workbook.weeklyGoal).toBe("목표 1");
    expect(history.every((entry) => entry.userId === "1" && entry.workbook.userId === "1")).toBe(
      true
    );
    expect(store.getWorkbookHistory("2")).toHaveLength(1);
    expect(store.getWorkbookHistory("2")[0].workbook.weeklyGoal).toBe("다른 사용자 목표");
    expect(store.getWorkbookHistory("3")).toEqual([]);
  });

  it("이력 필드가 없는 기존 파일을 읽고 다음 변경부터 이력을 저장한다", () => {
    const saved = store.updateWorkbook("1", { targetRole: "기존 직무" });
    const legacyData = store.read();
    delete legacyData.workbookHistory;
    delete legacyData.counters.workbookHistory;
    writeFileSync(store.filePath, JSON.stringify(legacyData));
    const reopened = new JsonStore(store.filePath);
    expect(reopened.getWorkbook("1")).toEqual(saved);
    expect(reopened.getWorkbookHistory("1")).toEqual([]);
    reopened.updateWorkbook("1", { weeklyGoal: "새 목표" });
    expect(reopened.getWorkbookHistory("1")[0]).toMatchObject({
      id: "1",
      workbook: { targetRole: "기존 직무", weeklyGoal: "새 목표" }
    });
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
