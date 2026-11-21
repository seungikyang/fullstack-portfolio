// 서버가 처음 시작되는 파일이다. 화면에서 보낸 요청을 받고, 알맞은 일을 한 뒤 답을 보낸다.
// Express는 요청 주소마다 처리 함수를 연결해주는 도구다.
// 예: 지원 기록 저장 요청 → 로그인 검사(auth.js) → 입력 검사(validators.js) → 파일 저장(data-store.js).
// req는 받은 요청, req.body는 입력값, res는 답을 보내는 도구다.
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import {
  assertAuthConfig,
  hashPassword,
  preparePasswordCheck,
  requireAuth,
  signToken,
  verifyPassword
} from "./auth.js";
import { JsonStore, toPublicUser } from "./data-store.js";
import { logger } from "./logger.js";
import {
  validateApplication,
  validateLogin,
  validateProject,
  validateRegister,
  validateWorkbook
} from "./validators.js";

// import.meta.url은 이 파일의 위치다. 그 위치에서 폴더 이름을 구해 자료 파일을 찾는다.
const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDataFile = join(__dirname, "../data/career-hub.json");
// OpenAPI는 '어떤 주소에 어떤 자료를 보내면 어떤 답이 오는가'를 적은 API 사용 설명서다.
// 서버가 시작할 때 설명서를 읽어두고, 설명서 요청이 오면 그대로 보내준다.
const openApiSpec = JSON.parse(readFileSync(join(__dirname, "openapi.json"), "utf8"));

// 입력이 잘못되면 400(잘못된 요청)과 오류 설명을 보내준다. errors[0]은 첫 번째 오류다.
function sendValidation(res, errors) {
  return res.status(400).json({ message: errors[0], errors });
}

// 마감일은 시간 없이 'YYYY-MM-DD'로 저장하므로 '오늘'도 사용자가 사는 지역의 날짜로 정해야 한다.
// UTC로 오늘을 정하면 한국 시간 00:00~08:59에는 아직 어제 날짜라서 지난 마감이 임박으로 잡힌다.
// en-CA 형식은 날짜를 '2026-10-31'처럼 YYYY-MM-DD로 적어준다.
function todayIn(timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(Date.now());
}

// 결과가 이미 나온 지원 상태다.
const closedApplicationStatuses = new Set(["합격", "불합격"]);

