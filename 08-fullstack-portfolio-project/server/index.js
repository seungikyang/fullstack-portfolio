// Career Hub의 Express API와 정적 파일 제공을 구성하는 서버 진입 파일
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { assertAuthConfig, hashPassword, requireAuth, signToken, verifyPassword } from "./auth.js";
import { JsonStore, toPublicUser } from "./data-store.js";
import { logger } from "./logger.js";
import {
  validateApplication,
  validateLogin,
  validateProject,
  validateRegister,
  validateWorkbook
} from "./validators.js";

// ESM에는 __dirname이 없어서 현재 파일 URL을 실제 폴더 경로로 변환한다.
const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDataFile = join(__dirname, "../data/career-hub.json");
// 서버 시작 때 한 번 읽어 두고 요청마다 같은 OpenAPI 문서를 반환한다.
const openApiSpec = JSON.parse(readFileSync(join(__dirname, "openapi.json"), "utf8"));

// 모든 입력 검증 실패를 같은 400 응답 모양으로 만드는 헬퍼다.
function sendValidation(res, errors) {
  return res.status(400).json({ message: errors[0], errors });
}

// 저장된 원본 목록을 화면 상단의 요약 숫자와 취업 준비도로 계산한다.
function dashboardFor(applications, projects, workbook) {
  // reduce로 상태별 지원 건수를 { 면접: 2, 합격: 1 } 같은 객체에 누적한다.
  const statusCounts = applications.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const upcomingCount = applications.filter((item) => {
    if (!item.dueDate) {
      return false;
    }

    const dueTime = new Date(item.dueDate).getTime();
    const nowTime = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return dueTime >= nowTime && dueTime <= nowTime + sevenDays;
  }).length;
  const completedProjectCount = projects.filter((project) => project.status === "완료").length;
  const startedApplicationCount = applications.filter(
    (application) => application.status !== "준비중"
  ).length;

  // 네 단계가 각각 true/false 한 칸이므로 완료 개수와 백분율을 쉽게 계산할 수 있다.
  const readinessItems = [
    Boolean(workbook.targetRole && workbook.targetDate),
    Boolean(workbook.weeklyGoal && workbook.nextAction),
    Boolean(workbook.resumeReady && workbook.portfolioReady && completedProjectCount > 0),
    Boolean(workbook.selfIntroReady && workbook.mockInterviewReady && startedApplicationCount > 0)
  ];
  const readinessDone = readinessItems.filter(Boolean).length;

  return {
    totalApplications: applications.length,
    startedApplicationCount,
    interviewCount: statusCounts["면접"] || 0,
    offerCount: statusCounts["합격"] || 0,
    upcomingCount,
    projectCount: projects.length,
    completedProjectCount,
    readinessDone,
    readinessTotal: readinessItems.length,
    readinessPercent: Math.round((readinessDone / readinessItems.length) * 100),
    statusCounts
  };
}

// SEED_DEMO=true이고 사용자가 한 명도 없을 때만 화면 확인용 예제 데이터를 만든다.
async function seedDemoData(store) {
  if (process.env.SEED_DEMO !== "true" || store.listUsers().length > 0) {
    return;
  }

  const user = store.createUser({
    name: "포트폴리오 학습자",
    email: "demo@careerhub.dev",
    passwordHash: await hashPassword("demo1234")
  });

  store.createApplication(user.id, {
    company: "넥스트 SI",
    role: "풀스택 신입 개발자",
    status: "면접",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    stack: ["React", "Node.js", "REST API"],
    contact: "recruit@example.com",
    memo: "면접에서 Todo 앱과 Career Hub의 API 흐름 설명 준비",
    priority: "높음"
  });

  store.createApplication(user.id, {
    company: "소프트웨어랩",
    role: "웹 서비스 개발자",
    status: "지원완료",
    dueDate: "",
    stack: ["JavaScript", "Express", "MongoDB"],
    contact: "",
    memo: "포트폴리오 README 보강 후 추가 지원 예정",
    priority: "보통"
  });

  store.createProject(user.id, {
    name: "Career Hub",
    summary: "지원 현황과 포트폴리오 프로젝트를 관리하는 fullstack 앱",
    status: "개발중",
    stack: ["React", "Express", "JWT", "JSON Store"],
    repoUrl: "",
    deployUrl: "",
    highlight: "인증, CRUD, 대시보드, API 검증 스크립트를 포함"
  });

  store.updateWorkbook(user.id, {
    targetRole: "Java/Spring 기반 풀스택 개발자",
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    weeklyGoal: "Career Hub README와 면접 답변을 완성합니다.",
    nextAction: "지원 회사 한 곳의 공고를 분석하고 요구 기술을 메모합니다.",
    resumeReady: true,
    portfolioReady: false,
    selfIntroReady: false,
    mockInterviewReady: false,
    reflection: "완성한 기능을 기술 이름보다 문제와 해결 과정 중심으로 설명합니다."
  });
}

