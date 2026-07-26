// 학습 진도 스크립트의 전용 빈칸 판정과 단계 분류를 검증하는 테스트
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
  EXPECTED_CHECKLIST_TOTAL,
  checklistProgress,
  countPlaceholders,
  learningVerificationErrors,
  phaseForHeading,
} = require("./check-progress.js");

test("전용 ____ 토큰만 남은 빈칸으로 센다", () => {
  const content = [
    "const answer = ____; // 빈칸 1을 채우세요.",
    "// 빈칸을 모두 채운 뒤 실행하세요.",
    "const pair = [____, ____];",
  ].join("\n");

  assert.equal(countPlaceholders(content), 3);
});

test("자연어 빈칸 주석만 있으면 완료로 판정한다", () => {
  assert.equal(countPlaceholders("// 빈칸 1. 이미 값을 채웠습니다."), 0);
});

test("체크리스트 제목을 네 취업 준비 구간으로 분류한다", () => {
  assert.equal(phaseForHeading("8단계 Career Hub"), "풀스택 기초");
  assert.equal(phaseForHeading("14단계 Docker"), "SI 실전 보강");
  assert.equal(phaseForHeading("17단계 면접"), "채용 직전 마감");
  assert.equal(phaseForHeading("최종 취업 준비"), "최종 취업 준비");
});

test("구간 밖의 공통 근거 체크도 전체 진행률에 포함한다", () => {
  const progress = checklistProgress(
    [
      "## 단계마다 남길 4종 근거",
      "- [x] 실행 명령을 기록했습니다.",
      "- [ ] 오류를 기록했습니다.",
      "## 1단계 HTML/CSS",
      "- [x] 화면을 확인했습니다.",
    ].join("\n"),
  );

  assert.equal(progress.completed, 2);
  assert.equal(progress.total, 3);
  assert.deepEqual(progress.nextItem, {
    heading: "단계마다 남길 4종 근거",
    task: "오류를 기록했습니다.",
  });
  assert.deepEqual(progress.phases["풀스택 기초"], {
    completed: 1,
    total: 1,
  });
});

test("학습 검증은 토큰과 체크리스트를 모두 완료해야 통과한다", () => {
  assert.deepEqual(
    learningVerificationErrors({
      completed: 106,
      total: 106,
      totalBlanks: 0,
    }),
    [],
  );
  assert.deepEqual(
    learningVerificationErrors({
      completed: 106,
      total: 106,
      totalBlanks: 1,
    }),
    ["전용 ____ 토큰이 1개 남아 있습니다."],
  );
  assert.deepEqual(
    learningVerificationErrors({
      completed: 105,
      total: 106,
      totalBlanks: 0,
    }),
    ["학습 체크리스트가 105/106개 완료 상태입니다."],
  );
});

test("체크리스트 항목이 삭제되거나 추가되면 학습 검증이 실패한다", () => {
  assert.deepEqual(
    learningVerificationErrors({
      completed: 105,
      total: 105,
      totalBlanks: 0,
    }),
    [
      `학습 체크리스트 항목 수가 105개입니다. ${EXPECTED_CHECKLIST_TOTAL}개여야 합니다.`,
    ],
  );
  assert.deepEqual(
    learningVerificationErrors({
      completed: 107,
      total: 107,
      totalBlanks: 0,
    }),
    [
      `학습 체크리스트 항목 수가 107개입니다. ${EXPECTED_CHECKLIST_TOTAL}개여야 합니다.`,
    ],
  );
});

test("실제 체크리스트는 단계 102개와 공통 근거 4개를 유지한다", () => {
  const checklist = fs.readFileSync(
    path.resolve(__dirname, "../student-checklist.md"),
    "utf8",
  );
  const progress = checklistProgress(checklist);
  const phaseTotals = Object.values(progress.phases).map(
    (phase) => phase.total,
  );

  assert.equal(progress.total, EXPECTED_CHECKLIST_TOTAL);
  assert.deepEqual(phaseTotals, [39, 34, 18, 11]);
  assert.equal(
    progress.total -
      phaseTotals.reduce((sum, phaseTotal) => sum + phaseTotal, 0),
    4,
  );
});
