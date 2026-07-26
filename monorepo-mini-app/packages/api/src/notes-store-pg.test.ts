// PostgreSQL 저장소의 파라미터 쿼리와 행 매핑을 가짜 Pool로 검증한다.
import type pg from "pg";
import { describe, expect, it, vi } from "vitest";
import { PostgresNotesStore } from "./notes-store-pg.js";

function createPool() {
  return {
    query: vi.fn(),
    end: vi.fn().mockResolvedValue(undefined)
  } as unknown as Pick<pg.Pool, "query" | "end">;
}

describe("PostgresNotesStore", () => {
  it("첫 사용 전에 스키마를 한 번만 준비하고 ping을 실행한다", async () => {
    const pool = createPool();
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: null } as never)
      .mockResolvedValue({ rows: [{ ok: 1 }], rowCount: 1 } as never);
    const store = new PostgresNotesStore("postgres://test", pool);

    await expect(store.ping()).resolves.toBe(true);
    await expect(store.ping()).resolves.toBe(true);

    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("CREATE TABLE IF NOT EXISTS notes")
    );
    expect(pool.query).toHaveBeenNthCalledWith(2, "SELECT 1 AS ok");
    expect(pool.query).toHaveBeenNthCalledWith(3, "SELECT 1 AS ok");
  });

  it("list는 snake_case DB 행을 Note로 매핑한다", async () => {
    const pool = createPool();
    const createdAt = new Date("2026-07-24T00:00:00.000Z");
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: null } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "1", title: "t", body: "b", tags: ["x"], created_at: createdAt }],
        rowCount: 1
      } as never);
    const store = new PostgresNotesStore("postgres://test", pool);

    await expect(store.list()).resolves.toEqual([
      { id: "1", title: "t", body: "b", tags: ["x"], createdAt: createdAt.toISOString() }
    ]);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT id"));
  });

  it("create는 값을 SQL과 분리해 전달하고 반환 행을 매핑한다", async () => {
    const pool = createPool();
    const createdAt = new Date("2026-07-24T00:00:00.000Z");
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: null } as never)
      .mockResolvedValueOnce({
        rows: [{ id: "2", title: "title", body: "body", tags: ["tag"], created_at: createdAt }],
        rowCount: 1
      } as never);
    const store = new PostgresNotesStore("postgres://test", pool);

    const note = await store.create({ title: " title ", body: " body ", tags: [" tag "] });

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("VALUES ($1, $2, $3)"), [
      "title",
      "body",
      ["tag"]
    ]);
    expect(note.createdAt).toBe(createdAt.toISOString());
  });

  it("delete는 id를 파라미터로 전달한다", async () => {
    const pool = createPool();
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: null } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const store = new PostgresNotesStore("postgres://test", pool);

    await expect(store.delete("note-id")).resolves.toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM notes WHERE id = $1"),
      ["note-id"]
    );
  });
});
