// Career Hub의 Express API와 정적 파일 제공을 구성하는 서버 진입 파일
import "dotenv/config";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { hashPassword, requireAuth, signToken, verifyPassword } from "./auth.js";
import { JsonStore, toPublicUser } from "./data-store.js";
import {
  validateApplication,
  validateProject,
  validateRegister
} from "./validators.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDataFile = join(__dirname, "../data/career-hub.json");

function sendValidation(res, errors) {
  return res.status(400).json({ message: errors[0], errors });
}

function dashboardFor(applications, projects) {
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

  return {
    totalApplications: applications.length,
    interviewCount: statusCounts["면접"] || 0,
    offerCount: statusCounts["합격"] || 0,
    upcomingCount,
    projectCount: projects.length,
    completedProjectCount: projects.filter((project) => project.status === "완료").length,
    statusCounts
  };
}

async function seedDemoData(store) {
  if (process.env.SEED_DEMO === "false" || store.listUsers().length > 0) {
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
}

export async function createApp(options = {}) {
  const app = express();
  const store = new JsonStore(options.dataFile || process.env.DATA_FILE || defaultDataFile);
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  // 개발 편의: localhost와 127.0.0.1을 모두 허용한다. Origin이 없는 요청(curl, smoke test)도 허용한다.
  const allowedOrigins = new Set([
    clientOrigin,
    clientOrigin.replace("localhost", "127.0.0.1"),
    clientOrigin.replace("127.0.0.1", "localhost")
  ]);

  await seedDemoData(store);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error("허용되지 않은 출처입니다."));
      }
    })
  );
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "career-hub" });
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

    return res.status(201).json({
      token: signToken(user),
      user: toPublicUser(user)
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const user = store.findUserByEmail(req.body.email);

    if (!user) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const isPasswordValid = await verifyPassword(req.body.password || "", user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    return res.json({
      token: signToken(user),
      user: toPublicUser(user)
    });
  });

  app.get("/api/me", requireAuth, (req, res) => {
    const user = store.findUserById(req.user.id);
    res.json({ user: toPublicUser(user) });
  });

  app.get("/api/dashboard", requireAuth, (req, res) => {
    const applications = store.listApplications(req.user.id);
    const projects = store.listProjects(req.user.id);
    res.json(dashboardFor(applications, projects));
  });

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

  const distPath = resolve(__dirname, "../dist");
  const indexHtml = join(distPath, "index.html");
  app.use(express.static(distPath));
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

  app.use((req, res) => {
    res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 5100;
  const app = await createApp();

  app.listen(port, () => {
    console.log(`Career Hub API가 http://localhost:${port} 에서 실행 중입니다.`);
  });
}

