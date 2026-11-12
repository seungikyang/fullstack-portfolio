// 폴더명 기반 문제집 URI와 저장소 경계 보호를 검증하는 서버 테스트
const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const {
  editableProblemPaths,
  problemWorkTracks,
} = require("./problem-work-files.js");
const {
  createWorkbookServer,
  HOST,
  renderMarkdownDocument,
  saveProblemSource,
  sourceVersion,
  WORKBOOK_PATH,
} = require("./serve-workbook.js");

test("Markdown을 링크 가능한 HTML로 렌더링하고 위험한 내용을 제거한다", async () => {
  // 정상 제목·중복 제목·상대 링크와 공격 입력을 한 문서에 넣어 변환과 정화를 함께 검증한다.
  const html = await renderMarkdownDocument(
    [
      "# 시작하기",
      "",
      "## 반복 제목",
      "",
      "## 반복 제목",
      "",
      "[목차](./index.html)",
      "",
      "<script>alert('실행되면 안 됩니다.')</script>",
      "[위험한 링크](javascript:alert('실행되면 안 됩니다.'))",
    ].join("\n"),
    "START-HERE.md",
  );

  assert.match(html, /<h1 id="시작하기">시작하기<\/h1>/);
  assert.match(html, /<h2 id="반복-제목">반복 제목<\/h2>/);
  assert.match(html, /<h2 id="반복-제목-1">반복 제목<\/h2>/);
  assert.match(html, /href="\.\/index\.html"/);
  assert.doesNotMatch(html, /<script/);
  assert.doesNotMatch(html, /href="javascript:/);
});

test("문서의 모든 선택형 구간은 원래 ID의 선택·채점·해설 카드로 렌더링된다", async () => {
  const bank = require("../quiz/written-questions.json");
  const seen = new Set();
  for (const file of new Set(bank.questions.map((q) => q.reference))) {
    const markdown = await fs.readFile(
      path.join(__dirname, "..", file),
      "utf8",
    );
    const html = await renderMarkdownDocument(markdown, path.basename(file));
    const ids = [...html.matchAll(/data-question-id="(W\d{3})"/g)].map(
      (match) => match[1],
    );
    assert.equal(
      ids.length,
      (markdown.match(/<summary>정답·해설 확인<\/summary>/g) || []).length,
      file,
    );
    assert.equal(
      (html.match(/type="radio"/g) || []).length,
      ids.length * 4,
      file,
    );
    assert.equal(
      (html.match(/data-quiz-feedback role="status" hidden/g) || []).length,
      ids.length,
      file,
    );
    assert.doesNotMatch(html, /WORKBOOKQUIZ[a-f0-9]+X\d+END/, file);
    ids.forEach((id) => seen.add(id));
    // 재사용한 보기라도 기존 문항별 채점 링크와 같은 ID로 저장해야 합니다.
    for (const match of markdown.matchAll(/question=(W\d{3})\)/g)) {
      if (bank.questions.find((q) => q.id === match[1])?.reference === file) {
        assert.ok(ids.includes(match[1]), `${file}: ${match[1]}`);
      }
    }
  }
  assert.deepEqual([...seen].sort(), bank.questions.map((q) => q.id).sort());
});

test("일반 목록과 변조된 문항은 폼으로 바꾸지 않고 문서의 임의 스크립트를 제거한다", async () => {
  const q = require("../quiz/written-questions.json").questions[0];
  const markdown = `${q.question}\n\n${q.choices.map((choice, n) => `${n + 1}. ${choice}`).join("\n")}\n\n<details>\n<summary>정답·해설 확인</summary>\n\n**정답: 4번**\n\n임의로 바꾼 해설입니다.\n\n</details>\n\n<script>alert('unsafe')</script>\n<form action="https://example.com"><input type="radio" name="fake"></form>`;
  const html = await renderMarkdownDocument(markdown, "문제.md");
  assert.doesNotMatch(html, /data-document-quiz|<script|<form/);
  assert.match(html, /<ol>/);
});

