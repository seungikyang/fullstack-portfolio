// 저장소를 폴더명 기반 고정 URI로 제공하는 로컬 문제집 서버
// 실행 방법: `npm run serve:workbook` → http://127.0.0.1:4187/fullstack/
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const sanitizeHtml = require("sanitize-html");
const { markdownSlug } = require("./markdown-slug.js");
const {
  editableProblemPaths,
  problemTrackForPath,
} = require("./problem-work-files.js");

const WORKBOOK_ROOT = path.resolve(__dirname, ".."); // 이 스크립트의 한 단계 위 = 저장소 루트
const WORKBOOK_SLUG = path.basename(WORKBOOK_ROOT); // 폴더 이름(예: fullstack)을 주소로 쓴다
const WORKBOOK_PATH = `/${encodeURIComponent(WORKBOOK_SLUG)}/`;
const HOST = "127.0.0.1"; // 내 컴퓨터에서만 접속 가능한 주소(외부에 노출되지 않는다)
const PORT = 4187;
// 웹에서 파일을 저장할 때 요구하는 비밀 토큰. 실행할 때마다 새로 만들어진다.
const DEFAULT_EDIT_TOKEN = crypto.randomBytes(32).toString("hex");
// 저장 요청 본문 최대 크기(1MB). 실습 파일 기준으로 넉넉한 값이면서 무한정 커지는 걸 막는다.
const MAX_SOURCE_BYTES = 1024 * 1024;
let markedPromise;

// 확장자별로 브라우저에 알려줄 파일 형식(Content-Type)
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

