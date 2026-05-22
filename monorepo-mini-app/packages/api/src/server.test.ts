// supertest로 Express 앱을 listen 없이 호출한다. InMemoryNotesStore를 주입해 DB 없이 통합 테스트.
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./server.js";
import { InMemoryNotesStore } from "./notes-store.js";

describe("Note Hub API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp({ store: new InMemoryNotesStore() });
  });

  it("GET /api/health 는 200과 ok=true를 반환", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: "note-hub-api" });
  });

  it("GET /api/notes 는 처음에 빈 배열", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("노트 생성→조회→삭제 라이프사이클", async () => {
    const created = await request(app)
      .post("/api/notes")
      .send({ title: "hello", body: "world", tags: ["a", "b"] })
      .expect(201);

    expect(created.body.id).toBeTruthy();
    expect(created.body.tags).toEqual(["a", "b"]);

    const list = await request(app).get("/api/notes").expect(200);
    expect(list.body).toHaveLength(1);

    await request(app).delete(`/api/notes/${created.body.id}`).expect(204);
    const after = await request(app).get("/api/notes").expect(200);
    expect(after.body).toEqual([]);
  });

  it("title/body가 비면 400과 errors 배열", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "", body: "" });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("존재하지 않는 id 삭제는 404", async () => {
    const res = await request(app).delete("/api/notes/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/);
  });

  it("GET /api/openapi.json은 OpenAPI 3 스펙을 반환한다", async () => {
    const res = await request(app).get("/api/openapi.json");
    expect(res.status).toBe(200);
    expect(typeof res.body.openapi).toBe("string");
    expect(res.body.openapi.startsWith("3.")).toBe(true);
    expect(res.body.info?.title).toBe("Note Hub API");
    expect(res.body.paths).toHaveProperty("/api/notes");
  });
});
