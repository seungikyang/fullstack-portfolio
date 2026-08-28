// 이력서와 지원서 제출 전에 Career Hub 산출물 구성을 점검하는 스크립트
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Career Hub 자체(root)와 한 단계 위 전체 워크북(workspaceRoot)을 구분해 검사한다.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(root, "..");

// 제출물에서 빠지면 실행·검증·설명이 불가능해지는 필수 파일 목록이다.
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

// README가 실제 구현의 핵심 기술과 검증 방식을 설명하는지 확인할 검색어다.
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

// 오류를 하나씩 모아 한 번 실행으로 누락 내용을 모두 보여준다.
let hasError = false;

function fail(message) {
  hasError = true;
  console.error(`제출 감사 실패: ${message}`);
}

// Career Hub 루트를 기준으로 UTF-8 텍스트 파일을 읽는 공통 헬퍼다.
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

// 1) 필수 파일의 존재 여부와 빈 파일 여부를 검사한다.
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

// 2) README·학습 지도·루트 안내가 실제 프로젝트와 학습 단계를 설명하는지 검사한다.
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

// 3) 비밀값·의존성·빌드 결과·로컬 데이터가 Git에 올라가지 않게 ignore 규칙을 확인한다.
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
// 실제 위험은 ".env가 git에 커밋된 경우"이므로 추적 여부만 확인한다.
// (git이 없거나 저장소가 아니면 위쪽 .gitignore 패턴 검사로 이미 보호된다.)
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

// 4) 코드 문자열을 확인해 인증과 smoke test의 핵심 흐름이 실수로 빠지지 않게 한다.
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

// 5) 제출자가 사용할 명령과 보안·검증 패키지가 package.json에 선언됐는지 확인한다.
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

// 6) 서버 보안·로깅·종료 처리와 프론트 오류 경계가 실제 진입 파일에 연결됐는지 확인한다.
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

// 7) OpenAPI 파일은 단순 존재뿐 아니라 JSON 파싱과 필수 경로까지 검사한다.
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

// 8) Docker 멀티 스테이지 빌드와 루트 CI 워크플로가 제출물에 포함됐는지 확인한다.
const dockerfileSource = read("Dockerfile");
if (!dockerfileSource.includes("AS build") || !dockerfileSource.includes("AS runtime")) {
  fail("Dockerfile이 멀티 스테이지(build → runtime) 구조가 아닙니다.");
}

const ciPath = path.join(workspaceRoot, ".github", "workflows", "ci.yml");
if (!fs.existsSync(ciPath)) {
  fail(".github/workflows/ci.yml CI 워크플로가 없습니다.");
}

// 하나라도 실패하면 종료 코드 1로 npm/CI에도 감사 실패를 알린다.
if (hasError) {
  process.exit(1);
}

console.log("이력서·지원서 제출 전 감사가 통과했습니다.");
