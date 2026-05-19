// 이력서와 지원서 제출 전에 Career Hub 산출물 구성을 점검하는 스크립트
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(root, "..");

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
  "src/App.jsx",
  "src/styles.css",
  "scripts/api-smoke-test.js"
];

const requiredReadmeTerms = ["React", "Express", "JWT", "CRUD", "smoke test", "1~7단계"];
const requiredLearningFolders = [
  "01-html-css",
  "02-javascript-basics",
  "03-react-todo",
  "04-node-board-api",
  "05-database-mongodb",
  "06-login-auth",
  "07-project-deploy"
];

let hasError = false;

function fail(message) {
  hasError = true;
  console.error(`제출 감사 실패: ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

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

for (const pattern of ["node_modules/", "dist/", ".env", "08-fullstack-portfolio-project/data/*.json"]) {
  if (!rootGitignore.includes(pattern)) {
    fail(`루트 .gitignore에 ${pattern} 패턴이 없습니다.`);
  }
}

if (fs.existsSync(path.join(root, ".env"))) {
  fail(".env 파일은 제출 전에 커밋하면 안 됩니다.");
}

const authSource = read("server/auth.js");
if (!authSource.includes("bcrypt") || !authSource.includes("jwt.verify")) {
  fail("server/auth.js에서 bcrypt 또는 JWT 검증 흐름을 찾지 못했습니다.");
}

const smokeSource = read("scripts/api-smoke-test.js");
for (const expectedFlow of ["/api/auth/register", "/api/auth/login", "/api/applications", "/api/projects"]) {
  if (!smokeSource.includes(expectedFlow)) {
    fail(`api-smoke-test.js에 ${expectedFlow} 검증 흐름이 없습니다.`);
  }
}

const packageJson = JSON.parse(read("package.json"));
for (const scriptName of ["build", "test:api", "audit:submit", "clean:generated", "verify"]) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    fail(`package.json에 ${scriptName} 스크립트가 없습니다.`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log("이력서·지원서 제출 전 감사가 통과했습니다.");
