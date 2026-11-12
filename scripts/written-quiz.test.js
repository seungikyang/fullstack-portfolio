const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  buildWrittenBank,
  validateWrittenBank,
  buildWrittenDocuments,
} = require("./build-written-quiz.js");
const coverage = require("../quiz/written-coverage.json");
const { coverage: extraCoverage } = require("../quiz/written-extra-source.js");
const {
  coverage: reviewCoverage,
} = require("../quiz/written-review-source.js");
const core = require("../quiz/core.js");
const root = path.resolve(__dirname, "..");

test("기존 원문·꼬리질문·자가 점검·비밀번호 정책을 455문항의 선택형으로 연결한다", () => {
  const bank = buildWrittenBank();
  assert.equal(bank.questions.length, 455);
  assert.equal(Object.keys(coverage.originals).length, 108);
  assert.equal(
    coverage.featureSections.reduce((n, s) => n + s.items.length, 0),
    84,
  );
  assert.equal(bank.questions.filter((q) => q.category === "cs").length, 21);
  assert.equal(
    bank.questions.filter((q) => q.category === "technical").length,
    77,
  );
  assert.equal(
    bank.questions.filter((q) => q.category === "behavioral").length,
    10,
  );
  assert.equal(
    bank.questions.filter((q) => q.category === "readme").length,
    82,
  );
  assert.equal(
    bank.questions.filter((q) => q.category === "workbook-concepts").length,
    106,
  );
  assert.equal(
    bank.questions.filter((q) => q.category === "workbook-sentences").length,
    18,
  );
  assert.equal(
    bank.questions.filter((q) => q.category === "reading").length,
    3,
  );
  assert.equal(
    bank.questions.filter((q) => q.category === "self-check").length,
    72,
  );
  assert.ok(core.validBank(bank));
  const missing = structuredClone(bank);
  missing.questions = missing.questions.filter((q) => q.sourceId !== "N1");
  assert.throws(() => validateWrittenBank(missing), /원문 전환 누락: N1/);
  const duplicate = structuredClone(bank);
  duplicate.questions[1].sourceId = duplicate.questions[0].sourceId;
  assert.throws(() => validateWrittenBank(duplicate), /ID 오류/);
  const extraMissing = structuredClone(bank);
  extraMissing.questions = extraMissing.questions.filter(
    (q) => q.sourceId !== "C08-17",
  );
  assert.throws(
    () => validateWrittenBank(extraMissing),
    /추가 원문 전환 누락: C08-17/,
  );
});

test("기존 455문항의 내용·ID·정답과 이전 저장 기록을 유지한다", () => {
  const bank = buildWrittenBank();
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(bank.questions))
      .digest("hex"),
    "ebd21277c02b2855225c36f5dac066b67d2e4ae4e5f075f6405c2ab9e1ec6f48",
  );
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(bank.questions.slice(0, 174)))
      .digest("hex"),
    "2b04c095c7b57783cb851ba341be219c825b54038fa61add1345a9a34662fef2",
  );
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(bank.questions.slice(0, 383)))
      .digest("hex"),
    "48be26411f42a8b1727bdfe3272f8fff34715a0441a69c86b694c4ca26345a85",
  );
  const record = {
    version: "written-choice-v1",
    answers: { W001: 0, W174: 2, W383: 2, W451: 2 },
  };
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(bank.questions.slice(0, 451)))
      .digest("hex"),
    "432a3c6f3c7858e1c9c62161bb65afbf3db9988155922851dd297196de177e70",
  );
  assert.deepEqual(core.restore(JSON.stringify(record), bank), record.answers);
  const last = bank.questions.at(-1);
  assert.equal(last.id, "W455");
  const graded = core.grade(last, last.answer, record.answers);
  assert.deepEqual(
    core.restore(
      JSON.stringify({ version: bank.version, answers: graded }),
      bank,
    ),
    graded,
  );
});

