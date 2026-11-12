// 워크북 구조 검증기의 링크·단계·포트 계약 판정을 임시 저장소로 검증하는 테스트
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  editableProblemPaths,
  problemWorkTracks,
} = require("./problem-work-files.js");
const {
  findDeploymentContractErrors,
  findLearningPathErrors,
  findLocalLinkErrors,
  findPortContractErrors,
  findProblemWorkLinkErrors,
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

// 여러 검사에서 공유할 "모든 기본 계약이 맞는 작은 워크북" fixture를 임시 폴더에 만든다.
// 각 테스트는 먼저 오류가 0개임을 확인한 뒤 관심 계약만 깨뜨려 검출 결과를 비교한다.
function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "workbook-verify-"));

  for (const folder of guideFolders) {
    const files =
      folder === "08-fullstack-portfolio-project"
        ? ["README.md", "learning-map.md", "submission-checklist.md"]
        : folder === "17-interview-prep"
          ? ["README.md", "interview-cards.md", "project-pitch-template.md"]
          : ["README.md", "problems.md", "hints.md", "answers.md"];

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

test("웹 편집 허용 계약은 문제에 연결된 실습 파일 50개로 제한한다", () => {
  assert.equal(editableProblemPaths.size, 50);
  assert.equal(Object.keys(problemWorkTracks).length, 15);
  assert.equal(
    [...editableProblemPaths].some((file) =>
      /(?:answers|hints|README|scripts)\b/.test(file),
    ),
    false,
  );
});

test("Markdown과 HTML의 로컬 파일·앵커를 검사한다", (t) => {
  const root = createFixture();
  // 테스트가 성공하든 실패하든 임시 fixture를 지워 다음 테스트에 영향을 주지 않게 한다.
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(findLocalLinkErrors(root), []);

  // 정상 fixture에 없는 파일·앵커 링크만 추가해 두 종류의 계약 위반을 만든다.
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

  // 폴더 번호 중복, 목차 순서 변경, 필수 파일 삭제를 한 번에 만들어 각 오류가 수집되는지 본다.
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

  // 공통 fixture 위에 시작 CTA, 단계별 앵커, 문서 사이 이동 링크를 더해 완전한 정상 학습 동선을 만든다.
  write(
    root,
    "index.html",
    [
      '<a class="button" href="./START-HERE.md">시작 워크시트 열기</a>',
      ...guideFolders.flatMap((folder) => {
        const stage = folder.slice(0, 2);
        return [
          `<a href="#run-${stage}">실행·검증</a>`,
          `<article id="run-${stage}"></article>`,
        ];
      }),
      '<article id="run-notehub"><a href="./monorepo-mini-app/README.md">Note Hub 실행</a></article>',
    ].join("\n"),
  );
  write(root, "monorepo-mini-app/README.md", "# Note Hub\n");
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
      `[문제](./problems.md) [힌트](./hints.md) [정답](./answers.md) [체크](../student-checklist.md) ${extraReadmeLink} ${completion}\n`,
    );
    write(
      root,
      `${folder}/problems.md`,
      "[설명](./README.md) [힌트](./hints.md) [정답](./answers.md) [체크](../student-checklist.md)\n",
    );
    write(
      root,
      `${folder}/hints.md`,
      "[문제](./problems.md) [정답](./answers.md) [체크](../student-checklist.md)\n\n## 1단계\n\n## 2단계\n\n## 3단계\n",
    );
    write(
      root,
      `${folder}/answers.md`,
      `[문제](./problems.md) [힌트](./hints.md) [체크](../student-checklist.md) [다음](../${nextFolder}/README.md)\n`,
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

  // 정상 동선에서 다음 단계 링크 하나를 제거해 계약 파괴가 정확히 보고되는지 확인한다.
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

  // 이어서 실행 지도 링크도 제거해 HTML 목차 계약 역시 별도 오류로 잡히는지 확인한다.
  fs.writeFileSync(
    path.join(root, "index.html"),
    fs
      .readFileSync(path.join(root, "index.html"), "utf8")
      .replace('<a href="#run-09">실행·검증</a>', ""),
  );
  const programErrors = findLearningPathErrors(root);
  assert.equal(
    programErrors.some((error) =>
      error.includes("09단계 카드에 실행·검증 링크"),
    ),
    true,
  );
});

test("문제 문서에서 실제 실습 파일과 문서형 진행 방식을 검사한다", (t) => {
  // 이 검사는 전체 워크북이 필요 없으므로 코드형·선택형 단계 하나씩만 있는 최소 fixture를 쓴다.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "problem-work-links-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  write(
    root,
    "01-html-css/problems.md",
    "[HTML 코드](./starter/index.html?view=source)\n",
  );
  write(root, "01-html-css/starter/index.html", "<main>실습</main>\n");
  write(
    root,
    "15-cs-fundamentals/problems.md",
    "이 단계는 별도 starter 코드가 없는 4지선다 문제입니다.\n",
  );

  const expectations = {
    "01-html-css": {
      links: ["./starter/index.html?view=source"],
    },
    "15-cs-fundamentals": {
      links: [],
      marker: "4지선다 문제",
    },
  };

  assert.deepEqual(findProblemWorkLinkErrors(root, expectations), []);

  // 링크 대상과 선택형 표식을 각각 없애 두 진행 방식의 오류를 모두 검출하게 한다.
  fs.writeFileSync(
    path.join(root, "01-html-css/problems.md"),
    "[HTML 코드](./starter/missing.html?view=source)\n",
  );
  fs.writeFileSync(
    path.join(root, "15-cs-fundamentals/problems.md"),
    "진행 방식이 빠진 문제 문서입니다.\n",
  );
  const errors = findProblemWorkLinkErrors(root, expectations);

  assert.equal(
    errors.some((error) => error.includes("실제 실습 파일 링크")),
    true,
  );
  assert.equal(
    errors.some((error) => error.includes("4지선다 문제 진행 방식")),
    true,
  );
});

test("Career Hub의 3000 고정과 3001 미사용 계약을 검사한다", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(findPortContractErrors(root), []);

  // 정상 설정의 3000을 3001로 바꿔 포트 계약 위반을 의도적으로 만든다.
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

test("Note Hub의 Render 경로와 Postgres 스키마 준비 계약을 검사한다", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  write(
    root,
    "monorepo-mini-app/render.yaml",
    "services:\n  - type: web\n    rootDir: monorepo-mini-app\n",
  );
  write(
    root,
    "monorepo-mini-app/README.md",
    "Blueprint Path는 `monorepo-mini-app/render.yaml`입니다.\n",
  );
  write(
    root,
    "monorepo-mini-app/packages/api/src/notes-store-pg.ts",
    "const schema = `CREATE TABLE IF NOT EXISTS notes`;\nasync function ready() { await this.ensureSchema(); }\n",
  );

  assert.deepEqual(findDeploymentContractErrors(root), []);

  // 정상 배포 경로와 스키마 준비 코드를 비워 두 계약 위반이 함께 수집되는지 확인한다.
  fs.writeFileSync(path.join(root, "monorepo-mini-app/render.yaml"), "");
  fs.writeFileSync(
    path.join(root, "monorepo-mini-app/packages/api/src/notes-store-pg.ts"),
    "",
  );
  const errors = findDeploymentContractErrors(root);

  assert.equal(
    errors.some((error) => error.includes("rootDir")),
    true,
  );
  assert.equal(
    errors.some((error) => error.includes("notes 스키마")),
    true,
  );
});