test("객관식 문서의 자산과 CSP는 로컬 선택·채점만 허용한다", async (t) => {
  const server = createWorkbookServer();
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());
  const origin = `http://${HOST}:${server.address().port}`;
  const response = await fetch(
    `${origin}${WORKBOOK_PATH}15-cs-fundamentals/problems.md`,
  );
  assert.equal(response.status, 200);
  const csp = response.headers.get("content-security-policy");
  assert.match(csp, /script-src 'self'; connect-src 'self'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /form-action 'none'/);
  const html = await response.text();
  for (const asset of ["document-quiz.js", "document-quiz.css", "core.js"]) {
    assert.ok(html.includes(`${WORKBOOK_PATH}quiz/${asset}`));
    const assetResponse = await fetch(`${origin}${WORKBOOK_PATH}quiz/${asset}`);
    assert.equal(assetResponse.status, 200);
  }
});

test("고정 URI에서 문제집을 제공하고 저장소 밖 접근을 차단한다", async (t) => {
  const server = createWorkbookServer();
  // 포트 0은 운영체제에 비어 있는 포트를 골라 달라는 뜻이라 다른 개발 서버와 충돌하지 않는다.
  server.listen(0, HOST);
  await once(server, "listening");
  // t.after에 정리를 등록하면 중간 assert가 실패해도 테스트 서버가 남지 않는다.
  t.after(() => server.close());

  const port = server.address().port;
  const origin = `http://${HOST}:${port}`;

  const rootResponse = await fetch(`${origin}/`, { redirect: "manual" });
  assert.equal(rootResponse.status, 302);
  assert.equal(rootResponse.headers.get("location"), `${WORKBOOK_PATH}quiz/`);

  const workbookResponse = await fetch(`${origin}${WORKBOOK_PATH}`);
  assert.equal(workbookResponse.status, 200);
  assert.match(
    await workbookResponse.text(),
    /<title>웹 문제집 \| 풀스택 취업 워크북<\/title>/,
  );

  const curriculumResponse = await fetch(`${origin}${WORKBOOK_PATH}index.html`);
  assert.equal(curriculumResponse.status, 200);
  assert.match(
    await curriculumResponse.text(),
    /<title>풀스택 취업 워크북 \| 처음부터 취업까지<\/title>/,
  );

  const historyResponse = await fetch(`${origin}${WORKBOOK_PATH}history.html`);
  assert.equal(historyResponse.status, 200);

  const worksheetResponse = await fetch(
    `${origin}${WORKBOOK_PATH}START-HERE.md`,
  );
  assert.equal(worksheetResponse.status, 200);
  assert.match(
    worksheetResponse.headers.get("content-type"),
    /^text\/html; charset=utf-8$/,
  );
  assert.match(
    await worksheetResponse.text(),
    /<h1 id="취업-워크북-시작하기">취업 워크북 시작하기<\/h1>/,
  );

  const sourceResponse = await fetch(
    `${origin}${WORKBOOK_PATH}01-html-css/starter/index.html?view=source`,
  );
  assert.equal(sourceResponse.status, 200);
  assert.match(
    sourceResponse.headers.get("content-type"),
    /^text\/html; charset=utf-8$/,
  );
  assert.match(
    sourceResponse.headers.get("content-security-policy"),
    /script-src 'self'; connect-src 'self'/,
  );
  const sourceDocument = await sourceResponse.text();
  assert.match(sourceDocument, /data-source-editor/);
  assert.match(sourceDocument, /파일 저장/);
  assert.match(sourceDocument, /1~3단계 힌트 확인/);
  assert.match(sourceDocument, /정답 비교 열기/);
  assert.match(sourceDocument, /id="hint-1단계-단계별-힌트"/);
  assert.match(sourceDocument, /id="answer-1단계-정답-확인"/);
  assert.match(sourceDocument, /&lt;html lang=&quot;ko&quot;&gt;/);
  assert.equal(sourceDocument.match(/<html lang="ko">/g)?.length, 1);

  const problemResponse = await fetch(
    `${origin}${WORKBOOK_PATH}02-javascript-basics/problems.md`,
  );
  assert.equal(problemResponse.status, 200);
  const problemDocument = await problemResponse.text();
  assert.match(problemDocument, /<body class="problem-document">/);
  assert.match(problemDocument, /<link rel="icon" href="data:," \/>/);
  assert.match(problemDocument, /class="problem-workspace"/);
  assert.equal(
    problemDocument.includes(
      `href="${WORKBOOK_PATH}02-javascript-basics/starter/app.js?view=source"`,
    ),
    true,
  );
  assert.match(problemDocument, /<summary>1~3단계 힌트 확인<\/summary>/);
  assert.match(problemDocument, /<summary>정답 비교 열기<\/summary>/);
  assert.match(problemDocument, /id="problem-hint-2단계-단계별-힌트"/);
  assert.match(problemDocument, /id="problem-answer-2단계-정답-확인"/);
  assert.doesNotMatch(problemDocument, /<details open/);

  const outsideResponse = await fetch(`${origin}/history.html`);
  assert.equal(outsideResponse.status, 404);

  const traversalResponse = await fetch(
    `${origin}${WORKBOOK_PATH}%2e%2e%2Fpackage.json`,
  );
  assert.equal(traversalResponse.status, 403);
});

