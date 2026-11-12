import { describe, expect, it } from "vitest";
import { generateProjectReadme, getProjectReadmeFilename } from "./project-readme.js";

describe("프로젝트 README 생성", () => {
  it("저장된 정보와 링크를 포함하고 실행법이나 검증 결과를 지어내지 않는다", () => {
    const markdown = generateProjectReadme({
      name: "Career Hub",
      summary: "취업 준비 기록",
      status: "완료",
      stack: ["React", "Express"],
      highlight: "사용자별 인증",
      repoUrl: "https://github.com/example/career-hub",
      deployUrl: "https://example.com"
    });
    for (const value of [
      "# Career Hub",
      "취업 준비 기록",
      "완료",
      "- React",
      "- Express",
      "사용자별 인증",
      "https://github.com/example/career-hub",
      "https://example.com/"
    ]) {
      expect(markdown).toContain(value);
    }
    expect(markdown).not.toContain("npm");
    expect(markdown).not.toContain("테스트 통과");
  });

  it("Markdown 문법과 HTML 입력을 본문으로 이스케이프하고 줄바꿈을 정규화한다", () => {
    const markdown = generateProjectReadme({
      name: "[프로젝트](악성)",
      summary: "<script>alert(1)</script>\r\n**경험** & `code`",
      stack: ["#태그"]
    });
    expect(markdown).toContain("\\[프로젝트\\]\\(악성\\)");
    expect(markdown).toContain("&lt;script&gt;alert\\(1\\)&lt;/script&gt;");
    expect(markdown).toContain("\\*\\*경험\\*\\* &amp; \\`code\\`");
    expect(markdown).toContain("- \\#태그");
    expect(markdown).not.toContain("\r");
    expect(markdown).not.toContain("<script>");
  });

  it("HTTP 링크의 괄호를 인코딩하고 실행 가능한 프로토콜과 잘못된 URL을 제외한다", () => {
    const markdown = generateProjectReadme({
      name: "링크",
      repoUrl: "https://example.com/a(b)",
      deployUrl: "javascript:alert(1)"
    });
    expect(markdown).toContain("[소스 코드](https://example.com/a%28b%29)");
    expect(markdown).not.toContain("javascript:");
    const invalid = generateProjectReadme({
      name: "링크",
      repoUrl: "not a url",
      deployUrl: "data:text/html,<script>"
    });
    expect(invalid).not.toContain("## 링크");
  });

  it("빈 값은 빈 섹션을 만들지 않고 기본 이름을 제공한다", () => {
    const markdown = generateProjectReadme({ name: " ", summary: "", stack: [], highlight: " " });
    expect(markdown).toBe("# 프로젝트 이름 미입력\n");
  });
});

describe("README 다운로드 파일명", () => {
  it("한글 이름을 유지하고 경로·제어문자와 파일명 금지 문자를 제거한다", () => {
    const filename = getProjectReadmeFilename({ name: '../이름/\\:*?"<>|\n\u0000\u007f' });
    expect(filename).toContain("이름");
    expect(filename).toMatch(/-README\.md$/);
    expect(filename).not.toMatch(/[/\\:*?"<>|]/);
    expect(
      Array.from(filename).every(
        (character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127
      )
    ).toBe(true);
    expect(filename.startsWith(".")).toBe(false);
  });

  it("빈 이름은 기본 파일명이고 매우 긴 이름은 길이를 제한한다", () => {
    expect(getProjectReadmeFilename({ name: "... " })).toBe("project-README.md");
    expect(getProjectReadmeFilename({ name: "가".repeat(1000) })).toHaveLength(90);
  });
});
