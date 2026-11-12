// 프로젝트에 저장한 내용을 README 소개 문서로 바꾸는 파일이다.
// Markdown은 #으로 제목을, -로 목록을 쓰는 간단한 문서 형식이다.
// 처리 순서: 글자와 주소 정리 → 제목·소개·스택을 합치기 → 저장할 파일 이름 정하기.
// 실행법이나 테스트 결과는 입력받지 않았으므로 자동으로 만들어 넣지 않는다.

// 사용자가 쓴 #, < 같은 글자가 제목이나 HTML 명령으로 해석되지 않게 바꾼다.
// trim은 앞뒤 공백을 지우고, replace는 찾은 글자를 다른 글자로 바꾸는 함수다.
function escapeMarkdown(value) {
  return String(value || "")
    .trim()
    .replace(/\r\n?/g, "\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[\\`*_{}[\]()#+=.!|~-]/g, "\\$&");
}

// URL은 웹 주소다. 주소를 읽을 수 있고 http/https 방식일 때만 문서 링크로 넣는다.
// 괄호처럼 링크 문법과 겹치는 글자는 %28 같은 주소용 표기로 바꾼다.
function safeLink(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    return url.href.replace(
      /[()<>\\"']/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    );
  } catch {
    // 주소를 읽지 못했다면 링크를 만들지 않는다. 나머지 소개 문서는 계속 만들 수 있다.
    return "";
  }
}

// sections는 문서의 작은 단락들을 모아두는 목록이다. 마지막에 빈 줄로 연결한다.
export function generateProjectReadme(project) {
  const sections = [`# ${escapeMarkdown(project.name) || "프로젝트 이름 미입력"}`];
  for (const [heading, value] of [
    ["프로젝트 소개", project.summary],
    ["진행 상태", project.status]
  ]) {
    if (String(value || "").trim()) {
      sections.push(`## ${heading}\n\n${escapeMarkdown(value)}`);
    }
  }
  if (Array.isArray(project.stack) && project.stack.length > 0) {
    // map은 각 기술 이름을 '- React' 같은 목록 한 줄로 바꾸고, join은 줄들을 연결한다.
    sections.push(
      `## 기술 스택\n\n${project.stack.map((stack) => `- ${escapeMarkdown(stack)}`).join("\n")}`
    );
  }
  if (String(project.highlight || "").trim()) {
    sections.push(`## 강조할 경험\n\n${escapeMarkdown(project.highlight)}`);
  }
  const links = [
    ["소스 코드", project.repoUrl],
    ["배포", project.deployUrl]
  ].flatMap(([label, value]) => {
    // 주소가 올바르면 링크 한 줄을 넣고, 올바르지 않으면 빈 목록을 반환해 건너뛴다.
    const url = safeLink(value);
    return url ? [`- [${label}](${url})`] : [];
  });
  if (links.length > 0) {
    sections.push(`## 링크\n\n${links.join("\n")}`);
  }
  return `${sections.join("\n\n")}\n`;
}

// 파일 이름에 /가 들어가면 폴더 경로로 오해할 수 있으므로 사용할 수 없는 글자를 바꾼다.
// 너무 긴 이름은 80글자로 줄이고, 이름이 비어 있으면 project-README.md를 사용한다.
export function getProjectReadmeFilename(project) {
  const name = Array.from(String(project.name || ""), (character) =>
    character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 ? "-" : character
  )
    .join("")
    .replace(/[<>:"/\\|?*]/g, "-")
    .trim()
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 80);
  return `${name || "project"}-README.md`;
}