test("첫 주소는 웹 문제집을 열고 문제집·과목 쿼리와 기존 목차 링크를 유지한다", async (t) => {
  const server = createWorkbookServer();
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());
  const origin = `http://${HOST}:${server.address().port}`;
  const query = "?bank=written&category=cs";

  for (const entry of ["/", WORKBOOK_PATH.slice(0, -1), WORKBOOK_PATH]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await fetch(`${origin}${entry}${query}`, {
        method,
        redirect: "manual",
      });
      assert.equal(response.status, 302, `${method} ${entry}`);
      assert.equal(
        response.headers.get("location"),
        `${WORKBOOK_PATH}quiz/${query}`,
      );
      if (method === "HEAD") assert.equal(await response.text(), "");
    }
  }
  const quiz = await fetch(`${origin}/${query}`);
  assert.equal(quiz.status, 200);
  assert.equal(quiz.url, `${origin}${WORKBOOK_PATH}quiz/${query}`);
  const html = await quiz.text();
  assert.match(html, /href="\.\.\/index\.html#curriculum"/);
  assert.match(html, /id="subjects"/);
});

test("비공개 파일·실제 대상과 외부 Host는 차단하고 학습용 숨김 파일은 제공한다", async (t) => {
  const workbookRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "workbook-private-"),
  );
  t.after(() => fs.rm(workbookRoot, { recursive: true, force: true }));
  const privatePaths = [
    ".git/HEAD",
    ".env",
    "app/.env.production",
    ".npmrc",
    "node_modules/private.json",
    "_workspace/report.md",
    "08-fullstack-portfolio-project/data/career-hub.json",
  ];
  const publicPaths = [
    "index.html",
    "app/.env.example",
    "starter/.github/workflows/ci.yml",
  ];
  for (const file of [...privatePaths, ...publicPaths]) {
    await fs.mkdir(path.dirname(path.join(workbookRoot, file)), {
      recursive: true,
    });
    await fs.writeFile(path.join(workbookRoot, file), "fixture");
  }
  await fs.symlink(
    path.join(workbookRoot, ".env"),
    path.join(workbookRoot, "alias.txt"),
  );
  const server = createWorkbookServer({
    workbookRoot,
    workbookSlug: "fixture",
  });
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());
  const origin = `http://${HOST}:${server.address().port}`;

  for (const file of [...privatePaths, "alias.txt", "%2egit/HEAD"]) {
    for (const method of ["GET", "HEAD", "PUT"]) {
      const response = await fetch(`${origin}/fixture/${file}`, { method });
      assert.equal(response.status, 403, `${method} ${file}`);
      assert.doesNotMatch(await response.text(), /fixture/);
    }
  }
  for (const file of publicPaths) {
    const response = await fetch(`${origin}/fixture/${file}`);
    assert.equal(response.status, 200, file);
  }
  const reboundStatus = await new Promise((resolve, reject) => {
    const request = http.get(
      `${origin}/fixture/index.html`,
      {
        headers: { Host: "attacker.example" },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      },
    );
    request.on("error", reject);
  });
  assert.equal(reboundStatus, 403);
});

