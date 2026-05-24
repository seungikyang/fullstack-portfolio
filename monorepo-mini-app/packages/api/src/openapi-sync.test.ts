// OpenAPI 스펙(packages/api/openapi.json)이 코드의 실제 응답 형태와 어긋나면 잡는 테스트.
// 완벽한 검증은 아니지만 "필드를 추가했는데 스펙에 빠뜨리는" 가장 흔한 사고를 컴파일/테스트에서 잡는다.
//
// 검증 항목:
// 1. shared의 Note 타입이 가진 키 집합이 openapi의 Note 스키마 properties와 정확히 일치
// 2. shared의 ApiRoutes에 정의된 경로가 모두 openapi.paths에 등록되어 있다
// 3. 실제 server에서 만든 Note 응답의 키가 openapi Note 스키마와 일치 (런타임 검증)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ApiRoutes, type Note } from "@note-hub/shared";
import { InMemoryNotesStore } from "./notes-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const openApiPath = join(__dirname, "../openapi.json");
const spec = JSON.parse(readFileSync(openApiPath, "utf8")) as {
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, { properties?: Record<string, unknown>; required?: string[] }>;
  };
};

// TS 타입은 런타임에 접근할 수 없으므로 "이 데모가 응답으로 약속한 Note 키"를 한 곳에 적어두고
// shared/openapi/실제 응답 셋이 같은지 본다.
const expectedNoteKeys: Array<keyof Note> = ["id", "title", "body", "tags", "createdAt"];

describe("OpenAPI ↔ shared 동기화", () => {
  it("openapi의 Note 스키마 properties가 shared Note 키와 정확히 일치한다", () => {
    const props = spec.components.schemas.Note?.properties ?? {};
    const openApiKeys = Object.keys(props).sort();
    expect(openApiKeys).toEqual([...expectedNoteKeys].sort());
  });

  it("openapi의 Note 스키마 required는 모든 필드를 포함한다", () => {
    const required = spec.components.schemas.Note?.required ?? [];
    expect([...required].sort()).toEqual([...expectedNoteKeys].sort());
  });

  it("shared.ApiRoutes의 정적 경로는 모두 openapi.paths에 있다", () => {
    const declared = [
      ApiRoutes.health,
      ApiRoutes.openapi,
      ApiRoutes.notes,
      // path 파라미터는 openapi에서 중괄호 표기.
      "/api/notes/{id}"
    ];
    const specPaths = Object.keys(spec.paths);
    for (const p of declared) {
      expect(specPaths, `${p} should be in openapi.paths`).toContain(p);
    }
  });

  it("실제 InMemoryNotesStore.create 응답 키가 openapi Note properties와 일치한다", async () => {
    const store = new InMemoryNotesStore();
    const created = await store.create({ title: "t", body: "b", tags: ["x"] });
    const actualKeys = Object.keys(created).sort();
    const props = spec.components.schemas.Note?.properties ?? {};
    expect(actualKeys).toEqual(Object.keys(props).sort());
  });
});
