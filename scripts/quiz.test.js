const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { stripTypeScriptTypes } = require("node:module");
const { DatabaseSync } = require("node:sqlite");
const { buildBank, validate } = require("./build-quiz.js");
const { buildPracticeQuestions } = require("../quiz/practice-source.js");
const core = require("../quiz/core.js");
const bankPath = path.join(__dirname, "../quiz/questions.json");

test("목차의 17단계는 해당 학습 문서와 연결된 과목 문제로 바로 이동한다", () => {
  const index = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const lessons = [
    ...index.matchAll(/<article class="lesson-card">([\s\S]*?)<\/article>/g),
  ];
  assert.equal(lessons.length, 17);
  const basics = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  const written = require("../quiz/written-questions.json");
  for (const [, card] of lessons) {
    const folder = card.match(/href="\.\/(\d{2}-[^/]+)\/README\.md"/)?.[1];
    const href = card.match(/href="(\.\/quiz\/index\.html\?[^\"]+)"/)?.[1];
    assert.ok(href, `${folder}: 웹 문제집 바로 가기가 필요합니다.`);
    const url = new URL(
      href.replaceAll("&amp;", "&"),
      "http://workbook.local/",
    );
    const bank = url.searchParams.get("bank") === "written" ? written : basics;
    const category = url.searchParams.get("category");
    assert.ok(
      bank.categories.some((c) => c.id === category),
      `${folder}: 과목 ${category}`,
    );
    assert.ok(
      bank.questions.some(
        (q) => q.category === category && q.reference.startsWith(`${folder}/`),
      ),
      `${folder}: 관련 학습 문서와 연결된 문제가 필요합니다.`,
    );
  }
});

test("배포 문제집은 원본과 같고 20분야·3000문항·단일 정답·해설·문서 링크를 유지한다", () => {
  const bank = buildBank();
  assert.deepEqual(
    JSON.parse(fs.readFileSync(bankPath, "utf8")),
    bank,
    "원본 변경 뒤 npm run build:quiz로 문제집을 갱신하세요.",
  );
  assert.equal(bank.questions.filter((q) => q.type === "concept").length, 400);
  assert.equal(
    bank.questions.filter((q) => q.type === "practice").length,
    2600,
  );
  assert.equal(bank.categories.length, 20);
  assert.equal(core.validBank(bank), true);
  const families = new Map();
  for (const q of bank.questions.filter((q) => q.type === "practice")) {
    families.set(q.family, (families.get(q.family) || 0) + 1);
  }
  assert.equal(families.size, 130);
  assert.deepEqual([...new Set(families.values())], [20]);
  for (const category of bank.categories) {
    assert.ok(
      bank.questions.some(
        (q) => q.category === category.id && q.type === "practice",
      ),
      category.id,
    );
  }
  assert.equal(bank.questions.at(-1).id, "P2600");
  for (const q of bank.questions) {
    for (const field of ["check", "fixture", "rows", "join", "where"]) {
      assert.equal(
        Object.hasOwn(q, field),
        false,
        `${q.id}: 제작용 ${field}가 배포 데이터에 들어갔습니다.`,
      );
    }
  }
  const counts = bank.questions.reduce(
    (sum, q) => {
      sum[q.answer]++;
      return sum;
    },
    [0, 0, 0, 0],
  );
  assert.deepEqual(counts, [750, 750, 750, 750]);
  const duplicate = structuredClone(bank.questions);
  duplicate[1] = { ...duplicate[0], id: duplicate[1].id };
  assert.throws(() => validate(duplicate), /중복 문항/);
  assert.throws(() => validate(bank.questions.slice(0, -1)), /3000문항/);
});

test("기존 1000문항의 내용·ID·보기·정답과 저장 기록 호환성을 유지한다", () => {
  const bank = buildBank();
  const original = bank.questions.slice(0, 1000);
  assert.equal(
    crypto.createHash("sha256").update(JSON.stringify(original)).digest("hex"),
    "769f11b495b34cdcee1ddebce98e8afa1e273008f5879aa95a1d7253ae32c2b1",
    "기존 문항을 변경하면 version과 기록 호환성을 함께 검토하세요.",
  );
  const previousRecord = JSON.stringify({
    version: "basics-1000-v1",
    answers: { C001: 0, P600: 2 },
  });
  assert.deepEqual(core.restore(previousRecord, bank), { C001: 0, P600: 2 });
  const last = bank.questions.at(-1);
  const record = core.grade(last, last.answer, {});
  assert.deepEqual(
    core.restore(
      JSON.stringify({ version: bank.version, answers: record }),
      bank,
    ),
    record,
  );
  assert.deepEqual(core.filter(bank.questions, record, "all", "correct"), [
    last,
  ]);
  assert.deepEqual(core.filter(bank.questions, {}, "all", "all", "P2600"), [
    last,
  ]);
});

