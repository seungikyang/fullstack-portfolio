// 폴더명 기반 문제집 URI와 저장소 경계 보호를 검증하는 서버 테스트
const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  createWorkbookServer,
  HOST,
  renderMarkdownDocument,
  WORKBOOK_PATH,
} = require("./serve-workbook.js");

test("Markdown을 링크 가능한 HTML로 렌더링하고 위험한 내용을 제거한다", async () => {
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
  server.listen(0, HOST);
  await once(server, "listening");
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

  const outsideResponse = await fetch(`${origin}/history.html`);
  assert.equal(outsideResponse.status, 404);

  const traversalResponse = await fetch(
    `${origin}${WORKBOOK_PATH}%2e%2e%2Fpackage.json`,
  );
  assert.equal(traversalResponse.status, 403);
});

test("허용된 실습 파일만 저장하고 외부 변경과 경로 이탈을 막는다", async (t) => {
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
  await fs.symlink(
    outsideFile,
    path.join(workbookRoot, "01-html-css/starter/styles.css"),
  );

  const editToken = "fixture-edit-token";
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
