// 폴더명 기반 문제집 URI와 저장소 경계 보호를 검증하는 서버 테스트
const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs/promises");
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
  assert.equal(rootResponse.headers.get("location"), WORKBOOK_PATH);

  const workbookResponse = await fetch(`${origin}${WORKBOOK_PATH}`);
  assert.equal(workbookResponse.status, 200);
  assert.match(
    await workbookResponse.text(),
    /<title>풀스택 취업 워크북 \| 처음부터 취업까지<\/title>/,
  );

  const historyResponse = await fetch(
    `${origin}${WORKBOOK_PATH}history.html`,
  );
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
    assert.match(
      document,
      /<details>\s*<summary>1~3단계 힌트 확인/,
      folder,
    );
    assert.match(
      document,
      /<details>\s*<summary>정답 비교 열기/,
      folder,
    );
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
  await write(
    "01-html-css/starter/index.html",
    '<main id="app">____</main>\n',
  );
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
    assert.match(document, /<details>\s*<summary>1~3단계 힌트 확인/, relativePath);
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
