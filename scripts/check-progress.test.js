// 학습 진도 스크립트의 전용 빈칸 판정과 단계 분류를 검증하는 테스트
const assert = require("node:assert/strict");
const test = require("node:test");
const { countPlaceholders, phaseForHeading } = require("./check-progress.js");

test("전용 ____ 토큰만 남은 빈칸으로 센다", () => {
  const content = [
    "const answer = ____; // 빈칸 1을 채우세요.",
    "// 빈칸을 모두 채운 뒤 실행하세요.",
    "const pair = [____, ____];"
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