test("기존 2000문항을 그대로 보존하고 새 1000문항을 미풀이로 복구한다", () => {
  const bank = buildBank();
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(bank.questions.slice(0, 2000)))
      .digest("hex"),
    "01492e22452c7754e6a8d7e9748539e8c23bd29d1890175f73cd183bdcfc1d09",
    "기존 2000문항의 ID·보기·정답·해설을 바꾸면 기록 호환성을 검토하세요.",
  );
  const answers = { C001: 0, P600: 2, P1600: 1 };
  const restored = core.restore(
    JSON.stringify({ version: "basics-1000-v1", answers }),
    bank,
  );
  assert.deepEqual(restored, answers);
  const added = bank.questions.slice(2000);
  assert.equal(added.length, 1000);
  assert.equal(added[0].id, "P1601");
  assert.equal(added.at(-1).id, "P2600");
  assert.deepEqual(core.filter(added, restored, "all", "unanswered"), added);
  assert.equal(core.stats(bank.questions, restored).answered, 3);
});

test("JavaScript 출력 정답을 실제 실행 결과와 대조한다", () => {
  const questions = buildPracticeQuestions().filter(
    (q) => q.check === "javascript",
  );
  assert.equal(questions.length, 1160);
  for (const q of questions) {
    const output = [];
    vm.runInNewContext(
      q.code,
      {
        URL,
        URLSearchParams,
        Buffer,
        console: { log: (value) => output.push(String(value)) },
      },
      { timeout: 1000 },
    );
    assert.deepEqual(output, [q.choices[q.answer]], q.id);
  }
});

test("TypeScript 120문항의 정답을 타입 표기 제거 후 실제 실행 결과와 대조한다", () => {
  const questions = buildPracticeQuestions().filter(
    (q) => q.check === "typescript",
  );
  assert.equal(questions.length, 120);
  for (const q of questions) {
    const output = [];
    vm.runInNewContext(
      stripTypeScriptTypes(q.code),
      { console: { log: (value) => output.push(String(value)) } },
      { timeout: 1000 },
    );
    assert.deepEqual(output, [q.choices[q.answer]], q.id);
  }
});

test("SQL 계산·조인 240문항의 정답을 실제 임시 DB에서 확인한다", () => {
  const questions = buildPracticeQuestions().filter((q) =>
    ["sql", "join"].includes(q.check),
  );
  assert.equal(questions.length, 240);
  for (const q of questions) {
    const db = new DatabaseSync(":memory:");
    try {
      let result;
      if (q.check === "sql") {
        const f = q.fixture;
        // 표와 쿼리는 저장소 안의 고정된 제작 데이터입니다. 행 값은 매개변수로 바인딩합니다.
        db.exec(`CREATE TABLE ${f.table} (${f.columns.join(", ")})`);
        const insert = db.prepare(
          `INSERT INTO ${f.table} VALUES (${f.columns.map(() => "?").join(",")})`,
        );
        for (const row of f.rows) insert.run(...row);
        result = Object.values(db.prepare(f.query).get())[0];
      } else {
        db.exec(
          "CREATE TABLE employees(id, dept_id); CREATE TABLE departments(id PRIMARY KEY); INSERT INTO departments VALUES(1),(2)",
        );
        const insert = db.prepare("INSERT INTO employees VALUES(?, ?)");
        for (const row of q.rows) insert.run(...row);
        result = db
          .prepare(
            `SELECT COUNT(*) AS total FROM employees e ${q.join} JOIN departments d ON e.dept_id = d.id ${q.where || ""}`,
          )
          .get().total;
      }
      assert.equal(String(result), q.choices[q.answer], q.id);
    } finally {
      db.close();
    }
  }
});

