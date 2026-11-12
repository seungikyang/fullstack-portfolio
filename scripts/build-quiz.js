// 원본 개념 문제와 반복 연습 문제를 합쳐 브라우저가 읽을 JSON을 만듭니다.
const fs = require("node:fs");
const path = require("node:path");
const { buildPracticeQuestions } = require("../quiz/practice-source.js");
const root = path.resolve(__dirname, "..");
const categories = [
  ["html", "HTML 구조"],
  ["css", "CSS 배치"],
  ["javascript", "JavaScript"],
  ["dom", "DOM·이벤트"],
  ["react", "React"],
  ["http", "HTTP·API"],
  ["node", "Node·Express"],
  ["database", "DB·MongoDB"],
  ["auth", "로그인·인증"],
  ["deploy", "실행·배포"],
  ["career-hub", "Career Hub"],
  ["typescript", "TypeScript"],
  ["sql", "SQL"],
  ["spring", "Java·Spring"],
  ["testing", "테스트"],
  ["git", "Git 협업"],
  ["docker", "Docker·CI"],
  ["cs", "CS 기초"],
  ["security", "보안"],
  ["note-hub", "Note Hub"],
].map(([id, title]) => ({ id, title }));

function validate(questions) {
  if (questions.length !== 3000)
    throw new Error(`3000문항이어야 합니다: ${questions.length}`);
  const ids = new Set();
  const stems = new Set();
  const categoryIds = new Set(categories.map((c) => c.id));
  for (const q of questions) {
    if (!/^(?:C\d{3}|P\d{3,4})$/.test(q.id) || ids.has(q.id))
      throw new Error(`잘못되거나 중복된 ID: ${q.id}`);
    ids.add(q.id);
    if (!categoryIds.has(q.category)) throw new Error(`분야 오류: ${q.id}`);
    if (!["concept", "practice"].includes(q.type))
      throw new Error(`문항 종류 오류: ${q.id}`);
    if (typeof q.question !== "string" || q.question.trim().length < 5)
      throw new Error(`질문 누락: ${q.id}`);
    const stem = `${q.question}\n${q.code || ""}`.replace(/\s+/g, " ").trim();
    if (stems.has(stem)) throw new Error(`질문·코드가 같은 중복 문항: ${q.id}`);
    stems.add(stem);
    if (
      !Array.isArray(q.choices) ||
      q.choices.length !== 4 ||
      q.choices.some((c) => typeof c !== "string" || !c.trim()) ||
      new Set(q.choices.map((c) => c.trim())).size !== 4
    )
      throw new Error(`4지선다 보기 오류: ${q.id}`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
      throw new Error(`정답 오류: ${q.id}`);
    if (typeof q.explanation !== "string" || q.explanation.trim().length < 15)
      throw new Error(`해설 누락: ${q.id}`);
    if (
      typeof q.reference !== "string" ||
      !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*\.md$/.test(q.reference) ||
      q.reference.includes("..") ||
      !fs.existsSync(path.join(root, q.reference))
    )
      throw new Error(`학습 문서 연결 오류: ${q.id}`);
  }
  for (const c of categories) {
    if (
      questions.filter((q) => q.category === c.id && q.type === "concept")
        .length !== 20
    )
      throw new Error(`${c.id} 개념 문제는 20개여야 합니다.`);
  }
}

function buildBank() {
  const concepts = JSON.parse(
    fs.readFileSync(path.join(root, "quiz/concept-questions.json"), "utf8"),
  );
  // check/fixture는 제작 검증용이므로 배포하는 문제 데이터에는 담지 않습니다.
  const practice = buildPracticeQuestions().map(
    ({ check, fixture, rows, join, where, ...q }) => q,
  );
  const questions = [...concepts, ...practice];
  validate(questions);
  // 기존 2,000문항의 의미와 정답이 같으므로 기록 복구용 version을 유지합니다.
  return { version: "basics-1000-v1", categories, questions };
}

if (require.main === module) {
  const bank = buildBank();
  fs.writeFileSync(
    path.join(root, "quiz/questions.json"),
    `${JSON.stringify(bank, null, 2)}\n`,
  );
  console.log(
    `기본기 ${bank.questions.length}문항 생성 완료: 개념 400 + 코드·계산 반복 2600`,
  );
}
module.exports = { buildBank, validate };
