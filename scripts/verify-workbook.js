// 풀스택 학습 문제집의 필수 파일과 빈칸 실습 구성을 검증하는 스크립트
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

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
  "09-typescript/answers.md",
  "09-typescript/package.json",
  "09-typescript/tsconfig.json",
  "09-typescript/starter/01-basic-types.ts",
  "09-typescript/starter/02-interface-design.ts",
  "09-typescript/starter/03-react-todo.tsx",
  "09-typescript/starter/04-express-typed.ts",
  "09-typescript/starter/05-narrowing.ts",
  "09-typescript/starter/06-generic-fetch.ts",
  "10-sql-oracle/README.md",
  "10-sql-oracle/problems.md",
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
  "11-java-spring/answers.md",
  "11-java-spring/starter/README.md",
  "12-testing/README.md",
  "12-testing/problems.md",
  "12-testing/answers.md",
  "12-testing/starter/js/package.json",
  "12-testing/starter/js/src/calculator.ts",
  "12-testing/starter/js/src/calculator.test.ts",
  "12-testing/starter/js/src/app.ts",
  "12-testing/starter/js/src/app.test.ts",
  "12-testing/starter/js/src/notification.ts",
  "12-testing/starter/js/src/mailer.ts",
  "12-testing/starter/js/src/notification.test.ts",
  "13-git-collab/README.md",
  "13-git-collab/problems.md",
  "13-git-collab/answers.md",
  "14-docker-deploy/README.md",
  "14-docker-deploy/problems.md",
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
  "15-cs-fundamentals/answers.md",
  "16-security/README.md",
  "16-security/problems.md",
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
  "scripts/verify-workbook.js",
  "scripts/verify-workbook.test.js",
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
  "scripts/verify-workbook.js",
  "scripts/verify-workbook.test.js",
  "scripts/check-progress.js",
];

const packageScripts = {
  "package.json": [
    "test",
    "progress",
    "verify",
    "verify:structure",
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
  "12-testing/starter/js/package.json": ["test"],
};

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

function markdownSlug(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

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

function markdownTarget(rawTarget) {
  const target = rawTarget.trim();
  if (target.startsWith("<")) {
    const closingBracket = target.indexOf(">");
    return closingBracket === -1 ? target : target.slice(1, closingBracket);
  }

  return target.split(/\s+["']/)[0];
}

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

function expectedTrackFiles(folder) {
  if (folder === "08-fullstack-portfolio-project") {
    return ["README.md", "learning-map.md", "submission-checklist.md"];
  }

  if (folder === "17-interview-prep") {
    return ["README.md", "interview-cards.md", "project-pitch-template.md"];
  }

  return ["README.md", "problems.md", "answers.md"];
}

function findTrackErrors(workbookRoot) {
  const errors = [];
  const stageDirectories = fs
    .readdirSync(workbookRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const stagesByNumber = new Map();

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

  if (stageDirectories.join("|") !== guideFolders.join("|")) {
    errors.push(
      "01~17단계 폴더 이름 또는 순서가 학습 지도와 일치하지 않습니다.",
    );
  }

  for (const folder of guideFolders) {
    for (const file of expectedTrackFiles(folder)) {
      if (!fs.existsSync(path.join(workbookRoot, folder, file))) {
        errors.push(`${folder}/${file} 필수 산출물이 없습니다.`);
      }
    }
  }

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

function main() {
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
      const expectedLinks = ["README.md", "problems.md", "answers.md"];

      if (folder === "08-fullstack-portfolio-project") {
        expectedLinks.splice(
          1,
          2,
          "learning-map.md",
          "submission-checklist.md",
        );
      }

      if (folder === "17-interview-prep") {
        expectedLinks.splice(
          1,
          2,
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

  for (const error of findLocalLinkErrors(root)) {
    fail(error);
  }

  for (const error of findTrackErrors(root)) {
    fail(error);
  }

  for (const error of findPortContractErrors(root)) {
    fail(error);
  }

  if (hasError) {
    process.exit(1);
  }

  console.log("워크북 구조 검증이 통과했습니다.");
}

if (require.main === module) {
  main();
}

module.exports = {
  findLocalLinkErrors,
  findPortContractErrors,
  findTrackErrors,
  markdownSlug,
};