test("브라우저의 잘못된 저장 기록은 무시하고 현재 문제의 유효한 답만 복구한다", () => {
  const bank = {
    version: "v1",
    questions: [
      { id: "C001", answer: 0 },
      { id: "C002", answer: 2 },
    ],
  };
  assert.deepEqual(core.restore("not-json", bank), {});
  assert.deepEqual(core.restore("null", bank), {});
  assert.deepEqual(
    core.restore(
      JSON.stringify({ version: "old", answers: { C001: 0 } }),
      bank,
    ),
    {},
  );
  assert.deepEqual(
    core.restore(
      JSON.stringify({
        version: "v1",
        answers: { C001: 0, C002: "2", unknown: 1 },
      }),
      bank,
    ),
    { C001: 0 },
  );
  assert.deepEqual(
    core.restore(
      JSON.stringify({ version: "v1", answers: { C001: -1, C002: 4 } }),
      bank,
    ),
    {},
  );
});

test("오답 복습 후 정답으로 바꾸면 중복 집계 없이 최신 답을 반영한다", () => {
  const questions = [
    { id: "C001", category: "html", answer: 0, question: "의미 있는 제목" },
    { id: "C002", category: "css", answer: 2, question: "CSS 배치" },
  ];
  const wrong = core.grade(questions[0], 1, {});
  assert.deepEqual(core.stats(questions, wrong), {
    answered: 1,
    correct: 0,
    wrong: 1,
  });
  assert.deepEqual(core.filter(questions, wrong, "html", "wrong"), [
    questions[0],
  ]);
  const corrected = core.grade(questions[0], 0, wrong);
  assert.deepEqual(core.stats(questions, corrected), {
    answered: 1,
    correct: 1,
    wrong: 0,
  });
  assert.equal(wrong.C001, 1, "이전 기록 객체를 직접 수정하지 않습니다.");
  assert.deepEqual(core.filter(questions, corrected, "all", "wrong"), []);
  assert.deepEqual(core.filter(questions, corrected, "all", "unanswered"), [
    questions[1],
  ]);
  assert.deepEqual(core.filter(questions, {}, "all", "all", " c002 "), [
    questions[1],
  ]);
  assert.throws(() => core.grade(questions[0], null, {}), /선택/);
  assert.throws(() => core.grade(questions[0], 4, {}), /선택/);
});

test("문제 번호 검색은 완전히 일치하는 ID를 우선하고 짧은 검색어는 부분 검색한다", () => {
  const questions = [
    { id: "P100", category: "html", question: "HTML 제목", answer: 0 },
    { id: "P1000", category: "css", question: "CSS 여백", answer: 1 },
    { id: "P101", category: "html", question: "P100과 연결된 개념", answer: 2 },
  ];
  assert.deepEqual(core.filter(questions, {}, "all", "all", " p100 "), [
    questions[0],
  ]);
  assert.deepEqual(core.filter(questions, {}, "all", "all", "P1000"), [
    questions[1],
  ]);
  assert.deepEqual(core.filter(questions, {}, "all", "all", "P10"), questions);
  assert.deepEqual(core.filter(questions, {}, "all", "all", "여백"), [
    questions[1],
  ]);
  assert.deepEqual(core.filter(questions, {}, "css", "all", "P100"), []);
  assert.deepEqual(
    core.filter(questions, { P100: 0 }, "all", "wrong", "P100"),
    [],
  );
});

test("문제 섞기는 원본과 각 문항의 정답을 바꾸지 않는다", () => {
  const source = [
    { id: "A", answer: 1 },
    { id: "B", answer: 2 },
    { id: "C", answer: 3 },
  ];
  const before = structuredClone(source);
  const shuffled = core.shuffle(source, () => 0);
  assert.deepEqual(source, before);
  assert.notDeepEqual(shuffled, source);
  assert.deepEqual(
    [...shuffled].sort((a, b) => a.id.localeCompare(b.id)),
    source,
  );
});

const sessionBank = {
  version: "session-v1",
  categories: [
    { id: "html", title: "HTML" },
    { id: "css", title: "CSS" },
  ],
  questions: [
    { id: "Q1", category: "html", answer: 0, question: "HTML 구조" },
    { id: "Q2", category: "html", answer: 2, question: "HTML 제목" },
    { id: "Q3", category: "css", answer: 1, question: "CSS 배치" },
  ],
};
const sessionRecord = {
  version: sessionBank.version,
  view: "review",
  category: "html",
  mode: "wrong",
  search: "",
  queueIds: ["Q2", "Q1"],
  questionId: "Q1",
  draft: 3,
  retry: true,
  started: true,
  entry: "category=html",
};

