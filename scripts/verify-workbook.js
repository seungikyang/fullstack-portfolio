// 풀스택 학습 문제집의 필수 파일과 빈칸 실습 구성을 검증하는 스크립트
// 실행 방법: `npm run verify`(= npm run verify:structure). 실패하면 종료 코드 1로 CI도 함께 멈춘다.
const fs = require("node:fs");
const path = require("node:path");
const { markdownSlug } = require("./markdown-slug.js");
const { problemWorkTracks } = require("./problem-work-files.js");

const root = path.resolve(__dirname, "..");

// 이 저장소에 반드시 있어야 하는 파일 목록(문서·설정·실습 코드). 하나라도 없으면 검증 실패.
const requiredPaths = [
  "README.md",
  "START-HERE.md",
  "index.html",
  "history.html",
  "LICENSE",
  "CONTRIBUTING.md",
  ".gitignore",
  ".nvmrc",
  ".editorconfig",
  "mise.toml",
  ".devcontainer/devcontainer.json",
  ".devcontainer/post-create.sh",
  ".vscode/extensions.json",
  ".vscode/settings.json",
  ".github/workflows/ci.yml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/bug_report.md",
  ".github/ISSUE_TEMPLATE/feature_request.md",
  "folder-to-practice-guide.md",
  "feature-implementation-workbook.md",
  "career-roadmap.md",
  "references.md",
  "student-checklist.md",
  "portfolio-template.md",
  "01-html-css/README.md",
  "01-html-css/problems.md",
  "01-html-css/hints.md",
  "01-html-css/answers.md",
  "01-html-css/starter/index.html",
  "01-html-css/starter/styles.css",
  "02-javascript-basics/README.md",
  "02-javascript-basics/problems.md",
  "02-javascript-basics/hints.md",
  "02-javascript-basics/answers.md",
  "02-javascript-basics/starter/index.html",
  "02-javascript-basics/starter/styles.css",
  "02-javascript-basics/starter/app.js",
  "03-react-todo/README.md",
  "03-react-todo/problems.md",
  "03-react-todo/hints.md",
  "03-react-todo/answers.md",
  "03-react-todo/package.json",
  "03-react-todo/src/App.jsx",
  "03-react-todo/src/components/TodoItem.jsx",
  "04-node-board-api/README.md",
  "04-node-board-api/problems.md",
  "04-node-board-api/hints.md",
  "04-node-board-api/answers.md",
  "04-node-board-api/src/server.js",
  "04-node-board-api/requests.http",
  "05-database-mongodb/README.md",
  "05-database-mongodb/problems.md",
  "05-database-mongodb/hints.md",
  "05-database-mongodb/answers.md",
  "05-database-mongodb/src/server.js",
  "05-database-mongodb/src/models/Post.js",
  "05-database-mongodb/requests.http",
  "06-login-auth/README.md",
  "06-login-auth/problems.md",
  "06-login-auth/hints.md",
  "06-login-auth/answers.md",
  "06-login-auth/src/server.js",
  "06-login-auth/src/auth.js",
  "06-login-auth/requests.http",
  "07-project-deploy/README.md",
  "07-project-deploy/problems.md",
  "07-project-deploy/hints.md",
  "07-project-deploy/answers.md",
  "07-project-deploy/deploy-checklist.md",
  "07-project-deploy/src/server.js",
  "07-project-deploy/public/index.html",
  "07-project-deploy/public/app.js",
  "08-fullstack-portfolio-project/README.md",
  "08-fullstack-portfolio-project/learning-map.md",
  "08-fullstack-portfolio-project/resume-assets.md",
  "08-fullstack-portfolio-project/submission-checklist.md",
  "08-fullstack-portfolio-project/package.json",
  "08-fullstack-portfolio-project/.env.example",
  "08-fullstack-portfolio-project/index.html",
  "08-fullstack-portfolio-project/vite.config.js",
  "08-fullstack-portfolio-project/server/index.js",
  "08-fullstack-portfolio-project/server/auth.js",
  "08-fullstack-portfolio-project/server/data-store.js",
  "08-fullstack-portfolio-project/server/validators.js",
  "08-fullstack-portfolio-project/server/logger.js",
  "08-fullstack-portfolio-project/server/openapi.json",
  "08-fullstack-portfolio-project/src/main.jsx",
  "08-fullstack-portfolio-project/src/App.jsx",
  "08-fullstack-portfolio-project/src/App.test.jsx",
  "08-fullstack-portfolio-project/src/ErrorBoundary.jsx",
  "08-fullstack-portfolio-project/src/styles.css",
  "08-fullstack-portfolio-project/scripts/api-smoke-test.js",
  "08-fullstack-portfolio-project/scripts/submission-audit.js",
  "08-fullstack-portfolio-project/scripts/clean-generated.js",
  "08-fullstack-portfolio-project/scripts/free-port.js",
  "08-fullstack-portfolio-project/scripts/free-port.test.js",
  "08-fullstack-portfolio-project/Dockerfile",
  "08-fullstack-portfolio-project/docker-compose.yml",
  "08-fullstack-portfolio-project/eslint.config.js",
  "08-fullstack-portfolio-project/.prettierrc.json",
  "08-fullstack-portfolio-project/vitest.config.js",
  "09-typescript/README.md",
  "09-typescript/problems.md",
  "09-typescript/hints.md",
  "09-typescript/answers.md",
  "09-typescript/package.json",
  "09-typescript/package-lock.json",
  "09-typescript/tsconfig.json",
  "09-typescript/starter/01-basic-types.ts",
  "09-typescript/starter/02-interface-design.ts",
  "09-typescript/starter/03-react-todo.tsx",
  "09-typescript/starter/04-express-typed.ts",
  "09-typescript/starter/05-narrowing.ts",
  "09-typescript/starter/06-generic-fetch.ts",
  "10-sql-oracle/README.md",
  "10-sql-oracle/problems.md",
  "10-sql-oracle/hints.md",
  "10-sql-oracle/answers.md",
  "10-sql-oracle/starter/01-ddl.sql",
  "10-sql-oracle/starter/02-select.sql",
  "10-sql-oracle/starter/03-aggregate.sql",
  "10-sql-oracle/starter/04-join.sql",
  "10-sql-oracle/starter/05-subquery.sql",
  "10-sql-oracle/starter/06-transaction.sql",
  "10-sql-oracle/starter/07-index.sql",
  "11-java-spring/README.md",
  "11-java-spring/problems.md",
  "11-java-spring/hints.md",
  "11-java-spring/answers.md",
  "11-java-spring/starter/README.md",
  "12-testing/README.md",
  "12-testing/problems.md",
  "12-testing/hints.md",
  "12-testing/answers.md",
  "12-testing/starter/js/package.json",
  "12-testing/starter/js/package-lock.json",
  "12-testing/starter/js/src/calculator.ts",
  "12-testing/starter/js/src/calculator.test.ts",
  "12-testing/starter/js/src/app.ts",
  "12-testing/starter/js/src/app.test.ts",
  "12-testing/starter/js/src/notification.ts",
  "12-testing/starter/js/src/mailer.ts",
  "12-testing/starter/js/src/notification.test.ts",
  "13-git-collab/README.md",
  "13-git-collab/problems.md",
  "13-git-collab/hints.md",
  "13-git-collab/answers.md",
  "14-docker-deploy/README.md",
  "14-docker-deploy/problems.md",
  "14-docker-deploy/hints.md",
  "14-docker-deploy/answers.md",
  "14-docker-deploy/starter/node-board/Dockerfile",
  "14-docker-deploy/starter/node-board/.dockerignore",
  "14-docker-deploy/starter/node-board/README.md",
  "14-docker-deploy/starter/spring-board/Dockerfile",
  "14-docker-deploy/starter/compose-postgres/docker-compose.yml",
  "14-docker-deploy/starter/compose-postgres/.env.example",
  "14-docker-deploy/starter/.github/workflows/ci.yml",
  "15-cs-fundamentals/README.md",
  "15-cs-fundamentals/problems.md",
  "15-cs-fundamentals/hints.md",
  "15-cs-fundamentals/answers.md",
  "16-security/README.md",
  "16-security/problems.md",
  "16-security/hints.md",
  "16-security/answers.md",
  "16-security/starter/01-xss-stored.js",
  "16-security/starter/02-xss-reflected.js",
  "16-security/starter/03-sql-injection.js",
  "16-security/starter/04-csrf-demo/vulnerable.html",
  "16-security/starter/04-csrf-demo/protected.js",
  "16-security/starter/05-cors.js",
  "17-interview-prep/README.md",
  "17-interview-prep/interview-cards.md",
  "17-interview-prep/self-intro-templates.md",
  "17-interview-prep/behavioral-questions.md",
  "17-interview-prep/project-pitch-template.md",
  "monorepo-mini-app/README.md",
  "monorepo-mini-app/.env.example",
  "monorepo-mini-app/package.json",
  "monorepo-mini-app/tsconfig.base.json",
  "monorepo-mini-app/vitest.config.ts",
  "monorepo-mini-app/Dockerfile",
  "monorepo-mini-app/.dockerignore",
  "monorepo-mini-app/docker-compose.yml",
  "monorepo-mini-app/docker-compose.dev.yml",
  "monorepo-mini-app/eslint.config.js",
  "monorepo-mini-app/.prettierrc.json",
  "monorepo-mini-app/.prettierignore",
  "monorepo-mini-app/.husky/pre-commit",
  "monorepo-mini-app/render.yaml",
  "monorepo-mini-app/fly.toml",
  "monorepo-mini-app/packages/shared/package.json",
  "monorepo-mini-app/packages/shared/src/index.ts",
  "monorepo-mini-app/packages/shared/src/index.test.ts",
  "monorepo-mini-app/packages/api/package.json",
  "monorepo-mini-app/packages/api/openapi.json",
  "monorepo-mini-app/packages/api/db/init.sql",
  "monorepo-mini-app/packages/api/src/server.ts",
  "monorepo-mini-app/packages/api/src/notes-store.ts",
  "monorepo-mini-app/packages/api/src/notes-store-pg.ts",
  "monorepo-mini-app/packages/api/src/notes-store.test.ts",
  "monorepo-mini-app/packages/api/src/server.test.ts",
  "monorepo-mini-app/packages/api/src/openapi-sync.test.ts",
  "monorepo-mini-app/packages/web/package.json",
  "monorepo-mini-app/packages/web/index.html",
  "monorepo-mini-app/packages/web/vite.config.ts",
  "monorepo-mini-app/packages/web/src/main.tsx",
  "monorepo-mini-app/packages/web/src/App.tsx",
  "monorepo-mini-app/packages/web/src/App.test.tsx",
  "monorepo-mini-app/packages/web/src/test/setup.ts",
  "scripts/problem-work-files.js",
  "scripts/verify-workbook.js",
  "scripts/verify-workbook.test.js",
  "scripts/workbook-editor.js",
  "scripts/verify-programs.js",
  "scripts/check-progress.js",
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
  "07-project-deploy/public/app.js",
  "09-typescript/starter/01-basic-types.ts",
  "09-typescript/starter/02-interface-design.ts",
  "09-typescript/starter/03-react-todo.tsx",
  "09-typescript/starter/04-express-typed.ts",
  "09-typescript/starter/05-narrowing.ts",
  "09-typescript/starter/06-generic-fetch.ts",
  "10-sql-oracle/starter/01-ddl.sql",
  "10-sql-oracle/starter/02-select.sql",
  "10-sql-oracle/starter/03-aggregate.sql",
  "10-sql-oracle/starter/04-join.sql",
  "10-sql-oracle/starter/05-subquery.sql",
  "10-sql-oracle/starter/07-index.sql",
  "12-testing/starter/js/src/calculator.test.ts",
  "12-testing/starter/js/src/app.test.ts",
  "12-testing/starter/js/src/notification.test.ts",
  "14-docker-deploy/starter/node-board/Dockerfile",
  "14-docker-deploy/starter/node-board/.dockerignore",
  "14-docker-deploy/starter/spring-board/Dockerfile",
  "14-docker-deploy/starter/compose-postgres/docker-compose.yml",
  "14-docker-deploy/starter/.github/workflows/ci.yml",
  "16-security/starter/01-xss-stored.js",
  "16-security/starter/02-xss-reflected.js",
  "16-security/starter/03-sql-injection.js",
  "16-security/starter/04-csrf-demo/protected.js",
  "16-security/starter/05-cors.js",
];

