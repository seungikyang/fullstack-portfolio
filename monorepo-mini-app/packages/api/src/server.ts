// Note Hub API. Express 5 + TypeScript. 공유 패키지(@note-hub/shared)의 타입과 경로를
// 그대로 import하기 때문에 백엔드의 응답 형태가 프론트엔드와 항상 동기화된다.
// DATABASE_URL이 설정되면 Postgres, 없으면 인메모리 저장소를 사용한다.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type ErrorRequestHandler, type Request, type Response } from "express";
import { ApiRoutes, type ApiError } from "@note-hub/shared";
import { InMemoryNotesStore, type NotesStore, validateCreate } from "./notes-store.js";
import { PostgresNotesStore } from "./notes-store-pg.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// OpenAPI 스펙은 빌드 산출물 옆 또는 패키지 루트에서 찾는다.
// dev(tsx): src/ → ../openapi.json, build 후(dist): dist/ → ../openapi.json — 둘 다 정상 동작.
const openApiCandidates = [
  join(__dirname, "../openapi.json"),
  join(__dirname, "../../openapi.json")
];
const openApiPath = openApiCandidates.find((p) => existsSync(p));
const openApiSpec: Record<string, unknown> = openApiPath
  ? JSON.parse(readFileSync(openApiPath, "utf8"))
  : { openapi: "3.0.3", info: { title: "Note Hub API", version: "0.0.0" }, paths: {} };

function createStore(): NotesStore {
  const url = process.env.DATABASE_URL;
  if (url && url.length > 0) {
    console.log("[notes] using PostgresNotesStore");
    return new PostgresNotesStore(url);
  }
  console.log("[notes] using InMemoryNotesStore (set DATABASE_URL for Postgres)");
  return new InMemoryNotesStore();
}

export interface AppOptions {
  store?: NotesStore;
  /** 빌드된 웹(dist) 경로. 지정하면 같은 서버에서 정적 파일도 함께 제공한다. */
  webDist?: string;
}

export function createApp(options: AppOptions = {}): express.Express {
  const app = express();
  const store = options.store ?? createStore();

  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  app.get(ApiRoutes.health, async (_req: Request, res: Response) => {
    let dbOk: boolean;
    try {
      dbOk = (await store.ping?.()) ?? true;
    } catch {
      dbOk = false;
    }
    res.status(dbOk ? 200 : 503).json({ ok: dbOk, service: "note-hub-api" });
  });

  // 핸드라이팅 OpenAPI 3 스펙을 그대로 노출한다. 시각화는 https://editor.swagger.io에 붙여 넣어 확인.
  app.get(ApiRoutes.openapi, (_req: Request, res: Response) => {
    res.json(openApiSpec);
  });

  app.get(ApiRoutes.notes, async (_req, res, next) => {
    try {
      res.json(await store.list());
    } catch (err) {
      next(err);
    }
  });

  app.post(ApiRoutes.notes, async (req, res, next) => {
    try {
      const { value, errors } = validateCreate(req.body);
      if (errors.length > 0) {
        const error: ApiError = { message: errors[0] ?? "invalid input", errors };
        res.status(400).json(error);
        return;
      }
      res.status(201).json(await store.create(value));
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/notes/:id", async (req, res, next) => {
    try {
      const id = req.params.id ?? "";
      const deleted = await store.delete(id);
      if (!deleted) {
        const error: ApiError = { message: "note not found" };
        res.status(404).json(error);
        return;
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // 프로덕션 빌드: api 서버가 web 빌드도 함께 정적으로 제공한다(단일 컨테이너 배포용).
  const webDist = options.webDist ?? join(__dirname, "../../web/dist");
  if (existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(join(webDist, "index.html"));
    });
  }

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    const error: ApiError = { message: "internal server error" };
    res.status(500).json(error);
  };
  app.use(errorHandler);

  return app;
}

const port = Number(process.env.PORT ?? 5200);
const isEntry = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");
if (isEntry) {
  const app = createApp({ webDist: resolve(__dirname, "../../web/dist") });
  app.listen(port, () => {
    console.log(`Note Hub API listening on http://localhost:${port}`);
  });
}