test("같은 과목 링크도 새 이동이면 열고 새로고침·뒤로가기는 풀던 상태를 복구한다", () => {
  const entry = "category=html";
  assert.equal(core.shouldFollowEntry(sessionRecord, entry, "navigate"), true);
  for (const navigationType of ["reload", "back_forward", undefined]) {
    assert.equal(
      core.shouldFollowEntry(sessionRecord, entry, navigationType),
      false,
    );
  }
  assert.equal(core.shouldFollowEntry(null, entry, "reload"), true);
  assert.equal(
    core.shouldFollowEntry(sessionRecord, "question=P100", "reload"),
    true,
  );
});

test("과목별 진도는 미풀이·정답·오답을 분리하고 재채점을 중복 집계하지 않는다", () => {
  const wrong = core.grade(sessionBank.questions[0], 3, {});
  const corrected = core.grade(sessionBank.questions[0], 0, wrong);
  const answers = core.grade(sessionBank.questions[2], 3, corrected);
  assert.deepEqual(core.categoryStats(sessionBank, answers), [
    { id: "html", title: "HTML", total: 2, answered: 1, correct: 1, wrong: 0 },
    { id: "css", title: "CSS", total: 1, answered: 1, correct: 0, wrong: 1 },
  ]);
});

test("이어 풀기는 오답 목록 순서·현재 문항·미제출 보기·재도전 상태를 복원한다", () => {
  const restored = core.restoreSession(
    JSON.stringify(sessionRecord),
    sessionBank,
  );
  assert.deepEqual(restored, {
    view: "review",
    category: "html",
    mode: "wrong",
    search: "",
    queueIds: ["Q2", "Q1"],
    questionId: "Q1",
    draft: 3,
    retry: true,
    started: true,
    entry: "category=html",
  });
  const corrected = core.grade(sessionBank.questions[0], 0, {});
  assert.deepEqual(
    core.filter(sessionBank.questions, corrected, "all", "wrong"),
    [],
  );
  assert.deepEqual(
    restored.queueIds,
    ["Q2", "Q1"],
    "정답으로 고쳐도 이미 시작한 복습 목록을 보존합니다.",
  );
  assert.equal(
    core.stats(sessionBank.questions, {}).answered,
    0,
    "선택 복구는 채점 기록을 만들지 않습니다.",
  );
});

test("손상되거나 다른 버전인 진도는 무시하고 목록 밖 문항의 보기는 복구하지 않는다", () => {
  for (const raw of [
    "not-json",
    "null",
    JSON.stringify({ ...sessionRecord, version: "old" }),
    JSON.stringify({ ...sessionRecord, mode: "unknown" }),
    JSON.stringify({ ...sessionRecord, category: "other" }),
    JSON.stringify({ ...sessionRecord, queueIds: {} }),
  ]) {
    assert.equal(core.restoreSession(raw, sessionBank), null);
  }
  const restored = core.restoreSession(
    JSON.stringify({
      ...sessionRecord,
      queueIds: ["unknown", "Q3", "Q2"],
      questionId: "Q1",
    }),
    sessionBank,
  );
  assert.deepEqual(restored.queueIds, ["Q2"]);
  assert.equal(restored.questionId, "Q2");
  assert.equal(restored.draft, null);
  assert.equal(restored.retry, false);
  assert.equal(
    core.restoreSession(
      JSON.stringify({ ...sessionRecord, draft: 4 }),
      sessionBank,
    ).draft,
    null,
  );
});

test("기록 파일은 같은 문제집의 유효한 답만 복원하고 잘못된 파일은 전체 거절한다", () => {
  const backup = {
    format: "fullstack-workbook-progress",
    version: sessionBank.version,
    answers: { Q1: 0, Q3: 1 },
  };
  assert.deepEqual(
    core.readBackup(JSON.stringify(backup), sessionBank),
    backup.answers,
  );
  assert.deepEqual(
    core.readBackup(JSON.stringify({ ...backup, answers: {} }), sessionBank),
    {},
  );
  for (const raw of [
    "invalid",
    "null",
    JSON.stringify({ ...backup, version: "written-choice-v1" }),
    JSON.stringify({ ...backup, answers: [] }),
    JSON.stringify({ ...backup, answers: { Q1: 5 } }),
    JSON.stringify({ ...backup, answers: { Q1: 0, unknown: 1 } }),
  ]) {
    assert.throws(() => core.readBackup(raw, sessionBank));
  }
});