test("디렉터리 GET·HEAD는 쿼리를 유지한 슬래시 주소로 이동해 상대 자산을 연결한다", async (t) => {
  const workbookRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "workbook-directory-"),
  );
  t.after(() => fs.rm(workbookRoot, { recursive: true, force: true }));
  await fs.mkdir(path.join(workbookRoot, "quiz"));
  await fs.writeFile(
    path.join(workbookRoot, "quiz/index.html"),
    '<h1>문제</h1><script src="./app.js"></script>\n',
  );
  await fs.writeFile(
    path.join(workbookRoot, "quiz/app.js"),
    'console.log("fixture quiz");\n',
  );
  const server = createWorkbookServer({
    workbookRoot,
    workbookSlug: "fixture",
  });
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());
  const origin = `http://${HOST}:${server.address().port}`;
  const directoryUrl = `${origin}/fixture/quiz?bank=written`;

  for (const method of ["GET", "HEAD"]) {
    const response = await fetch(directoryUrl, { method, redirect: "manual" });
    assert.ok([301, 302, 307, 308].includes(response.status), method);
    assert.equal(
      response.headers.get("location"),
      "/fixture/quiz/?bank=written",
      method,
    );
    if (method === "HEAD") assert.equal(await response.text(), "");
  }

  const page = await fetch(directoryUrl);
  assert.equal(page.status, 200);
  assert.equal(page.url, `${origin}/fixture/quiz/?bank=written`);
  const scriptPath = (await page.text()).match(/<script src="([^"]+)"/)[1];
  const scriptUrl = new URL(scriptPath, page.url);
  assert.equal(scriptUrl.pathname, "/fixture/quiz/app.js");
  const script = await fetch(scriptUrl);
  assert.equal(script.status, 200);
  assert.equal(await script.text(), 'console.log("fixture quiz");\n');
});