const sourceFiles = [
  "index.html",
  "history.html",
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
  "08-fullstack-portfolio-project/server/logger.js",
  "08-fullstack-portfolio-project/src/main.jsx",
  "08-fullstack-portfolio-project/src/App.jsx",
  "08-fullstack-portfolio-project/src/App.test.jsx",
  "08-fullstack-portfolio-project/src/ErrorBoundary.jsx",
  "08-fullstack-portfolio-project/src/styles.css",
  "08-fullstack-portfolio-project/scripts/api-smoke-test.js",
  "08-fullstack-portfolio-project/scripts/submission-audit.js",
  "08-fullstack-portfolio-project/scripts/clean-generated.js",
  "08-fullstack-portfolio-project/scripts/free-port.js",
  "08-fullstack-portfolio-project/scripts/free-port.test.js",
  "09-typescript/starter/01-basic-types.ts",
  "09-typescript/starter/02-interface-design.ts",
  "09-typescript/starter/03-react-todo.tsx",
  "09-typescript/starter/04-express-typed.ts",
  "09-typescript/starter/05-narrowing.ts",
  "09-typescript/starter/06-generic-fetch.ts",
  "10-sql-oracle/starter/01-ddl.sql",
  "10-sql-oracle/starter/02-select.sql",
  "10-sql-oracle/starter/03-aggregate.sql",
  "10-sql-oracle/starter/04-join.sql",
  "10-sql-oracle/starter/05-subquery.sql",
  "10-sql-oracle/starter/06-transaction.sql",
  "10-sql-oracle/starter/07-index.sql",
  "12-testing/starter/js/src/calculator.ts",
  "12-testing/starter/js/src/calculator.test.ts",
  "12-testing/starter/js/src/app.ts",
  "12-testing/starter/js/src/app.test.ts",
  "12-testing/starter/js/src/notification.ts",
  "12-testing/starter/js/src/mailer.ts",
  "12-testing/starter/js/src/notification.test.ts",
  "16-security/starter/01-xss-stored.js",
  "16-security/starter/02-xss-reflected.js",
  "16-security/starter/03-sql-injection.js",
  "16-security/starter/04-csrf-demo/protected.js",
  "16-security/starter/05-cors.js",
  "scripts/problem-work-files.js",
  "scripts/verify-workbook.js",
  "scripts/verify-workbook.test.js",
  "scripts/workbook-editor.js",
  "scripts/verify-programs.js",
  "scripts/check-progress.js",
];

