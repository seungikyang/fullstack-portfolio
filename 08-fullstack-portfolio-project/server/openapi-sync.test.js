// Career Hub 실제 라우트와 입출력 데이터가 OpenAPI 계약과 일치하는지 검증하는 테스트
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JsonStore } from "./data-store.js";
import { createApp } from "./index.js";
import { validateApplication, validateProject } from "./validators.js";

const spec = JSON.parse(readFileSync(new URL("./openapi.json", import.meta.url), "utf8"));

function openApiOperations() {
  return Object.entries(spec.paths)
    .flatMap(([path, operations]) =>
      Object.keys(operations)
        .filter((method) => ["get", "post", "patch", "delete"].includes(method))
        .map((method) => `${method.toUpperCase()} ${path}`)
    )
    .sort();
}

function appOperations(app) {
  return app.router.stack
    .filter((layer) => typeof layer.route?.path === "string" && layer.route.path.startsWith("/api"))
    .flatMap((layer) =>
      Object.keys(layer.route.methods).map((method) => {
        const path = layer.route.path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
        return `${method.toUpperCase()} ${path}`;
      })
    )
    .sort();
}

describe("OpenAPI 계약 동기화", () => {
  let directory;
  let dataFile;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "career-hub-openapi-"));
    dataFile = join(directory, "data.json");
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.SEED_DEMO = "false";
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it("실제 API의 경로와 메서드가 OpenAPI 작업 집합과 일치한다", async () => {
    const app = await createApp({ dataFile });

    expect(appOperations(app)).toEqual(openApiOperations());
  });

  it("문자열과 배열 stack 입력을 모두 문서화하고 실제 validator도 허용한다", () => {
    for (const schemaName of ["ApplicationInput", "ProjectInput"]) {
      const stackTypes = spec.components.schemas[schemaName].properties.stack.oneOf
        .map((schema) => schema.type)
        .sort();
      expect(stackTypes).toEqual(["array", "string"]);
    }

    expect(
      validateApplication({ company: "회사", role: "개발자", stack: "React, Express" }).value.stack
    ).toEqual(["React", "Express"]);
    expect(
      validateProject({ name: "앱", summary: "요약", stack: ["React", "Node.js"] }).value.stack
    ).toEqual(["React", "Node.js"]);
  });

  it("Project 실제 응답 키와 OpenAPI 출력 스키마가 일치한다", () => {
    const store = new JsonStore(dataFile);
    const user = store.createUser({
      name: "테스터",
      email: "openapi@example.com",
      passwordHash: "hash"
    });
    const project = store.createProject(user.id, {
      name: "Career Hub",
      summary: "취업 워크북",
      status: "완료",
      stack: ["React"]
    });
    const schema = spec.components.schemas.Project;

    expect(Object.keys(project).sort()).toEqual(Object.keys(schema.properties).sort());
    expect([...schema.required].sort()).toEqual(Object.keys(schema.properties).sort());
    expect(project).toHaveProperty("createdAt");
    expect(project).toHaveProperty("updatedAt");
  });

  it("빈 Workbook 응답의 날짜 필드를 OpenAPI도 빈 문자열로 허용한다", () => {
    const store = new JsonStore(dataFile);
    const user = store.createUser({
      name: "워크북 테스터",
      email: "workbook-openapi@example.com",
      passwordHash: "hash"
    });
    const workbook = store.getWorkbook(user.id);
    const properties = spec.components.schemas.Workbook.properties;

    for (const [field, format] of [
      ["targetDate", "date"],
      ["createdAt", "date-time"],
      ["updatedAt", "date-time"]
    ]) {
      expect(workbook[field]).toBe("");
      expect(properties[field].oneOf).toEqual([
        { type: "string", format },
        { type: "string", maxLength: 0 }
      ]);
    }
  });

  it("생성 필수 필드와 프로젝트 API의 400·401 응답을 명시한다", () => {
    const applicationCreate =
      spec.paths["/api/applications"].post.requestBody.content["application/json"].schema;
    const projectCreate =
      spec.paths["/api/projects"].post.requestBody.content["application/json"].schema;

    expect(applicationCreate.allOf[1].required).toEqual(["company", "role"]);
    expect(projectCreate.allOf[1].required).toEqual(["name", "summary"]);
    expect(Object.keys(spec.paths["/api/projects"].get.responses)).toContain("401");
    expect(Object.keys(spec.paths["/api/projects"].post.responses)).toEqual(
      expect.arrayContaining(["201", "400", "401"])
    );
    expect(Object.keys(spec.paths["/api/projects/{id}"].patch.responses)).toEqual(
      expect.arrayContaining(["200", "400", "401", "404"])
    );
    expect(Object.keys(spec.paths["/api/projects/{id}"].delete.responses)).toEqual(
      expect.arrayContaining(["204", "401", "404"])
    );
  });

  it("rate-limit과 JSON 본문 제한 응답을 실제 미들웨어 범위에 맞게 명시한다", () => {
    for (const operations of Object.values(spec.paths)) {
      for (const [method, operation] of Object.entries(operations)) {
        if (!["get", "post", "patch", "delete"].includes(method)) continue;
        expect(operation.responses).toHaveProperty("429");
        if (operation.requestBody) {
          expect(operation.responses).toHaveProperty("413");
        }
      }
    }
  });

  it("인증 길이·프로젝트 URL·내 정보 응답의 실제 입력 계약을 명시한다", () => {
    const register =
      spec.paths["/api/auth/register"].post.requestBody.content["application/json"].schema;
    const login = spec.paths["/api/auth/login"].post.requestBody.content["application/json"].schema;
    const projectInput = spec.components.schemas.ProjectInput.properties;
    const meSchema = spec.paths["/api/me"].get.responses["200"].content["application/json"].schema;

    expect(register.properties.name.maxLength).toBe(80);
    expect(register.properties.email.maxLength).toBe(254);
    expect(register.properties.password.maxLength).toBe(128);
    expect(login.properties.email.maxLength).toBe(254);
    expect(login.properties.password.maxLength).toBe(128);
    expect(projectInput.repoUrl.pattern).toContain("https?");
    expect(projectInput.deployUrl.pattern).toContain("https?");
    expect(meSchema.required).toContain("user");
  });
});