test("15개 표준 문제 페이지는 실제 코드와 접힌 힌트·정답을 한 화면에 제공한다", async (t) => {
  const server = createWorkbookServer();
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());

  const port = server.address().port;
  const origin = `http://${HOST}:${port}`;
  const results = await Promise.all(
    Object.entries(problemWorkTracks).map(async ([folder, track]) => {
      const response = await fetch(
        `${origin}${WORKBOOK_PATH}${folder}/problems.md`,
      );
      return {
        document: await response.text(),
        folder,
        response,
        track,
      };
    }),
  );

  assert.equal(results.length, 15);
  for (const { document, folder, response, track } of results) {
    assert.equal(response.status, 200, folder);
    assert.match(document, /<body class="problem-document">/, folder);
    assert.match(document, /class="problem-workspace"/, folder);
    assert.match(document, /aria-labelledby="problem-help-title"/, folder);
    assert.match(document, /<details>\s*<summary>1~3단계 힌트 확인/, folder);
    assert.match(document, /<details>\s*<summary>정답 비교 열기/, folder);
    assert.match(document, /id="problem-hint-/, folder);
    assert.match(document, /id="problem-answer-/, folder);
    assert.doesNotMatch(document, /<details open/, folder);

    for (const file of track.files) {
      assert.equal(
        document.includes(
          `href="${WORKBOOK_PATH}${folder}/${file}?view=source"`,
        ),
        true,
        `${folder}/${file}`,
      );
    }
  }
});

test("허용된 실습 파일만 저장하고 외부 변경과 경로 이탈을 막는다", async (t) => {
  // 실제 저장소 대신 테스트 전용 문제집과 저장소 밖 폴더를 만들어 파일 저장을 안전하게 검증한다.
  const workbookRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "workbook-editor-"),
  );
  const outsideRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "workbook-outside-"),
  );
  t.after(async () => {
    await fs.rm(workbookRoot, { recursive: true, force: true });
    await fs.rm(outsideRoot, { recursive: true, force: true });
  });

  const write = async (relativePath, content) => {
    const filePath = path.join(workbookRoot, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
  };
  await write("index.html", "<h1>테스트 문제집</h1>\n");
  await write("README.md", "# 편집 금지\n");
  await write("01-html-css/starter/index.html", '<main id="app">____</main>\n');
  await write(
    "01-html-css/hints.md",
    "# 1단계 힌트\n\n[문제](./problems.md)\n\n## 1단계\n\n태그를 확인하세요.\n",
  );
  await write(
    "01-html-css/answers.md",
    '# 1단계 정답 예시\n\n<main id="app">완성</main>\n',
  );
  await write("scripts/workbook-editor.js", "// 테스트 편집기\n");

  const outsideFile = path.join(outsideRoot, "styles.css");
  await fs.writeFile(outsideFile, "body { color: red; }\n");
  // 겉보기에는 문제집 안이지만 실제 대상은 밖인 심볼릭 링크로 경로 우회 공격을 재현한다.
  await fs.symlink(
    outsideFile,
    path.join(workbookRoot, "01-html-css/starter/styles.css"),
  );

  const editToken = "fixture-edit-token";
  // 편집 목록·토큰·루트를 주입해 작은 독립 서버를 만들고 운영 파일에는 접근하지 않는다.
  const server = createWorkbookServer({
    editablePaths: new Set([
      "01-html-css/starter/index.html",
      "01-html-css/starter/styles.css",
    ]),
    editToken,
    workbookRoot,
    workbookSlug: "fixture",
  });
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());

  const port = server.address().port;
  const origin = `http://${HOST}:${port}`;
  const sourceUrl = `${origin}/fixture/01-html-css/starter/index.html?view=source`;
  const sourceResponse = await fetch(sourceUrl);
  assert.equal(sourceResponse.status, 200);
  const sourceDocument = await sourceResponse.text();
  const version = sourceDocument.match(
    /data-source-version="([a-f0-9]{64})"/,
  )?.[1];
  assert.equal(typeof version, "string");
  assert.match(sourceDocument, /href="\/fixture\/01-html-css\/problems.md"/);
  assert.match(sourceDocument, /태그를 확인하세요/);
  assert.match(sourceDocument, /완성/);

  const requestBody = JSON.stringify({
    content: '<main id="app">수정 완료</main>\n',
    version,
  });
  // 먼저 출처와 토큰 계약을 일부러 깨뜨려 저장 전에 차단되는지 확인한다.
  const blockedOriginResponse = await fetch(sourceUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://attacker.example",
      "X-Workbook-Edit-Token": editToken,
    },
    body: requestBody,
  });
  assert.equal(blockedOriginResponse.status, 403);

  const blockedTokenResponse = await fetch(sourceUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "X-Workbook-Edit-Token": "wrong-token",
    },
    body: requestBody,
  });
  assert.equal(blockedTokenResponse.status, 403);

  // 같은 fixture와 올바른 계약으로 다시 요청하면 실제 임시 파일 내용이 바뀌어야 한다.
  const saveResponse = await fetch(sourceUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "X-Workbook-Edit-Token": editToken,
    },
    body: requestBody,
  });
  assert.equal(saveResponse.status, 200);
  const saveResult = await saveResponse.json();
  assert.equal(saveResult.saved, true);
  assert.match(saveResult.version, /^[a-f0-9]{64}$/);
  assert.equal(
    await fs.readFile(
      path.join(workbookRoot, "01-html-css/starter/index.html"),
      "utf8",
    ),
    '<main id="app">수정 완료</main>\n',
  );

  // 이미 사용한 버전을 다시 보내 충돌 검사가 오래된 편집 내용을 찾아내는지 확인한다.
  const staleResponse = await fetch(sourceUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "X-Workbook-Edit-Token": editToken,
    },
    body: requestBody,
  });
  assert.equal(staleResponse.status, 409);

  const disallowedResponse = await fetch(
    `${origin}/fixture/README.md?view=source`,
  );
  assert.equal(disallowedResponse.status, 403);

  const symlinkResponse = await fetch(
    `${origin}/fixture/01-html-css/starter/styles.css?view=source`,
  );
  assert.equal(symlinkResponse.status, 403);
  assert.equal(
    (await fs.readdir(path.join(workbookRoot, "01-html-css/starter"))).some(
      (file) => file.includes(".workbook-") && file.endsWith(".tmp"),
    ),
    false,
  );
});