// 각 package.json에 반드시 있어야 하는 npm 스크립트 목록. 문서의 실행 안내가 실제로 동작하게 유지한다.
const packageScripts = {
  "package.json": [
    "test",
    "progress",
    "verify",
    "verify:structure",
    "verify:programs",
    "verify:learning",
  ],
  "03-react-todo/package.json": ["dev", "build", "preview"],
  "04-node-board-api/package.json": ["dev", "start"],
  "05-database-mongodb/package.json": ["dev", "start"],
  "06-login-auth/package.json": ["dev", "start"],
  "07-project-deploy/package.json": ["dev", "start"],
  "08-fullstack-portfolio-project/package.json": [
    "dev",
    "dev:stop",
    "build",
    "start",
    "audit:submit",
    "clean:generated",
    "test:api",
    "test:unit",
    "lint",
    "format:check",
    "verify",
  ],
  "09-typescript/package.json": ["typecheck", "build"],
  "12-testing/starter/js/package.json": ["test", "test:coverage"],
  "16-security/package.json": ["check"],
  "monorepo-mini-app/package.json": [
    "dev",
    "lint",
    "format:check",
    "typecheck",
    "test",
    "build",
  ],
};

// 01~17단계 폴더 이름. 순서까지 그대로 검사한다(학습 지도와 폴더가 어긋나면 실패).
const guideFolders = [
  "01-html-css",
  "02-javascript-basics",
  "03-react-todo",
  "04-node-board-api",
  "05-database-mongodb",
  "06-login-auth",
  "07-project-deploy",
  "08-fullstack-portfolio-project",
  "09-typescript",
  "10-sql-oracle",
  "11-java-spring",
  "12-testing",
  "13-git-collab",
  "14-docker-deploy",
  "15-cs-fundamentals",
  "16-security",
  "17-interview-prep",
];