test("자가 점검과 비밀번호 정책 72개를 원문 위치마다 네 보기·해설·웹 채점으로 전환한다", () => {
  const bank = buildWrittenBank();
  const bySource = new Map(bank.questions.map((q) => [q.sourceId, q]));
  const documents = buildWrittenDocuments(bank);
  assert.equal(reviewCoverage.blocks.length, 28);
  assert.equal(
    reviewCoverage.blocks.reduce((n, block) => n + block.items.length, 0),
    72,
  );
  assert.equal(
    reviewCoverage.blocks.filter((block) => block.parent).length,
    18,
  );
  for (const block of reviewCoverage.blocks) {
    let content = documents[block.file];
    if (block.parent)
      content = content.split(`## ${block.parent}\n`)[1].split(/\n## /)[0];
    const prefix = "#".repeat(block.level);
    const section = content.split(`${prefix} ${block.heading} — 4지선다\n`)[1];
    assert.ok(section, `${block.file}: ${block.parent || block.heading}`);
    const body = section.split(new RegExp(`\\n#{1,${block.level}} `))[0];
    assert.equal(
      (body.match(/<summary>정답·해설 확인<\/summary>/g) || []).length,
      block.items.length,
    );
    for (const item of block.items) {
      const q = bySource.get(item.sourceId);
      assert.equal(q.originalPrompt, item.prompt, item.sourceId);
      assert.ok(
        body.includes(
          q.choices.map((choice, i) => `${i + 1}. ${choice}`).join("\n"),
        ),
        item.sourceId,
      );
      assert.ok(body.includes(q.explanation), item.sourceId);
      assert.ok(body.includes(`question=${q.id}`), item.sourceId);
      assert.equal(
        documents[block.file].split(`question=${q.id}`).length - 1,
        1,
        `${item.sourceId}: 같은 문서에 새 문항을 중복 출력하지 않습니다.`,
      );
    }
    // 다음 생성 구간의 시작 표시가 교체 과정에서 사라지지 않아야 합니다.
    assert.equal(
      (content.match(/<!-- written-choice:start -->/g) || []).length,
      (content.match(/<!-- written-choice:end -->/g) || []).length,
      block.file,
    );
  }
  const missing = structuredClone(bank);
  missing.questions = missing.questions.filter((q) => q.sourceId !== "PS14-03");
  assert.throws(
    () => validateWrittenBank(missing),
    /추가 원문 전환 누락: PS14-03/,
  );
  assert.doesNotMatch(
    documents["feature-implementation-workbook.md"],
    /^### 자가 점검$/m,
  );
  for (const file of [
    "09-typescript/problems.md",
    "10-sql-oracle/problems.md",
    "11-java-spring/problems.md",
    "12-testing/problems.md",
    "13-git-collab/problems.md",
    "14-docker-deploy/problems.md",
    "16-security/problems.md",
  ]) {
    assert.doesNotMatch(documents[file], /^## 자가 점검$/m);
  }
  // 문서에 되풀이되던 문제는 기존 ID의 선택지를 공유합니다.
  for (const [file, ids] of [
    ["01-html-css/answers.md", ["H01", "H02", "H03"]],
    ["15-cs-fundamentals/README.md", ["R15-01", "R15-02", "R15-03", "R15-04"]],
  ]) {
    for (const id of ids)
      assert.ok(documents[file].includes(`question=${bySource.get(id).id}`));
  }
});

test("비밀번호 서술형 네 질문을 전환하고 문제 문서에 독립 서술형 질문을 남기지 않는다", () => {
  const bank = buildWrittenBank();
  const documents = buildWrittenDocuments(bank);
  const added = bank.questions.slice(451);
  assert.deepEqual(
    added.map((q) => q.sourceId),
    ["PW16-01", "PW16-02", "PW16-03", "PW16-04"],
  );
  const security = documents["16-security/problems.md"];
  const policy = security
    .split("## 7번. 비밀번호 정책 점검 — 4지선다\n")[1]
    .split(/\n## /)[0];
  assert.equal(
    (policy.match(/<summary>정답·해설 확인<\/summary>/g) || []).length,
    4,
  );
  for (const q of added) {
    assert.equal(q.choices.length, 4);
    assert.ok(policy.includes(`question=${q.id}`));
    const wrong = core.grade(q, (q.answer + 1) % 4, {});
    assert.equal(core.filter(bank.questions, wrong, "all", "wrong").length, 1);
    const right = core.grade(q, q.answer, wrong);
    assert.equal(core.stats(bank.questions, right).correct, 1);
    const missing = structuredClone(bank);
    missing.questions = missing.questions.filter((item) => item.id !== q.id);
    assert.throws(
      () => validateWrittenBank(missing),
      new RegExp(`추가 원문 전환 누락: ${q.sourceId}`),
    );
  }

  // 코드 블록과 이미 네 보기가 있는 문제를 제외하고 독립 서술형 지시를 찾습니다.
  // 실습 코드의 빈칸, 개인 학습 기록, 완료 체크는 전환 대상이 아닙니다.
  const files = fs
    .readdirSync(root)
    .filter((folder) => /^\d{2}-/.test(folder))
    .flatMap((folder) =>
      fs
        .readdirSync(path.join(root, folder))
        .filter((file) => file.endsWith(".md"))
        .map((file) => `${folder}/${file}`),
    );
  files.push(
    ...fs
      .readdirSync(root)
      .filter((file) => file.endsWith(".md") && file !== "AGENTS.md"),
    "monorepo-mini-app/README.md",
    "11-java-spring/starter/README.md",
    "14-docker-deploy/starter/node-board/README.md",
  );
  for (const file of files) {
    const content = (
      documents[file] || fs.readFileSync(path.join(root, file), "utf8")
    ).replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
    for (const block of content.split(/(?=^#{1,6} )/m)) {
      if (
        [1, 2, 3, 4].every((n) => new RegExp(`^${n}\\. `, "m").test(block)) &&
        block.includes("<summary>정답·해설 확인</summary>")
      )
        continue;
      assert.doesNotMatch(
        block,
        /^\s*(?:- |\d+\. )(?!\[[^\]]+\]\()[^\n]*(?:\?|설명하세요|서술하세요|한 문장으로 정리하세요)\s*$/m,
        `${file}: 선택지 없이 남은 서술형 질문`,
      );
    }
  }
});

test("실습 소스에 남은 서술형 관찰 질문도 기존 4지선다로 연결하고 코드 빈칸을 유지한다", () => {
  const bank = buildWrittenBank();
  const documents = buildWrittenDocuments(bank);
  for (const item of extraCoverage.inlineReferences) {
    const question = bank.questions.find((q) => q.sourceId === item.sourceId);
    assert.ok(question, item.sourceId);
    const content = documents[item.file];
    assert.ok(content.includes(`bank=written&question=${question.id}`));
    assert.ok(content.includes("4지선다"));
    assert.ok(!content.includes(item.originalText));
  }
  // 설명을 선택형으로 연결해도 학습자가 채울 SQL은 그대로 남습니다.
  assert.ok(
    documents["10-sql-oracle/starter/07-index.sql"].includes(
      "CREATE INDEX ____ ON employees(____);",
    ),
  );
  for (const file of fs.readdirSync(path.join(root, "10-sql-oracle/starter"))) {
    if (!file.endsWith(".sql")) continue;
    const relative = `10-sql-oracle/starter/${file}`;
    const content =
      documents[relative] || fs.readFileSync(path.join(root, relative), "utf8");
    assert.doesNotMatch(
      content,
      /^\s*--[^\n]*(?:나요|가요|까요|습니까)\?\s*$/m,
      relative,
    );
  }
});

test("README·로드맵·워크북의 모든 전환 위치에 네 보기와 접힌 해설이 있다", () => {
  const bank = buildWrittenBank();
  const bySource = new Map(bank.questions.map((q) => [q.sourceId, q]));
  function assertRendered(content, item, file) {
    const q = bySource.get(item.sourceId);
    assert.ok(q, item.sourceId);
    assert.ok(
      content.includes(
        q.choices.map((choice, i) => `${i + 1}. ${choice}`).join("\n"),
      ),
      `${file}: ${item.sourceId} 보기`,
    );
    assert.ok(
      content.includes(`**정답: ${q.answer + 1}번**`),
      `${file}: ${item.sourceId} 정답`,
    );
    assert.ok(
      content.includes(q.explanation),
      `${file}: ${item.sourceId} 해설`,
    );
    assert.ok(
      content.includes(`question=${q.id}`),
      `${file}: ${item.sourceId} 웹 연결`,
    );
  }
  const documents = buildWrittenDocuments(bank);
  for (const doc of extraCoverage.documents) {
    const part = documents[doc.file]
      .split(`## ${doc.heading}\n`)[1]
      .split(/\n## /)[0];
    assert.equal(
      (part.match(/<summary>정답·해설 확인<\/summary>/g) || []).length,
      doc.items.length,
      doc.file,
    );
    for (const item of doc.items) assertRendered(part, item, doc.file);
  }
  const feature = documents["feature-implementation-workbook.md"];
  assert.doesNotMatch(
    feature,
    /^### (?:개념 빈칸|전체 기능 지도 빈칸|저장소 계층 빈칸|보안\/운영 빈칸|설명 문장)$/m,
  );
  assert.equal(extraCoverage.featureSections.length, 18);
  for (const section of extraCoverage.featureSections)
    for (const item of [...section.items, section.sentence])
      assertRendered(feature, item, "종합 워크북");
  for (const item of extraCoverage.singles)
    assertRendered(documents[item.file], item, item.file);
  for (const item of extraCoverage.appended) {
    assert.doesNotMatch(
      documents[item.file],
      /Alpine 베이스를 쓰면 왜 작아지는지 한 문장으로 정리하세요/,
    );
    assertRendered(documents[item.file], item, item.file);
  }
  for (const item of extraCoverage.tail.items)
    assertRendered(feature, item, "최종 설명");
});

test("전환 데이터와 문서의 보기·정답·해설은 동일 원본으로 재생성된다", () => {
  const bank = buildWrittenBank();
  assert.deepEqual(
    JSON.parse(
      fs.readFileSync(path.join(root, "quiz/written-questions.json"), "utf8"),
    ),
    bank,
  );
  for (const [file, expected] of Object.entries(buildWrittenDocuments(bank))) {
    assert.equal(
      fs.readFileSync(path.join(root, file), "utf8"),
      expected,
      file,
    );
  }
  for (const file of [
    "15-cs-fundamentals/problems.md",
    "17-interview-prep/interview-cards.md",
    "17-interview-prep/behavioral-questions.md",
    "17-interview-prep/self-intro-templates.md",
    "17-interview-prep/project-pitch-template.md",
  ]) {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(content, /____|작성 칸|자기 답안을 직접 적/);
    assert.equal(
      (content.match(/<summary>정답·해설 확인<\/summary>/g) || []).length,
      bank.questions.filter((q) => q.reference === file).length,
    );
  }
  const balance = bank.questions.reduce(
    (a, q) => {
      a[q.answer]++;
      return a;
    },
    [0, 0, 0, 0],
  );
  assert.ok(Math.max(...balance) - Math.min(...balance) <= 1);
});

test("문항 수와 관계없이 보기·참조·분야가 손상된 데이터는 브라우저에서 거절한다", () => {
  const bank = buildWrittenBank();
  assert.ok(core.validBank(bank));
  assert.ok(core.validBank(require("../quiz/questions.json")));
  for (const mutate of [
    (b) => {
      b.questions[0].choices = ["보기 하나"];
    },
    (b) => {
      b.questions[0].answer = 4;
    },
    (b) => {
      b.questions[0].category = "unknown";
    },
    (b) => {
      b.questions[0].reference = "../../private.md";
    },
    (b) => {
      b.questions[1].id = b.questions[0].id;
    },
    (b) => {
      b.categories.push(b.categories[0]);
    },
    (b) => {
      b.questions = [];
    },
  ]) {
    const broken = structuredClone(bank);
    mutate(broken);
    assert.equal(core.validBank(broken), false);
  }
});

test("전환 문제의 채점·오답 복습·복구는 기본기 기록과 섞이지 않는다", () => {
  const bank = buildWrittenBank(),
    q = bank.questions[0];
  const wrong = core.grade(q, (q.answer + 1) % 4, {});
  assert.equal(core.filter(bank.questions, wrong, "cs", "wrong").length, 1);
  const right = core.grade(q, q.answer, wrong);
  assert.equal(core.stats(bank.questions, right).answered, 1);
  assert.equal(core.stats(bank.questions, right).correct, 1);
  assert.equal(core.filter(bank.questions, right, "cs", "wrong").length, 0);
  const raw = JSON.stringify({ version: bank.version, answers: right });
  assert.deepEqual(core.restore(raw, bank), right);
  assert.deepEqual(core.restore(raw, require("../quiz/questions.json")), {});
  assert.deepEqual(
    core.restore(
      JSON.stringify({ version: "old-version", answers: right }),
      bank,
    ),
    {},
  );
});