test(
  "같은 실제 파일의 동시 저장은 한 요청만 반영하고 충돌 후 다시 저장할 수 있다",
  { timeout: 10000 },
  async (t) => {
    const workbookRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "workbook-concurrent-save-"),
    );
    t.after(() => fs.rm(workbookRoot, { recursive: true, force: true }));
    const relativePath = "source.js";
    const aliasPath = "alias.js";
    const filePath = path.join(workbookRoot, relativePath);
    const original = "const value = 0;\n";
    await fs.writeFile(filePath, original);
    await fs.symlink(filePath, path.join(workbookRoot, aliasPath));
    const editablePaths = new Set([relativePath, aliasPath]);
    const requests = Array.from({ length: 8 }, (_, index) => ({
      content: `const value = ${index + 1};\n`,
      editablePaths,
      expectedVersion: sourceVersion(original),
      filePath: path.join(workbookRoot, index % 2 ? aliasPath : relativePath),
      relativePath: index % 2 ? aliasPath : relativePath,
      workbookRoot,
    }));

    const results = await Promise.all(requests.map(saveProblemSource));
    assert.equal(
      results.filter((result) => result.statusCode === 200).length,
      1,
    );
    assert.equal(
      results.filter((result) => result.statusCode === 409).length,
      7,
    );
    const winnerIndex = results.findIndex(
      (result) => result.statusCode === 200,
    );
    const savedSource = await fs.readFile(filePath, "utf8");
    assert.equal(savedSource, requests[winnerIndex].content);
    assert.equal(results[winnerIndex].version, sourceVersion(savedSource));

    // 충돌 응답을 반환한 작업도 잠금을 놓아야 새 버전으로 이어서 저장할 수 있다.
    const retryContent = "const value = 9;\n";
    const retry = await saveProblemSource({
      ...requests[0],
      content: retryContent,
      expectedVersion: sourceVersion(savedSource),
    });
    assert.equal(retry.statusCode, 200);
    assert.equal(await fs.readFile(filePath, "utf8"), retryContent);
  },
);