// problem-work-files.js의 파일 목록을 "problems.md에 있어야 할 링크" 형태로 바꿔둔다.
const problemWorkExpectations = Object.fromEntries(
  Object.entries(problemWorkTracks).map(([folder, track]) => [
    folder,
    {
      links: [
        ...track.files.map((file) => `./${file}?view=source`),
        ...(track.guideLinks || []),
      ],
      marker: track.marker,
    },
  ]),
);

// 링크 검사에서 제외할 폴더(라이브러리·결과물·작업 기록 등)
const documentSkipDirectories = new Set([
  ".agents",
  ".claude",
  ".codex",
  ".git",
  ".omc",
  "_workspace",
  "data",
  "dist",
  "node_modules",
]);

// 검사 대상 문서(.md, .html)를 하위 폴더까지 모두 수집한다
function walkDocuments(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && documentSkipDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDocuments(fullPath));
    } else if (
      [".md", ".html"].includes(path.extname(entry.name).toLowerCase())
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// 문서 안에 실제로 존재하는 앵커(id/name 속성, Markdown 제목) 목록을 모은다.
// 다른 문서가 "#제목" 링크를 걸 때 그 제목이 정말 있는지 확인하기 위한 재료다.
function documentAnchors(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const anchors = new Set(
    [...content.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)].map(
      (match) => match[1],
    ),
  );

  if (path.extname(filePath).toLowerCase() !== ".md") {
    return anchors;
  }

  // Markdown 코드 블록(``` 사이)은 제목 앵커 후보에서 제외한다 — 예시 코드의 # 주석을 제목으로 오해하지 않게
  const slugCounts = new Map();
  let inFence = false;

  for (const line of content.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (!heading) {
      continue;
    }

    const baseSlug = markdownSlug(heading[1]);
    const duplicateCount = slugCounts.get(baseSlug) || 0;
    const slug =
      duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount}`;
    slugCounts.set(baseSlug, duplicateCount + 1);
    anchors.add(slug);
  }

  return anchors;
}

// 링크 대상 문자열에서 순수 경로만 뽑는다(제목 뒤 <주소> 형식, "주소" 형식 처리)
function markdownTarget(rawTarget) {
  const target = rawTarget.trim();
  if (target.startsWith("<")) {
    const closingBracket = target.indexOf(">");
    return closingBracket === -1 ? target : target.slice(1, closingBracket);
  }

  return target.split(/\s+["']/)[0];
}

// 저장소의 모든 문서를 훑어 "깨진 상대 링크·없는 앵커"를 찾아낸다.
// 외부 http 링크와 빈칸(____)이 들어간 예시 링크는 검사에서 건너뛴다.
function findLocalLinkErrors(documentRoot) {
  const errors = [];

  for (const filePath of walkDocuments(documentRoot)) {
    const content = fs.readFileSync(filePath, "utf8");
    const references = [
      ...[...content.matchAll(/!?\[[^\]]*\]\(([^)\n]+)\)/g)].map((match) => ({
        index: match.index,
        target: markdownTarget(match[1]),
      })),
      ...[...content.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map(
        (match) => ({
          index: match.index,
          target: match[1],
        }),
      ),
    ];

    // 링크를 파일 경로(# 앞)와 앵커(# 뒤)로 나눠 각각 존재하는지 확인한다
    for (const reference of references) {
      const rawTarget = reference.target.trim();
      if (
        !rawTarget ||
        rawTarget.includes("____") ||
        rawTarget.includes("{{") ||
        rawTarget.startsWith("/") ||
        rawTarget.startsWith("//") ||
        /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)
      ) {
        continue;
      }

      const hashIndex = rawTarget.indexOf("#");
      const rawPath = (
        hashIndex === -1 ? rawTarget : rawTarget.slice(0, hashIndex)
      ).split("?")[0];
      const rawFragment =
        hashIndex === -1 ? "" : rawTarget.slice(hashIndex + 1);
      let decodedPath = rawPath;
      let decodedFragment = rawFragment;

      try {
        decodedPath = decodeURIComponent(rawPath);
        decodedFragment = decodeURIComponent(rawFragment);
      } catch {
        // 잘못 인코딩된 값은 아래 파일·앵커 검사에서 실패하도록 원문을 사용한다.
      }

      const targetPath = decodedPath
        ? path.resolve(path.dirname(filePath), decodedPath)
        : filePath;
      const relativeSource = path.relative(documentRoot, filePath);
      const line = content.slice(0, reference.index).split(/\r?\n/).length;

      if (!fs.existsSync(targetPath)) {
        errors.push(
          `${relativeSource}:${line}의 ${rawTarget} 링크 대상이 없습니다.`,
        );
        continue;
      }

      if (
        decodedFragment &&
        !documentAnchors(targetPath).has(decodedFragment)
      ) {
        errors.push(
          `${relativeSource}:${line}의 #${decodedFragment} 앵커가 대상 문서에 없습니다.`,
        );
      }
    }
  }

  return errors;
}