// Express 앱을 만드는 함수. listen과 분리해 테스트가 임시 데이터 파일로 앱만 만들 수 있다.
export async function createApp(options = {}) {
  assertAuthConfig();
  const app = express();
  // 프록시 뒤의 실제 클라이언트 IP를 비율 제한기가 읽을 수 있게 한다.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  // 테스트 옵션 → 환경 변수 → 기본 파일 순서로 저장 위치를 고른다.
  const store = new JsonStore(options.dataFile || process.env.DATA_FILE || defaultDataFile);
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  // 개발 편의: localhost와 127.0.0.1을 모두 허용한다. Origin이 없는 요청(curl, smoke test)도 허용한다.
  const allowedOrigins = new Set([
    clientOrigin,
    clientOrigin.replace("localhost", "127.0.0.1"),
    clientOrigin.replace("127.0.0.1", "localhost")
  ]);

  await seedDemoData(store);

  // 요청마다 X-Request-Id를 부여하고 JSON 로그를 남긴다. 분산 환경에서 단일 요청을
  // 여러 로그 라인과 묶어 추적하기 위해서다. 클라이언트가 보낸 X-Request-Id가 있으면 그대로 사용한다.
  app.use(
    pinoHttp({
      logger,
      genReqId(req, res) {
        const incoming = req.headers["x-request-id"];
        const id = (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();
        res.setHeader("X-Request-Id", id);
        return id;
      },
      customLogLevel(req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      // /api/health는 모니터링 폴링으로 자주 호출되므로 로그를 줄인다.
      autoLogging: {
        ignore: (req) => req.url === "/api/health"
      }
    })
  );

  // 보안 기본 헤더(X-Content-Type-Options, X-Frame-Options 등)를 일괄 적용한다.
  // 프론트엔드를 같은 서버에서 제공하므로 CSP는 같은 오리진 자산만 허용하도록 명시한다.
  // - 'self': 같은 오리진의 JS/CSS만 허용 (Vite 빌드 산출물이 여기에 해당)
  // - 'unsafe-inline': Vite가 일부 환경에서 inline style을 사용하므로 style만 허용
  // - data: img-src: 작은 인라인 이미지(아이콘 등) 허용
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:"],
          "connect-src": ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        // 같은 서버에서 제공하는 프론트 요청은 CORS 헤더가 없어도 정상 처리된다.
        // 별도 출처에는 허용 헤더를 보내지 않아 브라우저의 교차 출처 호출을 막는다.
        return callback(null, false);
      }
    })
  );
  // 과도한 본문(>1MB)을 거절해 메모리 고갈/DoS를 막는다.
  app.use(express.json({ limit: "1mb" }));

  // 인증 엔드포인트는 brute-force 방지를 위해 별도의 더 엄격한 비율 제한을 둔다.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "잠시 후 다시 시도해 주세요." }
  });
  // 나머지 API도 짧은 시간에 과도하게 호출되지 않도록 더 넓은 제한을 둔다.
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }
  });

  // 자동 테스트는 많은 요청을 빠르게 보내므로 비율 제한을 끄고 기능 자체만 검증한다.
  if (process.env.NODE_ENV !== "test") {
    app.use("/api/auth", authLimiter);
    app.use("/api", apiLimiter);
  }

  // ── 공개 API: 서버 상태·API 명세·회원가입·로그인 ──
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "career-hub" });
  });

  // 자동 생성 대신 hand-written OpenAPI 3 스펙을 노출한다.
  // 스펙은 server/openapi.json에 있다. 브라우저로는 https://editor.swagger.io 에서 붙여 넣으면 확인 가능.
  app.get("/api/openapi.json", (req, res) => {
    res.json(openApiSpec);
  });

  app.post("/api/auth/register", async (req, res) => {
    const { value, errors } = validateRegister(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    if (store.findUserByEmail(value.email)) {
      return res.status(409).json({ message: "이미 가입된 이메일입니다." });
    }

    const user = store.createUser({
      name: value.name,
      email: value.email,
      passwordHash: await hashPassword(value.password)
    });

    if (!user) {
      return res.status(409).json({ message: "이미 가입된 이메일입니다." });
    }

    return res.status(201).json({
      token: signToken(user),
      user: toPublicUser(user)
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { value, errors } = validateLogin(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    const user = store.findUserByEmail(value.email);

    if (!user) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const isPasswordValid = await verifyPassword(value.password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    return res.json({
      token: signToken(user),
      user: toPublicUser(user)
    });
  });

  // ── 보호 API: requireAuth가 JWT를 확인하고 req.user를 만든 뒤 실행된다. ──
  app.get("/api/me", requireAuth, (req, res) => {
    const user = store.findUserById(req.user.id);
    res.json({ user: toPublicUser(user) });
  });

  app.get("/api/dashboard", requireAuth, (req, res) => {
    const applications = store.listApplications(req.user.id);
    const projects = store.listProjects(req.user.id);
    const workbook = store.getWorkbook(req.user.id);
    res.json(dashboardFor(applications, projects, workbook));
  });

  // 취업 워크북은 사용자마다 한 개이며 PATCH로 일부 필드만 갱신한다.
  app.get("/api/workbook", requireAuth, (req, res) => {
    res.json(store.getWorkbook(req.user.id));
  });

  app.patch("/api/workbook", requireAuth, (req, res) => {
    const { value, errors } = validateWorkbook(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    return res.json(store.updateWorkbook(req.user.id, value));
  });

  // 지원 기록 REST API: 목록(GET), 생성(POST), 수정(PATCH), 삭제(DELETE).
  app.get("/api/applications", requireAuth, (req, res) => {
    res.json(store.listApplications(req.user.id));
  });

  app.post("/api/applications", requireAuth, (req, res) => {
    const { value, errors } = validateApplication(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    return res.status(201).json(store.createApplication(req.user.id, value));
  });

  app.patch("/api/applications/:id", requireAuth, (req, res) => {
    const { value, errors } = validateApplication(req.body, true);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    const application = store.updateApplication(req.user.id, req.params.id, value);

    if (!application) {
      return res.status(404).json({ message: "지원 기록을 찾을 수 없습니다." });
    }

    return res.json(application);
  });

  app.delete("/api/applications/:id", requireAuth, (req, res) => {
    const deleted = store.deleteApplication(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "지원 기록을 찾을 수 없습니다." });
    }

    return res.status(204).send();
  });

  // 프로젝트도 같은 REST 규칙을 사용해 프론트가 일관된 방식으로 호출할 수 있다.
  app.get("/api/projects", requireAuth, (req, res) => {
    res.json(store.listProjects(req.user.id));
  });

  app.post("/api/projects", requireAuth, (req, res) => {
    const { value, errors } = validateProject(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    return res.status(201).json(store.createProject(req.user.id, value));
  });

  app.patch("/api/projects/:id", requireAuth, (req, res) => {
    const { value, errors } = validateProject(req.body, true);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    const project = store.updateProject(req.user.id, req.params.id, value);

    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    return res.json(project);
  });

  app.delete("/api/projects/:id", requireAuth, (req, res) => {
    const deleted = store.deleteProject(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    return res.status(204).send();
  });

  // npm run build가 만든 React 파일을 Express가 배포 환경에서 직접 제공한다.
  const distPath = resolve(__dirname, "../dist");
  const indexHtml = join(distPath, "index.html");
  app.use(express.static(distPath));
  // /api가 아닌 주소는 React Router 같은 클라이언트 화면이 처리하도록 index.html을 보낸다.
  app.get(/^(?!\/api).*/, (req, res) => {
    if (!existsSync(indexHtml)) {
      return res
        .status(503)
        .type("text/plain; charset=utf-8")
        .send(
          "아직 프론트엔드가 빌드되지 않았습니다. 개발 중에는 'npm run dev'를, 배포 실행은 'npm run build' 후 'npm start'를 사용하세요."
        );
    }

    return res.sendFile(indexHtml);
  });

  // 위 라우터 어디에도 맞지 않은 API 요청은 마지막 404 처리로 도착한다.
  app.use((req, res) => {
    res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
  });

  // pino-http가 req.log를 채워 두므로 요청 컨텍스트(requestId 포함)와 함께 로그를 남긴다.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const status = Number(error.status || error.statusCode);
    const clientStatus = status >= 400 && status < 500 ? status : 500;

    if (clientStatus === 500) {
      (req.log || logger).error({ err: error }, "unhandled error");
    } else {
      (req.log || logger).warn({ err: error }, "client request rejected");
    }

    if (clientStatus === 400 && error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "JSON 요청 본문 형식이 올바르지 않습니다." });
    }
    if (clientStatus === 413 || error.type === "entity.too.large") {
      return res.status(413).json({ message: "요청 본문은 1MB를 넘을 수 없습니다." });
    }

    return res.status(clientStatus).json({
      message: clientStatus === 500 ? "서버 오류가 발생했습니다." : "요청을 처리할 수 없습니다."
    });
  });

  return app; // 테스트는 반환된 앱을 supertest에 넘기고, 실제 실행은 아래에서 listen한다.
}

// import된 경우에는 서버를 띄우지 않고, `node server/index.js`로 실행했을 때만 포트를 연다.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 5100;
  const app = await createApp();

  const server = app.listen(port, () => {
    logger.info({ port }, "Career Hub API listening");
  });

  // 컨테이너/PM2 환경에서 SIGTERM/SIGINT를 받으면 새 요청을 끊고 기존 요청을 마무리한다.
  // 그레이스풀 셧다운이 없으면 진행 중인 응답이 잘려서 502/연결 끊김으로 보이고, 데이터 저장 중간에
  // 종료되어 JSON 저장소가 손상될 수 있다.
  function shutdown(signal) {
    logger.info({ signal }, "graceful shutdown start");
    const forceTimer = setTimeout(() => {
      logger.error("graceful shutdown timeout, forcing exit");
      process.exit(1);
    }, 10_000);
    forceTimer.unref();

    server.close((error) => {
      if (error) {
        logger.error({ err: error }, "server close error");
        process.exit(1);
      }
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