// 짧은 응답용 헬퍼. 상태 코드와 문자열을 그대로 보낸다
function send(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

// marked(Markdown → HTML 변환기)는 ESM 모듈이라 처음 쓸 때 한 번만 불러와 재사용한다
function getMarked() {
  markedPromise ??= import("marked").then(({ Marked }) => Marked);
  return markedPromise;
}

// HTML 특수문자(& < > " ')를 화면에 그대로 보이게 하는 문자로 바꾼다.
// 사용자 입력을 HTML에 넣을 때 이걸 거치지 않으면 XSS 공격이 될 수 있다.
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

// Markdown 문서 안의 상대 링크를 문제집 주소 기준으로 고친다.
// 문서는 폴더 안에 있지만 화면은 /fullstack/... 주소로 서빙되기 때문에 기준점이 필요하다.
function resolveMarkdownHref(href, linkBase, slugPrefix) {
  if (!linkBase || !href) {
    return href;
  }
  // 문서 내 이동(#제목)은 같은 페이지 안에서 처리하고, 제목마다 접두사를 붙여 충돌을 피한다
  if (href.startsWith("#")) {
    return `#${slugPrefix}${href.slice(1)}`;
  }
  // 이미 절대 경로거나 http(s):, mailto: 등 완성된 링크면 그대로 둔다
  if (
    href.startsWith("/") ||
    href.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(href)
  ) {
    return href;
  }

  // 나머지 상대 링크(./answers.md 등)는 문서 위치를 기준으로 실제 주소를 계산한다
  const resolved = new URL(href, `http://workbook.local${linkBase}`);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

// Markdown 원문을 읽기 쉬운 HTML로 바꾼다. 표·코드블록(GFM)과 제목 앵커(id)를 지원한다.
async function renderMarkdownContent(
  markdown,
  { linkBase = "", slugPrefix = "" } = {},
) {
  const Marked = await getMarked();
  const renderer = new Marked({ gfm: true });
  // 같은 제목이 여러 번 나오면 "제목", "제목-1", "제목-2"처럼 번호를 붙여 id가 겹치지 않게 한다
  const slugCounts = new Map();
  renderer.use({
    renderer: {
      heading(token) {
        const baseSlug = markdownSlug(token.text);
        const duplicateCount = slugCounts.get(baseSlug) || 0;
        const slug =
          duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount}`;
        slugCounts.set(baseSlug, duplicateCount + 1);
        return `<h${token.depth} id="${slugPrefix}${slug}">${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
      },
      link(token) {
        const href = resolveMarkdownHref(token.href, linkBase, slugPrefix);
        const title = token.title
          ? ` title="${escapeHtml(token.title)}"`
          : "";
        return `<a href="${escapeHtml(href)}"${title}>${this.parser.parseInline(token.tokens)}</a>`;
      },
    },
  });
  const renderedMarkdown = renderer.parse(
    markdown.replace(/^[\u200B-\u200F\uFEFF]/, ""), // 파일 맨 앞의 보이지 않는 문자(BOM 등)를 제거
  );
  // 방금 만든 HTML에서 위험한 태그·속성을 걷어낸다(sanitize).
  // 학습 문서에 필요한 details/img/input 정도만 추가로 허용한다.
  const safeContent = sanitizeHtml(renderedMarkdown, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "details",
      "img",
      "input",
      "summary",
    ]),
    allowedAttributes: {
      a: ["href", "title"],
      code: ["class"],
      h1: ["id"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      h5: ["id"],
      h6: ["id"],
      img: ["alt", "src", "title"],
      input: ["checked", "disabled", "type"],
      ol: ["start"],
      td: ["align"],
      th: ["align"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });
  return safeContent;
}

// 문서 화면의 공통 뼈대(헤더·스타일·본문)를 붙여 완전한 HTML 페이지를 만든다.
// 제목과 본문은 이미 정화된 값(safe*)만 받는다.
function renderWorkbookDocument(
  safeContent,
  documentTitle,
  { bodyClass = "", scriptSrc = "", workbookPath = WORKBOOK_PATH } = {},
) {
  const safeTitle = sanitizeHtml(documentTitle, {
    allowedTags: [],
    allowedAttributes: {},
  });
  const safeBodyClass = escapeHtml(bodyClass);
  const safeScriptSrc = escapeHtml(scriptSrc);

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," />
    <title>${safeTitle} | 풀스택 취업 워크북</title>
    <style>
      :root { color-scheme: light; --navy: #16243d; --blue: #2563eb; --paper: #f7f6f2; --line: #dbe1ea; --muted: #64748b; }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; color: #1f2937; background: var(--paper); font-family: Inter, Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; line-height: 1.7; }
      .document-header { position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--line); background: rgba(247, 246, 242, 0.96); backdrop-filter: blur(14px); }
      .header-inner, main { width: min(880px, calc(100% - 40px)); margin: 0 auto; }
      .header-inner { min-height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
      .brand { color: var(--navy); font-weight: 900; text-decoration: none; }
      .document-name { overflow: hidden; color: var(--muted); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
      main { margin-top: 32px; margin-bottom: 56px; padding: clamp(24px, 5vw, 54px); border: 1px solid var(--line); border-radius: 18px; background: white; box-shadow: 0 14px 40px rgba(22, 36, 61, 0.08); }
      h1, h2, h3 { color: var(--navy); line-height: 1.28; letter-spacing: -0.025em; scroll-margin-top: 82px; }
      h1 { margin-top: 0; font-size: clamp(30px, 5vw, 44px); }
      h2 { margin-top: 2em; padding-bottom: 0.35em; border-bottom: 1px solid var(--line); font-size: clamp(24px, 4vw, 32px); }
      h3 { margin-top: 1.7em; }
      a { color: #1d4ed8; text-underline-offset: 3px; }
      a:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.35); outline-offset: 3px; }
      blockquote { margin-left: 0; padding: 12px 18px; border-left: 4px solid var(--blue); background: #eef4ff; color: #334155; }
      code { padding: 0.15em 0.35em; border-radius: 5px; background: #eef2f7; font-family: "SFMono-Regular", Consolas, monospace; overflow-wrap: anywhere; }
      pre { overflow-x: auto; padding: 18px; border-radius: 10px; background: var(--navy); color: #f8fafc; }
      pre code { padding: 0; background: transparent; color: inherit; overflow-wrap: normal; }
      table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
      th, td { padding: 10px 12px; border: 1px solid var(--line); text-align: left; }
      th { background: #eef2f7; color: var(--navy); }
      img { max-width: 100%; height: auto; }
      input[type="checkbox"] { margin-right: 0.45em; }
      button { min-height: 42px; padding: 9px 16px; border: 1px solid var(--line); border-radius: 9px; background: white; color: var(--navy); font: inherit; font-weight: 800; cursor: pointer; }
      button:hover:not(:disabled), button:focus-visible { border-color: var(--blue); color: #1d4ed8; }
      button:focus-visible, textarea:focus-visible, summary:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.35); outline-offset: 3px; }
      button:disabled { cursor: not-allowed; opacity: 0.55; }
      .problem-document main { width: min(1420px, calc(100% - 40px)); padding: clamp(24px, 3vw, 42px); }
      .problem-workspace { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(320px, 0.75fr); gap: 30px; align-items: start; }
      .problem-content { min-width: 0; }
      .problem-content a[href*="?view=source"] { display: inline-flex; align-items: center; min-height: 40px; padding: 7px 12px; border: 1px solid #bfdbfe; border-radius: 9px; background: #eff6ff; font-weight: 800; text-decoration: none; }
      .problem-content a[href*="?view=source"]::before { margin-right: 7px; content: "↗"; }
      .problem-help { position: sticky; top: 90px; max-height: calc(100vh - 122px); overflow-y: auto; padding: 22px; border: 1px solid var(--line); border-radius: 14px; background: #f8fafc; }
      .problem-help h2 { margin: 0 0 10px; padding: 0; border: 0; font-size: 26px; }
      .problem-help-intro { margin-top: 0; color: #475569; }
      .problem-help details { margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; background: white; }
      .problem-help summary { padding: 13px 14px; color: var(--navy); font-weight: 900; cursor: pointer; }
      .problem-help details[open] summary { border-bottom: 1px solid var(--line); }
      .problem-help .support-content { padding-top: 4px; }
      .source-document main { width: min(1180px, calc(100% - 40px)); }
      .source-path { color: var(--muted); overflow-wrap: anywhere; }
      .editor-toolbar { position: sticky; top: 74px; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 20px 0 12px; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: rgba(255, 255, 255, 0.96); }
      .save-source { border-color: var(--blue); background: var(--blue); color: white; }
      .save-source:hover:not(:disabled), .save-source:focus-visible { color: white; }
      .save-status { flex: 1 1 260px; color: var(--muted); font-size: 14px; }
      .save-status[data-state="dirty"] { color: #9a6700; }
      .save-status[data-state="error"] { color: #b42318; font-weight: 700; }
      .save-status[data-state="saved"] { color: #18794e; }
      .source-editor { display: block; width: 100%; min-height: 560px; resize: vertical; padding: 20px; border: 1px solid #334155; border-radius: 12px; background: #101827; color: #f8fafc; font: 14px/1.65 "SFMono-Regular", Consolas, monospace; tab-size: 2; white-space: pre; }
      .source-help { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 26px; }
      .source-help details { min-width: 0; border: 1px solid var(--line); border-radius: 12px; background: #fff; }
      .source-help summary { padding: 16px 18px; color: var(--navy); font-weight: 900; cursor: pointer; }
      .support-content { max-height: 620px; overflow: auto; padding: 0 18px 20px; border-top: 1px solid var(--line); }
      .support-content h1 { margin-top: 20px; font-size: 26px; }
      .support-content h2 { font-size: 22px; }
      @media (max-width: 960px) {
        .problem-workspace { grid-template-columns: 1fr; }
        .problem-help { position: static; max-height: none; }
      }
      @media (max-width: 560px) {
        .header-inner { min-height: 72px; align-items: flex-start; justify-content: center; padding: 12px 0; flex-direction: column; gap: 2px; }
        main { width: calc(100% - 24px); margin-top: 12px; padding: 22px 18px; border-radius: 12px; }
        h1, h2, h3 { scroll-margin-top: 92px; }
        .problem-document main { width: calc(100% - 24px); }
        .source-document main { width: calc(100% - 24px); }
        .editor-toolbar { top: 84px; }
        .source-editor { min-height: 460px; padding: 14px; }
        .source-help { grid-template-columns: 1fr; }
      }
      @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
    </style>
  </head>
  <body class="${safeBodyClass}">
    <header class="document-header">
      <div class="header-inner">
        <a class="brand" href="${workbookPath}">← 문제집 목차</a>
        <span class="document-name">${safeTitle}</span>
      </div>
    </header>
    <main>${safeContent}</main>
    ${safeScriptSrc ? `<script src="${safeScriptSrc}" defer></script>` : ""}
  </body>
</html>`;
}

// Markdown 파일 하나를 완성된 문서 화면으로 바꿔주는 편의 함수
async function renderMarkdownDocument(
  markdown,
  documentTitle,
  { workbookPath = WORKBOOK_PATH } = {},
) {
  const safeContent = await renderMarkdownContent(markdown);
  return renderWorkbookDocument(safeContent, documentTitle, { workbookPath });
}

async function renderProblemDocument(
  problemMarkdown,
  documentTitle,
  {
    answersMarkdown = "",
    hintsMarkdown = "",
    relativePath = "",
    workbookPath = WORKBOOK_PATH,
  } = {},
) {
  const trackFolder = problemTrackForPath(relativePath);
  const linkBase = `${workbookPath}${trackFolder}/`;
  const [problemContent, hintsContent, answersContent] = await Promise.all([
    renderMarkdownContent(problemMarkdown, { linkBase }),
    renderMarkdownContent(hintsMarkdown, {
      linkBase,
      slugPrefix: "problem-hint-",
    }),
    renderMarkdownContent(answersMarkdown, {
      linkBase,
      slugPrefix: "problem-answer-",
    }),
  ]);
  const safeContent = `<div class="problem-workspace">
      <article class="problem-content" aria-label="문제와 실습 파일">
        ${problemContent}
      </article>
      <aside class="problem-help" aria-labelledby="problem-help-title">
        <h2 id="problem-help-title">힌트와 정답</h2>
        <p class="problem-help-intro">문제를 먼저 풀고 실제 코드를 수정하세요. 막히면 힌트를 순서대로 확인한 뒤 마지막에 정답과 비교하세요.</p>
        <details>
          <summary>1~3단계 힌트 확인</summary>
          <div class="support-content">${hintsContent}</div>
        </details>
        <details>
          <summary>정답 비교 열기</summary>
          <div class="support-content">${answersContent}</div>
        </details>
      </aside>
    </div>`;

  return renderWorkbookDocument(safeContent, documentTitle, {
    bodyClass: "problem-document",
    workbookPath,
  });
}

// 파일 내용의 SHA-256 해시를 "버전"으로 쓴다.
// 내용이 1글자만 달라져도 해시가 완전히 달라지므로, 저장 충돌 감지에 딱 맞는 도구다.
function sourceVersion(source) {
  return crypto.createHash("sha256").update(source).digest("hex");
}

// 실습 코드 편집 화면(편집기 + 힌트 + 정답 패널)을 만든다
async function renderSourceDocument(
  source,
  documentTitle,
  {
    answersMarkdown = "",
    editToken = "",
    hintsMarkdown = "",
    relativePath = "",
    workbookPath = WORKBOOK_PATH,
  } = {},
) {
  const trackFolder = problemTrackForPath(relativePath);
  const linkBase = trackFolder ? `${workbookPath}${trackFolder}/` : workbookPath;
  // 힌트와 정답 문서를 미리 HTML로 만들어 둔다. 접두사를 달리해 제목 앵커가 겹치지 않게 한다.
  const [hintsContent, answersContent] = await Promise.all([
    renderMarkdownContent(hintsMarkdown, {
      linkBase,
      slugPrefix: "hint-",
    }),
    renderMarkdownContent(answersMarkdown, {
      linkBase,
      slugPrefix: "answer-",
    }),
  ]);
  const safeSource = escapeHtml(source); // 코드 안의 < > 를 화면용 문자로 바꿔 textarea에 안전하게 넣는다
  const safeRelativePath = escapeHtml(relativePath);
  const safeEditToken = escapeHtml(editToken);
  const safeVersion = escapeHtml(sourceVersion(source));
  const editorContent = `
      <h1>${escapeHtml(documentTitle)}</h1>
      <p class="source-path"><code>${safeRelativePath}</code></p>
      <blockquote>
        <p>웹에서 직접 수정한 뒤 <strong>파일 저장</strong>을 누르세요. 저장 내용은 같은 로컬 파일에 반영됩니다.</p>
      </blockquote>
      <section
        data-source-workspace
        data-edit-token="${safeEditToken}"
        data-source-version="${safeVersion}"
        aria-label="${escapeHtml(documentTitle)} 코드 편집기"
      >
        <div class="editor-toolbar">
          <button class="save-source" type="button" data-save-source>파일 저장</button>
          <button type="button" data-reload-source>저장 내용 다시 불러오기</button>
          <span class="save-status" data-save-status role="status" aria-live="polite">
            저장된 파일과 내용이 같습니다.
          </span>
        </div>
        <textarea
          class="source-editor"
          data-source-editor
          aria-label="${escapeHtml(documentTitle)} 실습 코드"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        >${safeSource}</textarea>
      </section>
      <section class="source-help" aria-label="힌트와 정답">
        <details>
          <summary>1~3단계 힌트 확인</summary>
          <div class="support-content">${hintsContent}</div>
        </details>
        <details>
          <summary>정답 비교 열기</summary>
          <div class="support-content">${answersContent}</div>
        </details>
      </section>`;

  return renderWorkbookDocument(editorContent, documentTitle, {
    bodyClass: "source-document",
    scriptSrc: `${workbookPath}scripts/workbook-editor.js`,
    workbookPath,
  });
}

// 이 파일이 웹 편집이 허용된 실습 파일인지 확인한다
function isEditableProblemPath(relativePath, editablePaths) {
  return editablePaths.has(relativePath.split(path.sep).join("/"));
}

// 요청한 경로가 저장소 바깥을 가리키는지 검사한다.
// "../" 같은 경로 조작(디렉터리 트래버설)으로 컴퓨터의 다른 파일을 열지 못하게 막는 안전장치다.
function isOutsideWorkbook(filePath, workbookRoot) {
  const relativePath = path.relative(workbookRoot, filePath);
  return (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  );
}

// JSON 응답용 헬퍼
function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

// 두 토큰을 비교한다. 단순 === 비교는 글자가 다른 지점을 발견하면 즉시 끝나서
// "몇 글자가 맞았는지"를 측정하는 타이밍 공격에 쓰일 수 있어, 시간이 일정한 비교를 쓴다.
function safeTokenEqual(actual, expected) {
  const actualBuffer = Buffer.from(actual || "");
  const expectedBuffer = Buffer.from(expected || "");
  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

// 요청 본문(저장할 코드)을 JSON으로 읽어들인다. 크기·인코딩·형식을 순서대로 검사한다.
async function readJsonBody(request) {
  const chunks = [];
  let byteLength = 0;

  for await (const chunk of request) {
    byteLength += chunk.length;
    // 1MB를 넘으면 더 받지 않고 중단한다(413 Payload Too Large)
    if (byteLength > MAX_SOURCE_BYTES) {
      const error = new Error("저장할 코드가 1MB 제한을 초과했습니다.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const text = buffer.toString("utf8");
  // 다시 인코딩해 원본과 같은지 확인한다. UTF-8로 깨지는 바이트가 섞여 있으면 거절한다.
  if (!Buffer.from(text, "utf8").equals(buffer)) {
    const error = new Error("UTF-8 형식의 코드만 저장할 수 있습니다.");
    error.statusCode = 400;
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("저장 요청 JSON 형식이 올바르지 않습니다.");
    error.statusCode = 400;
    throw error;
  }
}

// 웹 편집기의 저장 요청을 실제 파일에 반영하는 핵심 함수.
// 검사 순서: 편집 허용 파일인지 → 요청 형식이 맞는지 → 저장소 안인지 → 버전(충돌) 확인 → 저장.
async function saveProblemSource({
  content,
  editablePaths = editableProblemPaths,
  expectedVersion,
  filePath,
  relativePath,
  workbookRoot,
}) {
  if (!isEditableProblemPath(relativePath, editablePaths)) {
    return {
      message: "이 파일은 웹 편집이 허용된 실습 파일이 아닙니다.",
      statusCode: 403,
    };
  }
  if (typeof content !== "string" || typeof expectedVersion !== "string") {
    return {
      message: "코드 내용과 파일 버전이 필요합니다.",
      statusCode: 400,
    };
  }

  // symlink 등을 모두 따라간 "실제 경로"를 기준으로 다시 검사한다.
  // 표면적 경로는 저장소 안처럼 보여도 실제로는 밖일 수 있기 때문이다.
  const [realWorkbookRoot, realFilePath, fileStats] = await Promise.all([
    fs.realpath(workbookRoot),
    fs.realpath(filePath),
    fs.stat(filePath),
  ]);
  if (isOutsideWorkbook(realFilePath, realWorkbookRoot)) {
    return {
      message: "저장소 밖의 파일은 수정할 수 없습니다.",
      statusCode: 403,
    };
  }

  // 충돌 감지: 지금 디스크의 파일 버전이 편집기가 읽었던 버전과 다르면 저장을 거절한다.
  // 다른 프로그램이 고친 내용을 모르고 덮어쓰는 사고를 막는다(409 Conflict).
  const currentSource = await fs.readFile(realFilePath, "utf8");
  if (sourceVersion(currentSource) !== expectedVersion) {
    return {
      message:
        "다른 편집기에서 파일이 변경되었습니다. 저장 내용을 다시 불러온 뒤 수정하세요.",
      statusCode: 409,
    };
  }

  // 임시 파일에 쓴 뒤 이름을 바꾸는(rename) 방식으로 저장한다.
  // 쓰다가 실패해도 원본이 반쯤 덮여 쓰이는 일이 없다(원자적 저장).
  const temporaryPath = path.join(
    path.dirname(realFilePath),
    `.${path.basename(realFilePath)}.workbook-${crypto.randomUUID()}.tmp`,
  );
  try {
    await fs.writeFile(temporaryPath, content, {
      encoding: "utf8",
      flag: "wx", // 같은 이름 임시 파일이 이미 있으면 실패한다
      mode: fileStats.mode, // 원본 파일의 권한을 그대로 유지한다
    });
    await fs.rename(temporaryPath, realFilePath);
  } finally {
    await fs.rm(temporaryPath, { force: true }); // 성공했으면 이미 rename되어 없고, 실패했으면 잔여물을 치운다
  }

  return {
    message: "파일을 저장했습니다.",
    statusCode: 200,
    version: sourceVersion(content),
  };
}

// 모든 HTTP 요청이 거치는 라우팅 함수. 순서: 메서드 검사 → 주소 리다이렉트 → 경로 검사 → PUT 저장 또는 GET 파일 제공.
async function handleRequest(request, response, context) {
  // 이 서버가 허용하는 메서드는 읽기(GET/HEAD)와 저장(PUT)뿐이다
  if (!["GET", "HEAD", "PUT"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD, PUT");
    send(response, 405, "Method Not Allowed");
    return;
  }

  const requestOrigin = `http://${request.headers.host || `${HOST}:${PORT}`}`;
  const requestUrl = new URL(request.url, requestOrigin);
  const pathname = requestUrl.pathname;
  const isSourceView = requestUrl.searchParams.get("view") === "source"; // ?view=source면 편집 화면
  const workbookBasePath = context.workbookPath.slice(0, -1);

  // 루트(/)나 /fullstack(슬래시 없음)으로 접속하면 항상 문제집 주소로 보낸다
  if (pathname === "/" || pathname === workbookBasePath) {
    response.writeHead(302, { Location: context.workbookPath });
    response.end();
    return;
  }

  // 문제집 주소 아래가 아니면 처음부터 404. 슬러그로 고정 주소를 유지하기 위한 규칙이다.
  if (!pathname.startsWith(context.workbookPath)) {
    send(response, 404, "Not Found");
    return;
  }

  // 주소에서 "폴더 안에서의 상대 경로"를 뽑아낸다 (한글 등은 인코딩되어 있으므로 디코딩)
  let relativePath;
  try {
    relativePath = decodeURIComponent(
      pathname.slice(context.workbookPath.length),
    );
  } catch {
    send(response, 400, "Bad Request");
    return;
  }

  // 상대 경로를 실제 파일 경로로 바꾸고, 폴더를 가리키면 그 안의 index.html을 찾는다
  let filePath = path.resolve(
    context.workbookRoot,
    relativePath || "index.html",
  );
  if (isOutsideWorkbook(filePath, context.workbookRoot)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStats = await fs.stat(filePath);
    if (fileStats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    const [realWorkbookRoot, realFilePath] = await Promise.all([
      fs.realpath(context.workbookRoot),
      fs.realpath(filePath),
    ]);
    if (isOutsideWorkbook(realFilePath, realWorkbookRoot)) {
      send(response, 403, "Forbidden");
      return;
    }
    filePath = realFilePath;

    // 편집 화면은 허용된 실습 파일에만 열린다
    if (
      isSourceView &&
      !isEditableProblemPath(relativePath, context.editablePaths)
    ) {
      send(response, 403, "Source editing is not allowed");
      return;
    }

    // ── 저장(PUT) 처리 ──
    if (request.method === "PUT") {
      if (!isSourceView) {
        response.setHeader("Allow", "GET, HEAD");
        send(response, 405, "Method Not Allowed");
        return;
      }
      // 검사 1: 요청이 같은 문제집 화면에서 왔는지(Origin 확인)
      if (request.headers.origin !== requestOrigin) {
        sendJson(response, 403, {
          message: "같은 문제집 화면에서 보낸 저장 요청만 허용됩니다.",
        });
        return;
      }
      // 검사 2: 이 서버 인스턴스가 발급한 편집 토큰을 가지고 있는지
      if (
        !safeTokenEqual(
          request.headers["x-workbook-edit-token"],
          context.editToken,
        )
      ) {
        sendJson(response, 403, {
          message: "편집 토큰이 올바르지 않습니다. 화면을 새로고침하세요.",
        });
        return;
      }
      // 검사 3: JSON 형식인지. 통과하면 본문을 읽고 saveProblemSource로 저장한다.
      if (
        !request.headers["content-type"]
          ?.toLowerCase()
          .startsWith("application/json")
      ) {
        sendJson(response, 415, {
          message: "JSON 저장 요청만 허용됩니다.",
        });
        return;
      }

      const requestBody = await readJsonBody(request);
      const result = await saveProblemSource({
        content: requestBody.content,
        editablePaths: context.editablePaths,
        expectedVersion: requestBody.version,
        filePath,
        relativePath,
        workbookRoot: context.workbookRoot,
      });
      sendJson(response, result.statusCode, {
        message: result.message,
        saved: result.statusCode === 200,
        version: result.version,
      });
      return;
    }

    // ── 읽기(GET/HEAD) 처리 ── 파일을 그대로 주거나, Markdown·편집 화면은 HTML로 바꿔 준다
    const body = await fs.readFile(filePath);
    const isMarkdown = path.extname(filePath).toLowerCase() === ".md";
    const isProblemDocument =
      isMarkdown &&
      path.basename(filePath) === "problems.md" &&
      problemTrackForPath(relativePath);
    const isHtmlDocument = isMarkdown || isSourceView;
    let responseBody = body;
    if (isSourceView) {
      // 편집 화면에는 이 단계의 힌트·정답 문서가 함께 들어간다
      const trackFolder = problemTrackForPath(relativePath);
      const [hintsMarkdown, answersMarkdown] = await Promise.all([
        fs.readFile(
          path.join(context.workbookRoot, trackFolder, "hints.md"),
          "utf8",
        ),
        fs.readFile(
          path.join(context.workbookRoot, trackFolder, "answers.md"),
          "utf8",
        ),
      ]);
      responseBody = await renderSourceDocument(
        body.toString("utf8"),
        path.basename(filePath),
        {
          answersMarkdown,
          editToken: context.editToken,
          hintsMarkdown,
          relativePath,
          workbookPath: context.workbookPath,
        },
      );
    } else if (isProblemDocument) {
      const trackFolder = problemTrackForPath(relativePath);
      const [hintsMarkdown, answersMarkdown] = await Promise.all([
        fs.readFile(
          path.join(context.workbookRoot, trackFolder, "hints.md"),
          "utf8",
        ),
        fs.readFile(
          path.join(context.workbookRoot, trackFolder, "answers.md"),
          "utf8",
        ),
      ]);
      responseBody = await renderProblemDocument(
        body.toString("utf8"),
        path.basename(filePath),
        {
          answersMarkdown,
          hintsMarkdown,
          relativePath,
          workbookPath: context.workbookPath,
        },
      );
    } else if (isMarkdown) {
      responseBody = await renderMarkdownDocument(
        body.toString("utf8"),
        path.basename(filePath),
        { workbookPath: context.workbookPath },
      );
    }
    const responseHeaders = {
      "Content-Type": isHtmlDocument
        ? "text/html; charset=utf-8"
        : (contentTypes[path.extname(filePath).toLowerCase()] ??
          "application/octet-stream"),
      "X-Content-Type-Options": "nosniff", // 파일 내용을 브라우저가 임의로 해석하지 않게 막는다
    };
    // HTML 문서에는 CSP(콘텐츠 보안 정책)를 붙여 외부 스크립트 실행 등을 차단한다.
    // 편집 화면은 자기 자신의 editor.js만 허용한다.
    if (isHtmlDocument) {
      responseHeaders["Content-Security-Policy"] =
        `default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: https:; ${isSourceView ? "script-src 'self'; connect-src 'self'; " : ""}base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
    }

    response.writeHead(200, responseHeaders);
    response.end(request.method === "HEAD" ? undefined : responseBody);
  } catch (error) {
    // 파일이 없으면(ENOENT) 404, 저장 관련 오류는 본문에 담긴 상태 코드로 알려준다
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      send(response, 404, "Not Found");
      return;
    }
    if (error.statusCode) {
      sendJson(response, error.statusCode, { message: error.message });
      return;
    }
    throw error;
  }
}

// 서버 객체를 만드는 함수. 테스트에서 다른 폴더·토큰을 넣어 재사용할 수 있게 옵션으로 받는다.
function createWorkbookServer(options = {}) {
  const workbookRoot = path.resolve(options.workbookRoot || WORKBOOK_ROOT);
  const workbookSlug = options.workbookSlug || path.basename(workbookRoot);
  const context = {
    editablePaths: options.editablePaths || editableProblemPaths,
    editToken: options.editToken || DEFAULT_EDIT_TOKEN,
    workbookPath: `/${encodeURIComponent(workbookSlug)}/`,
    workbookRoot,
  };

  return http.createServer((request, response) => {
    handleRequest(request, response, context).catch((error) => {
      console.error("문제집 요청 처리 실패:", error);
      if (!response.headersSent) {
        send(response, 500, "Internal Server Error");
      } else {
        response.destroy();
      }
    });
  });
}

// node scripts/serve-workbook.js 로 직접 실행했을 때만 서버를 띄운다
if (require.main === module) {
  createWorkbookServer().listen(PORT, HOST, () => {
    console.log(`문제집 주소: http://${HOST}:${PORT}${WORKBOOK_PATH}`);
  });
}

module.exports = {
  createWorkbookServer,
  HOST,
  PORT,
  renderMarkdownDocument,
  renderProblemDocument,
  renderSourceDocument,
  saveProblemSource,
  sourceVersion,
  WORKBOOK_PATH,
};