// 단계 성격에 따라 반드시 있어야 하는 문서가 다르다.
// 일반 단계는 문제·힌트·정답, 완성 프로젝트와 면접 단계는 전용 산출물을 검사한다.
function expectedTrackFiles(folder) {
  if (folder === "08-fullstack-portfolio-project") {
    return ["README.md", "learning-map.md", "submission-checklist.md"];
  }

  if (folder === "17-interview-prep") {
    return ["README.md", "interview-cards.md", "project-pitch-template.md"];
  }

  return ["README.md", "problems.md", "hints.md", "answers.md"];
}

// 01~17 폴더의 이름·순서·필수 문서가 학습 지도와 일치하는지 검사한다.
function findTrackErrors(workbookRoot) {
  const errors = [];
  // 이름이 "두 자리 숫자-..."인 실제 단계 폴더만 모은다.
  const stageDirectories = fs
    .readdirSync(workbookRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const stagesByNumber = new Map();

  // 같은 번호를 쓴 폴더(예: 01-html, 01-css)가 둘 이상인지 찾는다.
  for (const directory of stageDirectories) {
    const stage = directory.slice(0, 2);
    const duplicates = stagesByNumber.get(stage) || [];
    duplicates.push(directory);
    stagesByNumber.set(stage, duplicates);
  }

  for (const [stage, directories] of stagesByNumber) {
    if (directories.length > 1) {
      errors.push(`${stage}단계 폴더가 중복됩니다. ${directories.join(", ")}`);
    }
  }

  // 배열을 문자열로 비교하면 이름뿐 아니라 순서가 다른 경우도 한 번에 잡을 수 있다.
  if (stageDirectories.join("|") !== guideFolders.join("|")) {
    errors.push(
      "01~17단계 폴더 이름 또는 순서가 학습 지도와 일치하지 않습니다.",
    );
  }

  // 각 단계가 그 성격에 맞는 필수 문서를 모두 가지고 있는지 확인한다.
  for (const folder of guideFolders) {
    for (const file of expectedTrackFiles(folder)) {
      if (!fs.existsSync(path.join(workbookRoot, folder, file))) {
        errors.push(`${folder}/${file} 필수 산출물이 없습니다.`);
      }
    }
  }

  // HTML 목차와 체크리스트에도 01~17이 빠짐없이 한 번씩 나와야 한다.
  const indexPath = path.join(workbookRoot, "index.html");
  if (fs.existsSync(indexPath)) {
    const indexStages = [
      ...fs
        .readFileSync(indexPath, "utf8")
        .matchAll(/class="lesson-number">(\d{2})</g),
    ].map((match) => match[1]);
    const expectedStages = guideFolders.map((folder) => folder.slice(0, 2));
    if (indexStages.join("|") !== expectedStages.join("|")) {
      errors.push(
        "index.html의 단계 번호가 01~17 순서로 한 번씩 나타나지 않습니다.",
      );
    }
  }

  const checklistPath = path.join(workbookRoot, "student-checklist.md");
  if (fs.existsSync(checklistPath)) {
    const checklistStages = [
      ...fs
        .readFileSync(checklistPath, "utf8")
        .matchAll(/^## (\d+)단계(?:\s|$)/gm),
    ].map((match) => Number(match[1]));
    const expectedStages = Array.from({ length: 17 }, (_, index) => index + 1);
    if (checklistStages.join("|") !== expectedStages.join("|")) {
      errors.push(
        "student-checklist.md의 단계가 1~17 순서로 한 번씩 나타나지 않습니다.",
      );
    }
  }

  return errors;
}

// 학습자가 "설명 → 문제 → 힌트 → 정답 → 다음 단계"로 이동할 수 있는지 검사한다.
function findLearningPathErrors(workbookRoot) {
  const errors = [];
  // 파일이 아직 없을 때 예외 대신 빈 문자열을 돌려 여러 오류를 한 번에 보고한다.
  const read = (relativePath) => {
    const filePath = path.join(workbookRoot, relativePath);
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  };
  // 문서에 특정 상대 링크가 들어 있는지 반복해서 검사하는 작은 헬퍼다.
  const expectLink = (relativePath, target) => {
    if (!read(relativePath).includes(`(${target})`)) {
      errors.push(`${relativePath}에 ${target} 학습 동선 링크가 없습니다.`);
    }
  };

  // 첫 화면에서 시작 문서와 각 단계의 실행 안내로 이동할 수 있어야 한다.
  const index = read("index.html");
  if (!index.includes('class="button" href="./START-HERE.md"')) {
    errors.push("index.html의 첫 CTA가 START-HERE.md를 열지 않습니다.");
  }
  for (const folder of guideFolders) {
    const stage = folder.slice(0, 2);
    if (!index.includes(`href="#run-${stage}"`)) {
      errors.push(
        `index.html의 ${stage}단계 카드에 실행·검증 링크가 없습니다.`,
      );
    }
    if (!index.includes(`id="run-${stage}"`)) {
      errors.push(`index.html의 ${stage}단계 실행 지도 항목이 없습니다.`);
    }
  }
  if (
    !index.includes('id="run-notehub"') ||
    !index.includes('href="./monorepo-mini-app/README.md"')
  ) {
    errors.push("index.html에 Note Hub 실행·검증 지도가 없습니다.");
  }

  expectLink("START-HERE.md", "./01-html-css/README.md");
  expectLink("START-HERE.md", "./08-fullstack-portfolio-project/README.md");

  // 08과 17은 완성 프로젝트·면접 단계라 일반 문제/힌트/정답 규칙에서 제외한다.
  const standardFolders = guideFolders.filter(
    (folder) =>
      folder !== "08-fullstack-portfolio-project" &&
      folder !== "17-interview-prep",
  );

  // 일반 단계 문서 네 종류가 서로 연결되고, 정답에서 다음 단계로 이어지는지 확인한다.
  for (const folder of standardFolders) {
    expectLink(`${folder}/README.md`, "./problems.md");
    expectLink(`${folder}/README.md`, "./hints.md");
    expectLink(`${folder}/README.md`, "./answers.md");
    expectLink(`${folder}/README.md`, "../student-checklist.md");
    expectLink(`${folder}/problems.md`, "./README.md");
    expectLink(`${folder}/problems.md`, "./hints.md");
    expectLink(`${folder}/problems.md`, "./answers.md");
    expectLink(`${folder}/problems.md`, "../student-checklist.md");
    expectLink(`${folder}/answers.md`, "./problems.md");
    expectLink(`${folder}/answers.md`, "./hints.md");
    expectLink(`${folder}/answers.md`, "../student-checklist.md");
    expectLink(`${folder}/hints.md`, "./problems.md");
    expectLink(`${folder}/hints.md`, "./answers.md");
    expectLink(`${folder}/hints.md`, "../student-checklist.md");

    // 힌트는 정답을 바로 공개하지 않도록 세 단계로 나뉘어 있어야 한다.
    const hints = read(`${folder}/hints.md`);
    for (const level of ["1단계", "2단계", "3단계"]) {
      if (!hints.includes(level)) {
        errors.push(`${folder}/hints.md에 ${level} 힌트가 없습니다.`);
      }
    }

    const folderIndex = guideFolders.indexOf(folder);
    const nextFolder = guideFolders[folderIndex + 1];
    expectLink(`${folder}/answers.md`, `../${nextFolder}/README.md`);
  }

  // 실행에 별도 요청 파일이 필요한 API 단계는 README에서 그 파일을 안내해야 한다.
  for (const folder of [
    "04-node-board-api",
    "05-database-mongodb",
    "06-login-auth",
  ]) {
    expectLink(`${folder}/README.md`, "./requests.http");
  }
  expectLink("07-project-deploy/README.md", "./deploy-checklist.md");

  for (const target of [
    "./learning-map.md",
    "./submission-checklist.md",
    "./resume-assets.md",
    "../09-typescript/README.md",
  ]) {
    expectLink("08-fullstack-portfolio-project/README.md", target);
  }

  for (const target of [
    "./interview-cards.md",
    "./self-intro-templates.md",
    "./behavioral-questions.md",
    "./project-pitch-template.md",
    "../student-checklist.md",
  ]) {
    expectLink("17-interview-prep/README.md", target);
  }

  if (
    !read("10-sql-oracle/README.md").includes("starter/07-index.sql") ||
    !read("10-sql-oracle/README.md").includes("실행 계획")
  ) {
    errors.push("10단계 README에 인덱스 실행 계획 완료 기준이 없습니다.");
  }

  const checklist = read("student-checklist.md");
  if (!checklist.includes("Spring 프로젝트를 직접 만든 경우")) {
    errors.push("12단계 JUnit 완료 기준이 조건부로 표시되지 않았습니다.");
  }
  if (!checklist.includes("Node 앱 또는 Spring 앱")) {
    errors.push("14단계 Docker 완료 기준이 실제 수행 대상 기준이 아닙니다.");
  }

  return errors;
}

// problems.md의 "실습 파일 열기" 링크가 편집 허용 목록과 일치하는지 검사한다.
function findProblemWorkLinkErrors(
  workbookRoot,
  expectations = problemWorkExpectations,
) {
  const errors = [];

  for (const [folder, expectation] of Object.entries(expectations)) {
    const problemPath = path.join(workbookRoot, folder, "problems.md");
    if (!fs.existsSync(problemPath)) {
      errors.push(`${folder}/problems.md 문제 문서가 없습니다.`);
      continue;
    }

    const content = fs.readFileSync(problemPath, "utf8");
    // 링크 문자열이 문서에 있고, 링크가 가리키는 실제 파일도 존재해야 통과한다.
    for (const target of expectation.links) {
      if (!content.includes(`(${target})`)) {
        errors.push(
          `${folder}/problems.md에 ${target} 실제 실습 파일 링크가 없습니다.`,
        );
        continue;
      }

      const targetPath = target.split(/[?#]/)[0];
      const resolvedTarget = path.resolve(path.dirname(problemPath), targetPath);
      if (!fs.existsSync(resolvedTarget)) {
        errors.push(
          `${folder}/problems.md의 ${target} 실제 실습 파일이 없습니다.`,
        );
      }
    }

    // 코드 파일이 없는 서술형 단계는 대신 진행 방식 문구(marker)를 확인한다.
    if (expectation.marker && !content.includes(expectation.marker)) {
      errors.push(
        `${folder}/problems.md에 ${expectation.marker} 진행 방식 설명이 없습니다.`,
      );
    }
  }

  return errors;
}

// Note Hub의 배포 설정·문서·PostgreSQL 초기화 코드가 서로 맞는지 검사한다.
function findDeploymentContractErrors(workbookRoot) {
  const errors = [];
  const read = (relativePath) => {
    const filePath = path.join(workbookRoot, relativePath);
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  };
  const renderBlueprint = read("monorepo-mini-app/render.yaml");
  const noteHubReadme = read("monorepo-mini-app/README.md");
  const postgresStore = read(
    "monorepo-mini-app/packages/api/src/notes-store-pg.ts",
  );

  if (!renderBlueprint.includes("rootDir: monorepo-mini-app")) {
    errors.push(
      "Note Hub Render Blueprint가 monorepo-mini-app을 rootDir로 사용하지 않습니다.",
    );
  }

  if (!noteHubReadme.includes("`monorepo-mini-app/render.yaml`")) {
    errors.push(
      "Note Hub README에 하위 Render Blueprint Path 안내가 없습니다.",
    );
  }

  if (
    !postgresStore.includes("CREATE TABLE IF NOT EXISTS notes") ||
    !postgresStore.includes("await this.ensureSchema()")
  ) {
    errors.push(
      "Note Hub PostgreSQL 저장소가 첫 사용 전에 notes 스키마를 준비하지 않습니다.",
    );
  }

  return errors;
}

// Career Hub 접속 포트(웹 3000)가 설정·명령·문서 어디서나 같은지 검사한다.
function findPortContractErrors(workbookRoot) {
  const errors = [];
  const portfolioRoot = path.join(
    workbookRoot,
    "08-fullstack-portfolio-project",
  );
  const viteConfig = fs.readFileSync(
    path.join(portfolioRoot, "vite.config.js"),
    "utf8",
  );
  const portfolioPackage = JSON.parse(
    fs.readFileSync(path.join(portfolioRoot, "package.json"), "utf8"),
  );
  const portfolioReadme = fs.readFileSync(
    path.join(portfolioRoot, "README.md"),
    "utf8",
  );
  const practiceGuide = fs.readFileSync(
    path.join(workbookRoot, "folder-to-practice-guide.md"),
    "utf8",
  );
  const monorepoReadme = fs.readFileSync(
    path.join(workbookRoot, "monorepo-mini-app/README.md"),
    "utf8",
  );

  if ((viteConfig.match(/\bport:\s*3000\b/g) || []).length < 2) {
    errors.push(
      "Career Hub의 개발·preview 포트가 모두 3000으로 고정되어 있지 않습니다.",
    );
  }

  if (
    (viteConfig.match(/\bstrictPort:\s*true\b/g) || []).length < 2 ||
    /\bport:\s*3001\b/.test(viteConfig)
  ) {
    errors.push(
      "Career Hub가 3001로 이동하지 않도록 개발·preview strictPort가 설정되어야 합니다.",
    );
  }

  if (!portfolioPackage.scripts?.["dev:stop"]?.includes("3000")) {
    errors.push("Career Hub dev:stop이 3000번 포트를 정리하지 않습니다.");
  }

  if (
    !portfolioReadme.includes("http://localhost:3000") ||
    !portfolioReadme.includes("3001번으로 이동하지 않고")
  ) {
    errors.push(
      "Career Hub README에 3000 고정과 3001 미사용 계약이 설명되어 있지 않습니다.",
    );
  }

  if (
    !practiceGuide.includes("http://localhost:3000") ||
    practiceGuide.includes("http://localhost:5173")
  ) {
    errors.push(
      "folder-to-practice-guide.md의 Career Hub 접속 주소가 3000과 일치하지 않습니다.",
    );
  }

  if (!monorepoReadme.includes("API 5100 / Web 3000")) {
    errors.push(
      "Note Hub 비교표의 Career Hub 포트가 API 5100 / Web 3000과 일치하지 않습니다.",
    );
  }

  return errors;
}

// 모든 검사를 실행하는 진입점. 오류를 끝까지 모아 보여준 뒤 한 번에 성공/실패를 결정한다.
function main() {
  let hasError = false;

  // 오류를 발견해도 즉시 멈추지 않고 표시와 메시지를 함께 남긴다.
  function fail(message) {
    hasError = true;
    console.error(`검증 실패: ${message}`);
  }

  // 아래 검사들이 같은 방식으로 루트 기준 파일을 읽도록 만든 헬퍼다.
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  // 1) 필수 파일이 존재하고 비어 있지 않은지 확인한다.
  for (const relativePath of requiredPaths) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      fail(`${relativePath} 파일이 없습니다.`);
      continue;
    }

    if (readFile(relativePath).trim().length === 0) {
      fail(`${relativePath} 파일이 비어 있습니다.`);
    }
  }

  // 2) 직접 풀어야 하는 파일에는 학습용 빈칸 표시가 남아 있어야 한다.
  for (const relativePath of placeholderFiles) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      continue;
    }

    const content = readFile(relativePath);

    if (!/(빈칸|TODO|____)/.test(content)) {
      fail(`${relativePath} 파일에 학습용 빈칸 표시가 없습니다.`);
    }
  }

  // 3) 완성 프로그램 소스 첫 줄에는 초보자가 역할을 알 수 있는 한국어 주석이 있어야 한다.
  for (const relativePath of sourceFiles) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      continue;
    }

    const firstLine = readFile(relativePath).split(/\r?\n/)[0];

    if (!/[가-힣]/.test(firstLine)) {
      fail(`${relativePath} 첫 줄에 한국어 역할 주석이 없습니다.`);
    }
  }

  // 4) 문서에서 안내하는 npm 명령이 실제 package.json에도 정의돼 있는지 확인한다.
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

  // 5) 폴더 안내·체크리스트·HTML 목차에 17개 단계가 모두 연결됐는지 확인한다.
  if (fs.existsSync(path.join(root, "folder-to-practice-guide.md"))) {
    const folderGuide = readFile("folder-to-practice-guide.md");
    for (const folder of guideFolders) {
      if (!folderGuide.includes(folder)) {
        fail(`folder-to-practice-guide.md에 ${folder} 설명이 없습니다.`);
      }
    }
  }

  if (fs.existsSync(path.join(root, "student-checklist.md"))) {
    const studentChecklist = readFile("student-checklist.md");

    for (let stage = 1; stage <= 17; stage += 1) {
      if (!studentChecklist.includes(`## ${stage}단계`)) {
        fail(`student-checklist.md에 ${stage}단계 체크 항목이 없습니다.`);
      }
    }
  }

  if (fs.existsSync(path.join(root, "index.html"))) {
    const workbookIndex = readFile("index.html");

    for (const folder of guideFolders) {
      const expectedLinks = [
        "README.md",
        "problems.md",
        "hints.md",
        "answers.md",
      ];

      if (folder === "08-fullstack-portfolio-project") {
        expectedLinks.splice(
          1,
          3,
          "learning-map.md",
          "submission-checklist.md",
        );
      }

      if (folder === "17-interview-prep") {
        expectedLinks.splice(
          1,
          3,
          "interview-cards.md",
          "project-pitch-template.md",
        );
      }

      for (const file of expectedLinks) {
        const href = `./${folder}/${file}`;
        if (!workbookIndex.includes(`href="${href}"`)) {
          fail(`index.html에 ${href} 링크가 없습니다.`);
        }
      }
    }

    const relativeLinks = [
      ...workbookIndex.matchAll(/href="(\.\/[^"#]+)(?:#[^"]*)?"/g),
    ];
    for (const [, href] of relativeLinks) {
      if (!fs.existsSync(path.join(root, href))) {
        fail(`index.html의 ${href} 링크 대상이 없습니다.`);
      }
    }
  }

  // 6) 위의 기본 검사보다 복잡한 링크·학습 흐름·배포 계약 검사를 차례로 합친다.
  for (const error of findLocalLinkErrors(root)) {
    fail(error);
  }

  for (const error of findTrackErrors(root)) {
    fail(error);
  }

  for (const error of findLearningPathErrors(root)) {
    fail(error);
  }

  for (const error of findProblemWorkLinkErrors(root)) {
    fail(error);
  }

  for (const error of findDeploymentContractErrors(root)) {
    fail(error);
  }

  for (const error of findPortContractErrors(root)) {
    fail(error);
  }

  // 하나라도 실패했다면 종료 코드 1을 돌려 CI와 npm이 실패를 알아차리게 한다.
  if (hasError) {
    process.exit(1);
  }

  console.log("워크북 구조 검증이 통과했습니다.");
}

// `node scripts/verify-workbook.js`로 직접 실행할 때만 전체 검사를 시작한다.
if (require.main === module) {
  main();
}

// 테스트는 서버를 띄우지 않고 필요한 검사 함수만 가져다 쓴다.
module.exports = {
  findDeploymentContractErrors,
  findLearningPathErrors,
  findLocalLinkErrors,
  findPortContractErrors,
  findProblemWorkLinkErrors,
  findTrackErrors,
  markdownSlug,
};