test(
  "저장 I/O 실패는 원본을 보존하고 임시 파일과 잠금을 정리해 재시도를 허용한다",
  { timeout: 10000 },
  async (t) => {
    const workbookRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "workbook-failed-save-"),
    );
    t.after(() => fs.rm(workbookRoot, { recursive: true, force: true }));
    const relativePath = "source.js";
    const filePath = path.join(workbookRoot, relativePath);
    const original = "const value = 0;\n";
    await fs.writeFile(filePath, original);
    const request = {
      content: "const value = 1;\n",
      editablePaths: new Set([relativePath]),
      expectedVersion: sourceVersion(original),
      filePath,
      relativePath,
      workbookRoot,
    };
    // fixture의 실제 파일 교체만 한 번 실패시켜 원자적 저장의 오류 경로를 재현한다.
    const realFilePath = await fs.realpath(filePath);
    const rename = fs.rename;
    const injectedFailure = Object.assign(new Error("fixture rename failure"), {
      code: "EACCES",
    });
    const renameMock = t.mock.method(fs, "rename", async (from, to) => {
      if (to === realFilePath) throw injectedFailure;
      return rename(from, to);
    });
    try {
      await assert.rejects(
        saveProblemSource(request),
        (error) => error === injectedFailure,
      );
    } finally {
      renameMock.mock.restore();
    }
    assert.equal(await fs.readFile(filePath, "utf8"), original);
    assert.deepEqual(await fs.readdir(workbookRoot), [relativePath]);

    const retry = await saveProblemSource(request);
    assert.equal(retry.statusCode, 200);
    assert.equal(await fs.readFile(filePath, "utf8"), request.content);
  },
);

test("객체가 아닌 JSON 저장 본문은 400 JSON 응답으로 거절하고 파일을 보존한다", async (t) => {
  const workbookRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "workbook-invalid-body-"),
  );
  t.after(() => fs.rm(workbookRoot, { recursive: true, force: true }));
  const relativePath = "source.js";
  const filePath = path.join(workbookRoot, relativePath);
  const original = "const value = 0;\n";
  await fs.writeFile(filePath, original);
  const editToken = "fixture-edit-token";
  const server = createWorkbookServer({
    editablePaths: new Set([relativePath]),
    editToken,
    workbookRoot,
    workbookSlug: "fixture",
  });
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());
  const origin = `http://${HOST}:${server.address().port}`;
  const sourceUrl = `${origin}/fixture/${relativePath}?view=source`;

  for (const body of ["null", "[]", '"invalid"', "42", "true"]) {
    const response = await fetch(sourceUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        "X-Workbook-Edit-Token": editToken,
      },
      body,
    });
    assert.equal(response.status, 400, body);
    assert.match(
      response.headers.get("content-type"),
      /^application\/json\b/,
      body,
    );
    const result = await response.json();
    assert.equal(typeof result.message, "string", body);
    assert.notEqual(result.saved, true, body);
    assert.equal(await fs.readFile(filePath, "utf8"), original, body);
  }
});

test("실제 편집 허용 파일 50개는 편집기와 접힌 도움말을 모두 제공한다", async (t) => {
  const server = createWorkbookServer();
  server.listen(0, HOST);
  await once(server, "listening");
  t.after(() => server.close());

  const port = server.address().port;
  const origin = `http://${HOST}:${port}`;
  // 모든 허용 파일을 병렬로 열어 목록에만 있고 실제 편집 화면은 깨진 파일이 없는지 계약 전체를 확인한다.
  const results = await Promise.all(
    [...editableProblemPaths].map(async (relativePath) => {
      const response = await fetch(
        `${origin}${WORKBOOK_PATH}${relativePath}?view=source`,
      );
      return {
        document: await response.text(),
        relativePath,
        response,
      };
    }),
  );

  assert.equal(results.length, 50);
  for (const { document, relativePath, response } of results) {
    const source = await fs.readFile(
      path.join(__dirname, "..", relativePath),
      "utf8",
    );
    assert.equal(response.status, 200, relativePath);
    assert.match(
      response.headers.get("content-type"),
      /^text\/html; charset=utf-8$/,
      relativePath,
    );
    assert.match(document, /data-source-workspace/, relativePath);
    assert.match(document, /data-source-editor/, relativePath);
    assert.match(document, /data-save-source/, relativePath);
    assert.match(document, /data-reload-source/, relativePath);
    assert.match(
      document,
      /<details>\s*<summary>1~3단계 힌트 확인/,
      relativePath,
    );
    assert.match(document, /<details>\s*<summary>정답 비교 열기/, relativePath);
    assert.match(
      document,
      new RegExp(`data-source-version="${sourceVersion(source)}"`),
      relativePath,
    );
  }
});

