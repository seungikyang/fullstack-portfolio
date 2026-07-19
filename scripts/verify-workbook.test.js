// 워크북 구조 검증기의 링크·단계·포트 계약 판정을 임시 저장소로 검증하는 테스트
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  findLearningPathErrors,
  findLocalLinkErrors,
  findPortContractErrors,
  findTrackErrors,
} = require("./verify-workbook.js");

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

function write(root, relativePath, content = "# 테스트 문서\n") {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "workbook-verify-"));

  for (const folder of guideFolders) {
    const files =
      folder === "08-fullstack-portfolio-project"
        ? ["README.md", "learning-map.md", "submission-checklist.md"]
        : folder === "17-interview-prep"
          ? ["README.md", "interview-cards.md", "project-pitch-template.md"]
          : ["README.md", "problems.md", "answers.md"];

    for (const file of files) {
      write(root, path.join(folder, file));
    }
  }

  write(
    root,
    "index.html",
    guideFolders
      .map(
        (folder) => `<span class="lesson-number">${folder.slice(0, 2)}</span>`,
      )
      .join("\n"),
  );
  write(
    root,
    "student-checklist.md",
    guideFolders.map((_, index) => `## ${index + 1}단계`).join("\n"),
  );
  write(root, "guide.md", "# 시작하기\n\n## 중복\n\n## 중복\n");
  write(root, "page.html", '<section id="overview"></section>\n');
  write(
    root,
    "README.md",
    '[가이드](./guide.md#시작하기)\n[중복 제목](./guide.md#중복-1)\n<a href="./page.html#overview">개요</a>\n',
  );
  write(
    root,
    "08-fullstack-portfolio-project/vite.config.js",
    "// 테스트 설정\nexport default { server: { port: 3000, strictPort: true }, preview: { port: 3000, strictPort: true } };\n",
  );
  write(
    root,
    "08-fullstack-portfolio-project/package.json",
    JSON.stringify({
      scripts: { "dev:stop": "node scripts/free-port.js 3000" },
    }),
  );
  write(
    root,
    "08-fullstack-portfolio-project/README.md",
    "http://localhost:3000을 사용하며 3001번으로 이동하지 않고 중단합니다.\n",
  );
  write(
    root,
    "folder-to-practice-guide.md",
    "Career Hub는 http://localhost:3000에서 엽니다.\n",
  );
  write(
    root,
    "monorepo-mini-app/README.md",
    "Career Hub 포트는 API 5100 / Web 3000입니다.\n",
  );

  return root;
}

test("Markdown과 HTML의 로컬 파일·앵커를 검사한다", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(findLocalLinkErrors(root), []);

  fs.appendFileSync(
    path.join(root, "README.md"),
    "[없는 파일](./missing.md)\n[없는 앵커](./guide.md#없는-앵커)\n",
  );
  const errors = findLocalLinkErrors(root);

  assert.equal(
    errors.some((error) => error.includes("missing.md")),
    true,
  );
  assert.equal(
    errors.some((error) => error.includes("#없는-앵커")),
    true,
  );
});

test("01~17단계 순서·중복과 트랙별 필수 산출물을 검사한다", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(findTrackErrors(root), []);

  fs.mkdirSync(path.join(root, "01-duplicate"));
  fs.writeFileSync(
    path.join(root, "index.html"),
    '<span class="lesson-number">02</span>\n<span class="lesson-number">01</span>\n',
  );
  fs.rmSync(path.join(root, "17-interview-prep/project-pitch-template.md"));
  const errors = findTrackErrors(root);

  assert.equal(
    errors.some((error) => error.includes("01단계 폴더가 중복")),
    true,
  );
  assert.equal(
    errors.some((error) => error.includes("index.html의 단계 번호")),
    true,
  );
  assert.equal(
    errors.some((error) => error.includes("project-pitch-template.md")),
    true,
  );
});

test("시작부터 다음 단계까지 학습 동선과 조건부 완료 기준을 검사한다", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  write(
    root,
    "index.html",
    '<a class="button" href="./START-HERE.md">시작 워크시트 열기</a>\n',
  );
  write(
    root,
    "START-HERE.md",
    "[전체 경로](./01-html-css/README.md)\n[지원 직전](./08-fullstack-portfolio-project/README.md)\n",
  );

  const standardFolders = guideFolders.filter(
    (folder) =>
      folder !== "08-fullstack-portfolio-project" &&
      folder !== "17-interview-prep",
  );

  for (const folder of standardFolders) {
    const folderIndex = guideFolders.indexOf(folder);
    const nextFolder = guideFolders[folderIndex + 1];
    const extraReadmeLink = [
      "04-node-board-api",
      "05-database-mongodb",
      "06-login-auth",
    ].includes(folder)
      ? "[요청](./requests.http)"
      : folder === "07-project-deploy"
        ? "[배포](./deploy-checklist.md)"
        : "";
    const completion =
      folder === "10-sql-oracle" ? "starter/07-index.sql 실행 계획" : "";

    write(
      root,
      `${folder}/README.md`,
      `[문제](./problems.md) [정답](./answers.md) [체크](../student-checklist.md) ${extraReadmeLink} ${completion}\n`,
    );
    write(
      root,
      `${folder}/problems.md`,
      "[설명](./README.md) [정답](./answers.md) [체크](../student-checklist.md)\n",
    );
    write(
      root,
      `${folder}/answers.md`,
      `[문제](./problems.md) [체크](../student-checklist.md) [다음](../${nextFolder}/README.md)\n`,
    );
  }

  write(
    root,
    "08-fullstack-portfolio-project/README.md",
    "[학습](./learning-map.md) [제출](./submission-checklist.md) [근거](./resume-assets.md) [다음](../09-typescript/README.md)\n",
  );
  write(
    root,
    "17-interview-prep/README.md",
    "[카드](./interview-cards.md) [자기소개](./self-intro-templates.md) [STAR](./behavioral-questions.md) [설명](./project-pitch-template.md) [체크](../student-checklist.md)\n",
  );
  write(
    root,
    "student-checklist.md",
    `${guideFolders.map((_, index) => `## ${index + 1}단계`).join("\n")}\nSpring 프로젝트를 직접 만든 경우\nNode 앱 또는 Spring 앱\n`,
  );

  assert.deepEqual(findLearningPathErrors(root), []);

  write(
    root,
    "01-html-css/answers.md",
    "[문제](./problems.md) [체크](../student-checklist.md)\n",
  );
  const errors = findLearningPathErrors(root);
  assert.equal(
    errors.some((error) => error.includes("../02-javascript-basics/README.md")),
    true,
  );
});

test("Career Hub의 3000 고정과 3001 미사용 계약을 검사한다", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(findPortContractErrors(root), []);

  const configPath = path.join(
    root,
    "08-fullstack-portfolio-project/vite.config.js",
  );
  fs.writeFileSync(
    configPath,
    fs.readFileSync(configPath, "utf8").replaceAll("3000", "3001"),
  );
  const errors = findPortContractErrors(root);

  assert.equal(
    errors.some((error) => error.includes("3001")),
    true,
  );
});
