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
    const { value, errors } = validateCreate({ title: "t", body: "b", tags: ["x"] });
    expect(errors).toEqual([]);
    expect(value).toEqual({ title: "t", body: "b", tags: ["x"] });
  });

  it("title이 비면 오류", () => {
    const { errors } = validateCreate({ title: "  ", body: "b" });
    expect(errors).toContain("title is required");
  });

  it("body가 비면 오류", () => {
    const { errors } = validateCreate({ title: "t", body: "" });
    expect(errors).toContain("body is required");
  });

  it("tags가 콤마 문자열이면 파싱된다", () => {
    const { value } = validateCreate({ title: "t", body: "b", tags: " a, b ,c " });
    expect(value.tags).toEqual(["a", "b", "c"]);
  });

  it("payload가 null/undefined여도 안전하게 오류만 반환", () => {
    expect(validateCreate(null).errors.length).toBeGreaterThan(0);
    expect(validateCreate(undefined).errors.length).toBeGreaterThan(0);
  });
});