// 저장한 목록을 세어서 화면 위쪽에 보여줄 요약 숫자와 준비도를 만든다.
function dashboardFor(applications, projects, workbook, timeZone) {
  // reduce는 항목을 하나씩 보며 결과를 쌓는다. 예: 면접 두 건을 보면 { 면접: 2 }가 된다.
  const statusCounts = applications.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  // 지역 날짜로 구한 오늘과 마감일을 모두 같은 기준(UTC 자정)으로 읽어 날짜끼리 비교한다.
  const today = new Date(`${todayIn(timeZone)}T00:00:00.000Z`).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  // 합격·불합격으로 결과가 나온 지원은 더 챙길 마감이 없으므로 임박 건수에서 뺀다.
  const upcomingCount = applications.filter((item) => {
    if (!item.dueDate || closedApplicationStatuses.has(item.status)) {
      return false;
    }

    const dueTime = new Date(item.dueDate).getTime();
    return dueTime >= today && dueTime <= today + sevenDays;
  }).length;
  const completedProjectCount = projects.filter((project) => project.status === "완료").length;
  const startedApplicationCount = applications.filter(
    (application) => application.status !== "준비중"
  ).length;

  // 각 단계의 조건이 맞으면 true(완료), 아니면 false(미완료)다. 완료 개수로 백분율을 구한다.
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

// 예제 만들기 설정(SEED_DEMO)을 켰고 아직 사용자가 없을 때만 연습용 계정과 기록을 넣는다.
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

// 서버의 처리 규칙을 만드는 함수다. 실제 요청을 받기 시작하는 listen은 파일 맨 아래에 있다.
// 둘을 나누면 자동 검사에서 임시 파일로 앱을 만들고 실제 사용자 자료를 건드리지 않을 수 있다.
export async function createApp(options = {}) {
  assertAuthConfig();
  const app = express();
  // 배포 서버 앞에서 요청을 전달하는 서버(프록시)가 한 단계 있다고 알려준다.
  // 같은 사람이 요청을 너무 많이 보내는지 셀 때 사용자의 IP 주소를 읽는 데 쓰인다.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  // 저장 위치는 검사에서 정한 값 → 실행 설정값 → 기본 파일 순으로 고른다. ||는 앞 값이 없을 때 뒤 값을 쓴다.
  const store = new JsonStore(options.dataFile || process.env.DATA_FILE || defaultDataFile);
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  // 대시보드의 '오늘' 기준 지역이다. 잘못된 이름이면 요청 처리 중이 아니라 시작할 때 바로 알린다.
  const timeZone = process.env.APP_TIME_ZONE || "Asia/Seoul";
  todayIn(timeZone);
  // localhost와 127.0.0.1은 내 컴퓨터를 가리키는 주소다. 개발 중 두 주소에서 보내는 요청을 허용한다.
  const allowedOrigins = new Set([
    clientOrigin,
    clientOrigin.replace("localhost", "127.0.0.1"),
    clientOrigin.replace("127.0.0.1", "localhost")
  ]);

  await seedDemoData(store);
  // 요청을 받기 전에 로그인 비교용 가짜 해시를 준비한다. (auth.js의 preparePasswordCheck 참고)
  await preparePasswordCheck();

  // 확인표의 서명이 맞아도 그 번호의 사용자가 지금 저장소에 있는지 다시 확인한다.
  // 자료 파일을 초기화하면 번호가 1부터 다시 붙으므로, 이메일까지 같아야 같은 사람으로 본다.
  function requireUser(req, res, next) {
    return requireAuth(req, res, () => {
      const user = store.findUserById(req.user.id);

      if (!user || user.email !== req.user.email) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      return next();
    });
  }

  // 요청은 등록한 순서대로 검사대를 지나간다. 이런 중간 처리 함수를 미들웨어라고 부른다.
  // 순서: 활동 기록 → 브라우저 보안 규칙 → 요청 주소 확인 → 입력 읽기 → 횟수 제한 → 실제 처리.
  // 뒤의 함수가 앞에서 읽은 입력값을 사용하므로 순서가 중요하다.

  // 요청마다 표식(X-Request-Id)을 붙인다. 여러 활동 기록에서 같은 요청의 내용을 찾기 위해서다.
  // 받은 표식이 있으면 사용하고, 없으면 randomUUID로 새 표식을 만든다.
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
      // 서버가 살아 있는지 묻는 /api/health는 자주 호출되므로 매번 일지에 적지 않는다.
      autoLogging: {
        ignore: (req) => req.url === "/api/health"
      }
    })
  );

  // helmet은 브라우저에 보안 규칙을 알려주는 도구다. CSP는 어떤 코드·그림·주소를 쓸지 정한다.
  // 'self'는 현재 페이지와 같은 출처(주소의 방식·호스트·포트가 같음)를 뜻한다.
  // style의 'unsafe-inline'은 화면 안에 직접 적은 꾸미기 규칙, 이미지의 data:는 글자에 담은 그림을 허용한다.
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
      // CORS는 다른 출처의 화면이 이 서버의 답을 읽어도 되는지 브라우저에 알려주는 규칙이다.
      // 로그인 확인을 대신하지 않는다. 로그인은 각 보호 API의 requireUser에서 별도로 검사한다.
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        // 허용 목록에 없는 출처에는 허용 표시를 보내지 않는다.
        // 같은 출처의 화면은 CORS 허용 표시가 없어도 답을 읽을 수 있다.
        return callback(null, false);
      }
    })
  );
  // 보낸 입력을 JSON으로 읽는다. 너무 큰 자료가 서버 메모리를 많이 쓰지 않도록 1MB로 제한한다.
  app.use(express.json({ limit: "1mb" }));

  // 비밀번호를 계속 추측하지 못하도록 같은 IP에서 인증 요청을 15분에 20번까지 받는다.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "잠시 후 다시 시도해 주세요." }
  });
  // 다른 API 요청도 같은 IP에서 1분에 120번까지 받는다. 초과하면 잠시 기다리라는 답을 보낸다.
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }
  });

  // test 설정에서는 많은 요청을 보내며 검사하므로 횟수 제한을 끈다.
  if (process.env.NODE_ENV !== "test") {
    app.use("/api/auth", authLimiter);
    app.use("/api", apiLimiter);
  }

  // ── 로그인 확인표 없이 사용할 수 있는 창구: 서버 상태·설명서·회원가입·로그인 ──
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "career-hub" });
  });

  // 직접 작성한 server/openapi.json 설명서를 보낸다. 설명서만 수정한다고 서버 기능이 바뀌지는 않는다.
  app.get("/api/openapi.json", (req, res) => {
    res.json(openApiSpec);
  });

  // 회원가입: 입력 검사 → 이메일 중복 확인 → 비밀번호 해시 저장 → 확인표와 사용자 정보 반환.
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

  // 로그인: 이메일로 계정 찾기 → 비밀번호 확인 → 2시간짜리 로그인 확인표 발급.
  app.post("/api/auth/login", async (req, res) => {
    const { value, errors } = validateLogin(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    const user = store.findUserByEmail(value.email);
    // 계정이 없어도 비밀번호 비교를 거친 뒤 같은 안내로 답한다. 가입 여부를 응답 시간으로 알 수 없게 한다.
    const isPasswordValid = await verifyPassword(value.password, user?.passwordHash);

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    return res.json({
      token: signToken(user),
      user: toPublicUser(user)
    });
  });

  // ── 로그인 확인이 필요한 창구 ── requireUser가 확인표와 사용자 존재를 검사하고 주인 정보를 req.user에 넣는다.
  // req.user.id는 확인한 사용자 번호다. 요청에 사용자가 적은 번호를 믿는 대신 이 번호를 사용한다.
  app.get("/api/me", requireUser, (req, res) => {
    const user = store.findUserById(req.user.id);
    res.json({ user: toPublicUser(user) });
  });

  app.get("/api/dashboard", requireUser, (req, res) => {
    const applications = store.listApplications(req.user.id);
    const projects = store.listProjects(req.user.id);
    const workbook = store.getWorkbook(req.user.id);
    res.json(dashboardFor(applications, projects, workbook, timeZone));
  });

  // 워크북은 사용자마다 한 개다. GET은 읽기, PATCH는 보낸 항목만 바꾸기다.
  app.get("/api/workbook", requireUser, (req, res) => {
    res.json(store.getWorkbook(req.user.id));
  });

  // 로그인한 사람의 저장 이력만 보낸다. 다른 사람의 이력은 가져오지 않는다.
  app.get("/api/workbook/history", requireUser, (req, res) => {
    res.json(store.getWorkbookHistory(req.user.id));
  });

  app.patch("/api/workbook", requireUser, (req, res) => {
    const { value, errors } = validateWorkbook(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    return res.json(store.updateWorkbook(req.user.id, value));
  });

  // 지원 기록 창구: GET=조회, POST=추가, PATCH=수정, DELETE=삭제.
  // 처리 결과 숫자: 200=성공, 201=추가됨, 204=삭제 후 보낼 내용 없음, 404=찾지 못함.
  app.get("/api/applications", requireUser, (req, res) => {
    res.json(store.listApplications(req.user.id));
  });

  // 입력값이 규칙에 맞을 때만 파일에 저장한다. 이 흐름은 프로젝트 저장에도 똑같이 쓰인다.
  app.post("/api/applications", requireUser, (req, res) => {
    const { value, errors } = validateApplication(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    return res.status(201).json(store.createApplication(req.user.id, value));
  });

  // :id는 주소에 들어가는 기록 번호다. /api/applications/3이면 req.params.id는 '3'이다.
  app.patch("/api/applications/:id", requireUser, (req, res) => {
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

  app.delete("/api/applications/:id", requireUser, (req, res) => {
    const deleted = store.deleteApplication(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "지원 기록을 찾을 수 없습니다." });
    }

    return res.status(204).send();
  });

  // 프로젝트도 지원 기록과 같은 요청 방법을 사용한다. 달라지는 것은 자료와 검사 함수다.
  app.get("/api/projects", requireUser, (req, res) => {
    res.json(store.listProjects(req.user.id));
  });

  app.post("/api/projects", requireUser, (req, res) => {
    const { value, errors } = validateProject(req.body);

    if (errors.length > 0) {
      return sendValidation(res, errors);
    }

    return res.status(201).json(store.createProject(req.user.id, value));
  });

  app.patch("/api/projects/:id", requireUser, (req, res) => {
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

  app.delete("/api/projects/:id", requireUser, (req, res) => {
    const deleted = store.deleteProject(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    return res.status(204).send();
  });

  // npm run build는 화면 코드를 브라우저가 사용할 파일로 만든다. 결과는 dist 폴더에 들어간다.
  // 배포할 때는 이 서버가 그 화면 파일도 함께 보낸다.
  const distPath = resolve(__dirname, "../dist");
  const indexHtml = join(distPath, "index.html");
  app.use(express.static(distPath));
  // /api로 시작하지 않는 화면 주소에는 화면의 시작 파일인 index.html을 보낸다.
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

  // 등록한 주소 중에 맞는 것이 없으면 404(찾지 못함)와 안내를 보낸다.
  app.use((req, res) => {
    res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
  });

  // 앞 단계에서 생긴 오류는 이곳에서 처리한다. 4xx는 요청 문제, 500은 서버 내부 문제다.
  // Express는 인자 네 개를 보고 오류 처리 함수임을 알아보므로 안 쓰는 next도 남겨둔다.
  // 자세한 오류는 서버 일지에 적고, 화면에는 내부 정보 대신 짧은 안내를 보낸다.
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

  return app; // 여기서는 처리 규칙만 돌려준다. 자동 검사에 쓰거나 아래 listen으로 실제 실행한다.
}

// 이 파일을 직접 실행했는지 확인한다. Node는 import.meta.url에 바로가기(심볼릭 링크)를 따라간
// 실제 경로를 넣지만 process.argv[1]은 입력한 경로 그대로다. 실제 경로로 맞춰서 비교하지 않으면
// 링크된 폴더에서 실행할 때 서버가 오류도 없이 바로 끝난다.
function isEntryPoint() {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

// 다른 파일이 import해서 검사할 때는 서버를 열지 않는다. 이 파일을 직접 실행했을 때만 요청을 받는다.
// 포트는 컴퓨터에서 서비스를 구분하는 문 번호다. 기본 서버 문 번호는 5100이다.
if (isEntryPoint()) {
  const port = process.env.PORT || 5100;
  const app = await createApp();

  // Express 5는 포트를 열지 못한 오류(예: 이미 사용 중인 포트)를 이 함수의 첫 인자로 알려준다.
  // 확인하지 않으면 '실행 중'이라고 기록한 뒤 오류 없이 꺼지므로, 이유를 남기고 실패로 종료한다.
  const server = app.listen(port, (error) => {
    if (error) {
      logger.error({ err: error, port }, "Career Hub API failed to listen");
      process.exit(1);
    }
    logger.info({ port }, "Career Hub API listening");
  });

  // Ctrl+C나 종료 신호가 오면 새 요청은 받지 않고, 처리 중인 요청이 끝난 뒤 서버를 닫는다.
  // 끝나지 않는 요청 때문에 계속 기다리지 않도록 10초가 지나면 종료한다.
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
