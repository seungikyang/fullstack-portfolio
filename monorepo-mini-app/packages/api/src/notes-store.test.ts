// 인메모리 저장소와 노트 입력 검증 규칙을 확인한다.
import { NoteLimits } from "@note-hub/shared";
import { describe, expect, it } from "vitest";
import { InMemoryNotesStore, validateCreate } from "./notes-store.js";

describe("InMemoryNotesStore", () => {
  it("처음에는 빈 목록을 반환한다", async () => {
    const store = new InMemoryNotesStore();
    expect(await store.list()).toEqual([]);
  });

  it("create는 id와 createdAt을 채우고 반환한다", async () => {
    const store = new InMemoryNotesStore();
    const note = await store.create({ title: "t", body: "b", tags: ["x"] });
    expect(note.id).toBeTruthy();
    expect(note.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(note.tags).toEqual(["x"]);
  });

  it("list는 최신순으로 정렬해 돌려준다", async () => {
    const store = new InMemoryNotesStore();
    const a = await store.create({ title: "a", body: "1" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const b = await store.create({ title: "b", body: "2" });
    const list = await store.list();
    expect(list[0]?.id).toBe(b.id);
    expect(list[1]?.id).toBe(a.id);
  });

  it("delete는 성공 시 true, 없는 id면 false", async () => {
    const store = new InMemoryNotesStore();
    const note = await store.create({ title: "t", body: "b" });
    expect(await store.delete(note.id)).toBe(true);
    expect(await store.delete(note.id)).toBe(false);
    expect(await store.list()).toEqual([]);
  });

  it("title/body는 trim되고, tags의 빈 문자열은 걸러진다", async () => {
    const store = new InMemoryNotesStore();
    const note = await store.create({
      title: "  hi  ",
      body: "  body  ",
      tags: [" tag1 ", "", "tag2"]
    });
    expect(note.title).toBe("hi");
    expect(note.body).toBe("body");
    expect(note.tags).toEqual(["tag1", "tag2"]);
  });
});

describe("validateCreate", () => {
  it("정상 payload는 errors 비어 있음", () => {
    const { value, errors } = validateCreate({
      title: "t",
      body: "b",
      tags: [" x ", "", "y"]
    });
    expect(errors).toEqual([]);
    expect(value).toEqual({ title: "t", body: "b", tags: ["x", "y"] });
  });

  it("title이 비면 오류", () => {
    const { errors } = validateCreate({ title: "  ", body: "b" });
    expect(errors).toContain("title is required");
  });

  it("body가 비면 오류", () => {
    const { errors } = validateCreate({ title: "t", body: "" });
    expect(errors).toContain("body is required");
  });

  it("tags가 배열이 아니면 오류", () => {
    const { errors } = validateCreate({ title: "t", body: "b", tags: "a,b,c" });
    expect(errors).toContain("tags must be an array");
  });

  it("제목과 본문 길이 제한을 검사한다", () => {
    const { errors } = validateCreate({
      title: "t".repeat(NoteLimits.title + 1),
      body: "b".repeat(NoteLimits.body + 1)
    });
    expect(errors).toContain(`title must be ${NoteLimits.title} characters or fewer`);
    expect(errors).toContain(`body must be ${NoteLimits.body} characters or fewer`);
  });

  it("태그 개수와 항목 길이 제한을 검사한다", () => {
    const tooMany = validateCreate({
      title: "t",
      body: "b",
      tags: Array.from({ length: NoteLimits.tags + 1 }, (_, index) => `tag-${index}`)
    });
    const tooLong = validateCreate({
      title: "t",
      body: "b",
      tags: ["x".repeat(NoteLimits.tag + 1)]
    });
    const tooManyEmpty = validateCreate({
      title: "t",
      body: "b",
      tags: Array.from({ length: NoteLimits.tags + 1 }, () => "")
    });
    expect(tooMany.errors).toContain(`tags must contain ${NoteLimits.tags} items or fewer`);
    expect(tooManyEmpty.errors).toContain(`tags must contain ${NoteLimits.tags} items or fewer`);
    expect(tooLong.errors).toContain(`each tag must be ${NoteLimits.tag} characters or fewer`);
  });

  it("payload가 null/undefined여도 안전하게 오류만 반환", () => {
    expect(validateCreate(null).errors.length).toBeGreaterThan(0);
    expect(validateCreate(undefined).errors.length).toBeGreaterThan(0);
  });
});