test("저장 중 추가 입력은 저장 완료로 오인하거나 중복 전송하지 않는다", async () => {
  // 브라우저 없이 편집기 상태만 시험하도록 필요한 DOM 요소를 작은 가짜 객체로 만든다.
  const editor = createFakeElement({ value: "처음 내용" });
  const saveButton = createFakeElement({ disabled: false });
  const reloadButton = createFakeElement();
  const status = createFakeElement({ dataset: {}, textContent: "" });
  const workspace = {
    dataset: {
      editToken: "test-token",
      sourceVersion: "version-1",
    },
    querySelector(selector) {
      return {
        "[data-reload-source]": reloadButton,
        "[data-save-source]": saveButton,
        "[data-save-status]": status,
        "[data-source-editor]": editor,
      }[selector];
    },
  };
  const documentListeners = new Map();
  const windowListeners = new Map();
  const pendingRequests = [];
  const editorScript = await fs.readFile(
    path.join(__dirname, "workbook-editor.js"),
    "utf8",
  );

  // 별도 VM에 가짜 document/window/fetch를 주입하면 실제 네트워크 요청 없이 요청 시점과 본문을 통제할 수 있다.
  vm.runInNewContext(editorScript, {
    Date,
    Error,
    JSON,
    document: {
      addEventListener(type, listener) {
        documentListeners.set(type, listener);
      },
      querySelector() {
        return workspace;
      },
    },
    fetch(url, options) {
      return new Promise((resolve) => {
        pendingRequests.push({ options, resolve, url });
      });
    },
    location: { href: "http://127.0.0.1:4187/fullstack/file?view=source" },
    window: {
      addEventListener(type, listener) {
        windowListeners.set(type, listener);
      },
      confirm() {
        return true;
      },
    },
  });

  assert.equal(saveButton.disabled, true);
  editor.value = "첫 번째 저장 내용";
  editor.listeners.get("input")();
  assert.equal(saveButton.disabled, false);

  const firstSave = saveButton.listeners.get("click")();
  assert.equal(saveButton.disabled, true);
  assert.equal(status.dataset.state, "saving");

  editor.value = "저장 중 추가한 내용";
  editor.listeners.get("input")();
  assert.equal(saveButton.disabled, true);
  assert.equal(status.dataset.state, "saving");
  assert.equal(pendingRequests.length, 1);
  assert.equal(
    JSON.parse(pendingRequests[0].options.body).content,
    "첫 번째 저장 내용",
  );

  // 보류해 둔 첫 fetch를 여기서 완료시켜 저장 도중 입력한 값이 여전히 dirty로 남는지 확인한다.
  pendingRequests[0].resolve({
    json: async () => ({ version: "version-2" }),
    ok: true,
  });
  await firstSave;
  assert.equal(saveButton.disabled, false);
  assert.equal(status.dataset.state, "dirty");

  const secondSave = saveButton.listeners.get("click")();
  assert.equal(pendingRequests.length, 2);
  assert.equal(
    JSON.parse(pendingRequests[1].options.body).content,
    "저장 중 추가한 내용",
  );
  pendingRequests[1].resolve({
    json: async () => ({ version: "version-3" }),
    ok: true,
  });
  await secondSave;
  assert.equal(saveButton.disabled, true);
  assert.equal(status.dataset.state, "saved");
});

// 테스트에 필요한 값과 이벤트 등록 기능만 흉내 내는 최소 DOM 요소다.
function createFakeElement(initialValues = {}) {
  return {
    dataset: {},
    disabled: false,
    listeners: new Map(),
    textContent: "",
    value: "",
    ...initialValues,
    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    },
  };
}
