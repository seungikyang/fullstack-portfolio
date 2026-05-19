// 풀스택 학습 문제집의 필수 파일과 빈칸 실습 구성을 검증하는 스크립트
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const requiredPaths = [
  "README.md",
  ".gitignore",
  "career-roadmap.md",
  "references.md",
  "student-checklist.md",
  "portfolio-template.md",
  "01-html-css/README.md",
  "01-html-css/problems.md",
  "01-html-css/answers.md",
  "01-html-css/starter/index.html",
  "01-html-css/starter/styles.css",
  "02-javascript-basics/README.md",
  "02-javascript-basics/problems.md",
  "02-javascript-basics/answers.md",
  "02-javascript-basics/starter/index.html",
  "02-javascript-basics/starter/styles.css",
  "02-javascript-basics/starter/app.js",
  "03-react-todo/README.md",
  "03-react-todo/problems.md",
  "03-react-todo/answers.md",
  "03-react-todo/package.json",
  "03-react-todo/src/App.jsx",
  "03-react-todo/src/components/TodoItem.jsx",
  "04-node-board-api/README.md",
  "04-node-board-api/problems.md",
  "04-node-board-api/answers.md",
  "04-node-board-api/src/server.js",
  "04-node-board-api/requests.http",
  "05-database-mongodb/README.md",
  "05-database-mongodb/problems.md",
  "05-database-mongodb/answers.md",
  "05-database-mongodb/src/server.js",
  "05-database-mongodb/src/models/Post.js",
  "06-login-auth/README.md",
  "06-login-auth/problems.md",
  "06-login-auth/answers.md",
  "06-login-auth/src/server.js",
  "06-login-auth/src/auth.js",
  "07-project-deploy/README.md",
  "07-project-deploy/problems.md",
  "07-project-deploy/answers.md",
  "07-project-deploy/deploy-checklist.md",
  "07-project-deploy/src/server.js",
  "07-project-deploy/public/index.html",
  "07-project-deploy/public/app.js",
  "08-fullstack-portfolio-project/README.md",
  "08-fullstack-portfolio-project/learning-map.md",
  "08-fullstack-portfolio-project/package.json",
  "08-fullstack-portfolio-project/.env.example",
  "08-fullstack-portfolio-project/index.html",
  "08-fullstack-portfolio-project/vite.config.js",
  "08-fullstack-portfolio-project/server/index.js",
  "08-fullstack-portfolio-project/server/auth.js",
  "08-fullstack-portfolio-project/server/data-store.js",
  "08-fullstack-portfolio-project/server/validators.js",
  "08-fullstack-portfolio-project/src/main.jsx",
  "08-fullstack-portfolio-project/src/App.jsx",
  "08-fullstack-portfolio-project/src/styles.css",
  "08-fullstack-portfolio-project/scripts/api-smoke-test.js",
  "scripts/verify-workbook.js",
  "scripts/check-progress.js"
];

const placeholderFiles = [
  "01-html-css/starter/index.html",
  "01-html-css/starter/styles.css",
  "02-javascript-basics/starter/app.js",
  "03-react-todo/src/App.jsx",
  "03-react-todo/src/components/TodoItem.jsx",
  "04-node-board-api/src/server.js",
  "05-database-mongodb/src/server.js",
  "06-login-auth/src/server.js",
  "06-login-auth/src/auth.js",
  "07-project-deploy/src/server.js",
  "07-project-deploy/public/app.js"
];

const sourceFiles = [
  "01-html-css/starter/index.html",
  "01-html-css/starter/styles.css",
  "02-javascript-basics/starter/index.html",
  "02-javascript-basics/starter/styles.css",
  "02-javascript-basics/starter/app.js",
  "03-react-todo/index.html",
  "03-react-todo/vite.config.js",
  "03-react-todo/src/main.jsx",
  "03-react-todo/src/App.jsx",
  "03-react-todo/src/App.css",
  "03-react-todo/src/components/TodoItem.jsx",
  "04-node-board-api/src/server.js",
  "04-node-board-api/requests.http",
  "05-database-mongodb/src/db.js",
  "05-database-mongodb/src/models/Post.js",
  "05-database-mongodb/src/server.js",
  "05-database-mongodb/requests.http",
  "06-login-auth/src/users.js",
  "06-login-auth/src/auth.js",
  "06-login-auth/src/server.js",
  "06-login-auth/requests.http",
  "07-project-deploy/src/server.js",
  "07-project-deploy/public/index.html",
  "07-project-deploy/public/styles.css",
  "07-project-deploy/public/app.js",
  "08-fullstack-portfolio-project/index.html",
  "08-fullstack-portfolio-project/vite.config.js",
  "08-fullstack-portfolio-project/server/index.js",
  "08-fullstack-portfolio-project/server/auth.js",
  "08-fullstack-portfolio-project/server/data-store.js",
  "08-fullstack-portfolio-project/server/validators.js",
  "08-fullstack-portfolio-project/src/main.jsx",
  "08-fullstack-portfolio-project/src/App.jsx",
  "08-fullstack-portfolio-project/src/styles.css",
  "08-fullstack-portfolio-project/scripts/api-smoke-test.js",
  "scripts/verify-workbook.js",
  "scripts/check-progress.js"
];

const packageScripts = {
  "package.json": ["verify", "progress"],
  "03-react-todo/package.json": ["dev", "build", "preview"],
  "04-node-board-api/package.json": ["dev", "start"],
  "05-database-mongodb/package.json": ["dev", "start"],
  "06-login-auth/package.json": ["dev", "start"],
  "07-project-deploy/package.json": ["dev", "start"],
  "08-fullstack-portfolio-project/package.json": ["dev", "build", "start", "test:api", "verify"]
};

let hasError = false;

function fail(message) {
  hasError = true;
  console.error(`검증 실패: ${message}`);
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const relativePath of requiredPaths) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`${relativePath} 파일이 없습니다.`);
    continue;
  }

  if (readFile(relativePath).trim().length === 0) {
    fail(`${relativePath} 파일이 비어 있습니다.`);
  }
}

for (const relativePath of placeholderFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    continue;
  }

  const content = readFile(relativePath);

  if (!/(빈칸|TODO|____)/.test(content)) {
    fail(`${relativePath} 파일에 학습용 빈칸 표시가 없습니다.`);
  }
}

for (const relativePath of sourceFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    continue;
  }

  const firstLine = readFile(relativePath).split(/\r?\n/)[0];

  if (!/[가-힣]/.test(firstLine)) {
    fail(`${relativePath} 첫 줄에 한국어 역할 주석이 없습니다.`);
  }
}

for (const [relativePath, scripts] of Object.entries(packageScripts)) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    continue;
  }

  try {
    const packageJson = JSON.parse(readFile(relativePath));

    for (const scriptName of scripts) {
      if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
        fail(`${relativePath} 파일에 ${scriptName} 스크립트가 없습니다.`);
      }
    }
  } catch (error) {
    fail(`${relativePath} 파일의 JSON 형식이 올바르지 않습니다.`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log("워크북 구조 검증이 통과했습니다.");
