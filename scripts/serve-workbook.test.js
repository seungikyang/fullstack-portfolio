// 폴더명 기반 문제집 URI와 저장소 경계 보호를 검증하는 서버 테스트
const assert = require("node:assert/strict");
const { once } = require("node:events");
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

  const outsideResponse = await fetch(`${origin}/history.html`);
  assert.equal(outsideResponse.status, 404);

  const traversalResponse = await fetch(
    `${origin}${WORKBOOK_PATH}%2e%2e%2Fpackage.json`,
  );
  assert.equal(traversalResponse.status, 403);
});
