// 제출 전에 필요한 파일과 실행 방법이 빠지지 않았는지 확인하는 자동 점검 도구다.
// 코드의 글자와 파일 존재 여부를 확인한다. 실제 동작 검사는 별도의 테스트가 맡는다.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// root는 Career Hub 폴더이고, workspaceRoot는 그 위의 전체 학습 폴더다. 파일이 어느 쪽에 있는지 구분한다.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(root, "..");

// 제출할 때 꼭 들어 있어야 하는 파일 목록이다. 없거나 내용이 비어 있으면 문제로 기록한다.
const requiredFiles = [
  "README.md",
  "learning-map.md",
  "resume-assets.md",
  "submission-checklist.md",
  ".env.example",
  "package.json",
  "server/index.js",
  "server/auth.js",
  "server/data-store.js",
  "server/validators.test.js",
  "server/auth.test.js",
  "server/data-store.test.js",
  "server/api.test.js",
  "server/logger.js",
  "server/openapi.json",
  "src/App.jsx",
  "src/App.test.jsx",
  "src/main.jsx",
  "src/styles.css",
  "src/ErrorBoundary.jsx",
  "src/ErrorBoundary.test.jsx",
  "src/test/setup.js",
  "scripts/api-smoke-test.js",
  "Dockerfile",
  ".dockerignore",
  "docker-compose.yml",
  "docker-compose.dev.yml",
  "render.yaml",
  "fly.toml",
  "eslint.config.js",
  ".prettierrc.json",
  "vitest.config.js",
  ".husky/pre-commit"
];

// README 소개 문서에 기술 이름과 검사 방법 설명이 있는지 찾을 검색어 목록이다.
const requiredReadmeTerms = [
  "React",
  "Express",
  "JWT",
  "CRUD",
  "smoke test",
  "1~7단계",
  "Docker",
  "Vitest",
  "helmet",
  "OpenAPI",
  "pino",
  "취업 워크북"
];
const requiredLearningFolders = [
  "01-html-css",
  "02-javascript-basics",
  "03-react-todo",
  "04-node-board-api",
  "05-database-mongodb",
  "06-login-auth",
  "07-project-deploy"
];

const requiredRootGuideFolders = [...requiredLearningFolders, "08-fullstack-portfolio-project"];

// 빠진 항목을 하나 찾았다고 멈추지 않고 끝까지 확인한다. hasError는 문제를 찾았는지 기억하는 값이다.
let hasError = false;

function fail(message) {
  hasError = true;
  console.error(`제출 감사 실패: ${message}`);
}

// 파일을 읽는 방법을 모아둔 함수다. utf8은 한글을 포함한 글자를 읽는 방식이다.
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

// 1) 필수 파일이 실제로 있는지, 내용이 비어 있지 않은지 확인한다.
for (const relativePath of requiredFiles) {
  const fullPath = path.join(root, relativePath);

  if (!fs.existsSync(fullPath)) {
    fail(`${relativePath} 파일이 없습니다.`);
    continue;
  }

  if (fs.statSync(fullPath).isFile() && read(relativePath).trim().length === 0) {
    fail(`${relativePath} 파일이 비어 있습니다.`);
  }
}

// 2) README·학습 연결표·학습 안내에 필요한 설명이 들어 있는지 확인한다.
const readme = read("README.md");
for (const term of requiredReadmeTerms) {
  if (!readme.includes(term)) {
    fail(`README.md에 ${term} 설명이 없습니다.`);
  }
}

const learningMap = read("learning-map.md");
for (const folder of requiredLearningFolders) {
  if (!learningMap.includes(folder)) {
    fail(`learning-map.md에 ${folder} 연결 설명이 없습니다.`);
  }
}

const rootGitignore = fs.existsSync(path.join(workspaceRoot, ".gitignore"))
  ? fs.readFileSync(path.join(workspaceRoot, ".gitignore"), "utf8")
  : "";

// 3) .gitignore는 Git에 넣지 않을 파일 목록이다. 비밀 설정과 내 기록·생성 파일을 제외하는지 확인한다.
for (const pattern of [
  "node_modules/",
  "dist/",
  ".env",
  "08-fullstack-portfolio-project/data/*.json"
]) {
  if (!rootGitignore.includes(pattern)) {
    fail(`루트 .gitignore에 ${pattern} 패턴이 없습니다.`);
  }
}

const rootGuidePath = path.join(workspaceRoot, "folder-to-practice-guide.md");
if (!fs.existsSync(rootGuidePath)) {
  fail("루트 folder-to-practice-guide.md 파일이 없습니다.");
} else {
  const rootGuide = fs.readFileSync(rootGuidePath, "utf8");
  for (const folder of requiredRootGuideFolders) {
    if (!rootGuide.includes(folder)) {
      fail(`folder-to-practice-guide.md에 ${folder} 설명이 없습니다.`);
    }
  }
}

