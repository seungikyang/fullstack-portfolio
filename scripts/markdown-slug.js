// Markdown 제목과 웹 앵커가 공유하는 GitHub 방식의 식별자를 만든다
// 예: "`2단계` 힌트 보는 법!" → "2단계-힌트-보는-법"
function markdownSlug(value) {
  return value
    .replace(/<[^>]+>/g, "") // 1. HTML 태그(<em> 등)를 통째로 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 2. [글자](주소) 링크에서 글자만 남긴다
    .replace(/[`*_~]/g, "") // 3. Markdown 강조 기호(` * _ ~)를 제거
    .trim() // 4. 앞뒤 공백을 잘라낸다
    .toLowerCase() // 5. 영어는 전부 소문자로 통일
    .replace(/[^\p{L}\p{N}\s_-]/gu, "") // 6. 한글·영문·숫자·공백·_- 를 제외한 특수문자 제거
    .replace(/\s+/g, "-"); // 7. 공백(1개 이상 연속)을 하이픈 - 하나로 바꾼다
}

module.exports = { markdownSlug };
