// 폴더명 기반 문제집 URI와 저장소 경계 보호를 검증하는 서버 테스트
const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const {
  createWorkbookServer,
  HOST,
  WORKBOOK_PATH,
} = require("./serve-workbook.js");

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

  const outsideResponse = await fetch(`${origin}/history.html`);
  assert.equal(outsideResponse.status, 404);

  const traversalResponse = await fetch(
    `${origin}${WORKBOOK_PATH}%2e%2e%2Fpackage.json`,
  );
  assert.equal(traversalResponse.status, 403);
});