// 로컬 .env 파일은 실행에 필요하므로 존재 자체는 정상이다.
// .env에는 비밀 설정이 있을 수 있으므로 Git의 저장 기록에 포함되어 있는지 확인한다.
// Git을 쓸 수 없으면 위에서 확인한 제외 규칙까지만 검사한다. 과거에 비밀이 공개됐는지는 검사하지 않는다.
try {
  const tracked = execFileSync("git", ["ls-files", ".env"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();

  if (tracked) {
    fail(".env가 git에 커밋되어 있습니다. git rm --cached .env 로 제외하세요.");
  }
} catch {
  // git을 사용할 수 없는 환경(ZIP 제출 등)에서는 건너뛴다.
}

// 4) 로그인 검사 코드와 핵심 동작 검사에 필요한 주소가 파일에 적혀 있는지 확인한다.
const authSource = read("server/auth.js");
if (!authSource.includes("bcrypt") || !authSource.includes("jwt.verify")) {
  fail("server/auth.js에서 bcrypt 또는 JWT 검증 흐름을 찾지 못했습니다.");
}

const smokeSource = read("scripts/api-smoke-test.js");
for (const expectedFlow of [
  "/api/auth/register",
  "/api/auth/login",
  "/api/workbook",
  "/api/applications",
  "/api/projects"
]) {
  if (!smokeSource.includes(expectedFlow)) {
    fail(`api-smoke-test.js에 ${expectedFlow} 검증 흐름이 없습니다.`);
  }
}

// 5) package.json은 실행 명령과 설치할 도구의 목록이다. 필요한 항목이 있는지 확인한다.
const packageJson = JSON.parse(read("package.json"));
const requiredScripts = [
  "build",
  "test:api",
  "test:unit",
  "test",
  "lint",
  "format:check",
  "audit:submit",
  "clean:generated",
  "verify"
];
for (const scriptName of requiredScripts) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    fail(`package.json에 ${scriptName} 스크립트가 없습니다.`);
  }
}

const requiredDeps = ["helmet", "express-rate-limit", "pino", "pino-http"];
for (const dep of requiredDeps) {
  if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
    fail(`package.json dependencies에 ${dep}이(가) 없습니다.`);
  }
}

const requiredDevDeps = [
  "vitest",
  "supertest",
  "eslint",
  "prettier",
  "@testing-library/react",
  "@testing-library/dom",
  "jsdom",
  "husky",
  "lint-staged"
];
for (const dep of requiredDevDeps) {
  if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
    fail(`package.json devDependencies에 ${dep}이(가) 없습니다.`);
  }
}

// 6) 서버의 보안 검사·활동 일지·종료 방법과 화면의 오류 안내가 시작 코드에 연결됐는지 확인한다.
const indexSource = read("server/index.js");
for (const term of ["helmet", "rateLimit", "limit:", "SIGTERM", "pinoHttp", "openapi.json"]) {
  if (!indexSource.includes(term)) {
    fail(`server/index.js에 ${term} 적용이 보이지 않습니다.`);
  }
}

const mainJsx = read("src/main.jsx");
if (!mainJsx.includes("ErrorBoundary")) {
  fail("src/main.jsx에서 ErrorBoundary로 App을 감싸지 않았습니다.");
}

const licensePath = path.join(workspaceRoot, "LICENSE");
if (!fs.existsSync(licensePath)) {
  fail("저장소 루트에 LICENSE 파일이 없습니다.");
}

for (const rootFile of [
  "CONTRIBUTING.md",
  ".nvmrc",
  ".editorconfig",
  ".github/PULL_REQUEST_TEMPLATE.md"
]) {
  if (!fs.existsSync(path.join(workspaceRoot, rootFile))) {
    fail(`저장소 루트에 ${rootFile} 파일이 없습니다.`);
  }
}

// 7) API 사용 설명서(OpenAPI)를 JSON으로 읽을 수 있는지, 필요한 주소가 적혀 있는지 확인한다.
try {
  const openApi = JSON.parse(read("server/openapi.json"));
  if (!openApi.openapi || !openApi.openapi.startsWith("3.")) {
    fail("server/openapi.json이 OpenAPI 3 스펙이 아닙니다.");
  }
  if (!openApi.paths || !openApi.paths["/api/auth/login"]) {
    fail("server/openapi.json에 /api/auth/login 경로가 없습니다.");
  }
  if (!openApi.paths || !openApi.paths["/api/workbook"]) {
    fail("server/openapi.json에 /api/workbook 경로가 없습니다.");
  }
} catch {
  fail("server/openapi.json JSON 파싱 실패.");
}

// 8) Docker 실행 설정과 CI(코드를 올렸을 때 자동 검사하는 작업) 설정이 있는지 확인한다.
const dockerfileSource = read("Dockerfile");
if (!dockerfileSource.includes("AS build") || !dockerfileSource.includes("AS runtime")) {
  fail("Dockerfile이 멀티 스테이지(build → runtime) 구조가 아닙니다.");
}

const ciPath = path.join(workspaceRoot, ".github", "workflows", "ci.yml");
if (!fs.existsSync(ciPath)) {
  fail(".github/workflows/ci.yml CI 워크플로가 없습니다.");
}

// 끝날 때 문제를 찾았으면 종료 코드 1로 자동 실행 도구에도 알린다. 0은 성공, 1은 실패를 뜻한다.
if (hasError) {
  process.exit(1);
}

console.log("이력서·지원서 제출 전 감사가 통과했습니다.");
