// 저장소를 폴더명 기반 고정 URI로 제공하는 로컬 문제집 서버
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

const WORKBOOK_ROOT = path.resolve(__dirname, "..");
const WORKBOOK_SLUG = path.basename(WORKBOOK_ROOT);
const WORKBOOK_PATH = `/${encodeURIComponent(WORKBOOK_SLUG)}/`;
const HOST = "127.0.0.1";
const PORT = 4187;
const DEFAULT_EDIT_TOKEN = crypto.randomBytes(32).toString("hex");
const MAX_SOURCE_BYTES = 1024 * 1024;
let markedPromise;

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

function send(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

function getMarked() {
  markedPromise ??= import("marked").then(({ Marked }) => Marked);
  return markedPromise;
}

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

function resolveMarkdownHref(href, linkBase, slugPrefix) {
  if (!linkBase || !href) {
    return href;
  }
  if (href.startsWith("#")) {
    return `#${slugPrefix}${href.slice(1)}`;
  }
  if (
    href.startsWith("/") ||
    href.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(href)
  ) {
    return href;
  }

  const resolved = new URL(href, `http://workbook.local${linkBase}`);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

async function renderMarkdownContent(
  markdown,
  { linkBase = "", slugPrefix = "" } = {},
) {
  const Marked = await getMarked();
  const renderer = new Marked({ gfm: true });
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
    markdown.replace(/^[\u200B-\u200F\uFEFF]/, ""),
  );
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
      @media (max-width: 560px) {
        .header-inner { min-height: 72px; align-items: flex-start; justify-content: center; padding: 12px 0; flex-direction: column; gap: 2px; }
        main { width: calc(100% - 24px); margin-top: 12px; padding: 22px 18px; border-radius: 12px; }
        h1, h2, h3 { scroll-margin-top: 92px; }
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

async function renderMarkdownDocument(
  markdown,
  documentTitle,
  { workbookPath = WORKBOOK_PATH } = {},
) {
  const safeContent = await renderMarkdownContent(markdown);
  return renderWorkbookDocument(safeContent, documentTitle, { workbookPath });
}

function sourceVersion(source) {
  return crypto.createHash("sha256").update(source).digest("hex");
}

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
  const safeSource = escapeHtml(source);
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

function isEditableProblemPath(relativePath, editablePaths) {
  return editablePaths.has(relativePath.split(path.sep).join("/"));
}

function isOutsideWorkbook(filePath, workbookRoot) {
  const relativePath = path.relative(workbookRoot, filePath);
  return (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  );
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function safeTokenEqual(actual, expected) {
  const actualBuffer = Buffer.from(actual || "");
  const expectedBuffer = Buffer.from(expected || "");
  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function readJsonBody(request) {
  const chunks = [];
  let byteLength = 0;

  for await (const chunk of request) {
    byteLength += chunk.length;
    if (byteLength > MAX_SOURCE_BYTES) {
      const error = new Error("저장할 코드가 1MB 제한을 초과했습니다.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const text = buffer.toString("utf8");
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

  const currentSource = await fs.readFile(realFilePath, "utf8");
  if (sourceVersion(currentSource) !== expectedVersion) {
    return {
      message:
        "다른 편집기에서 파일이 변경되었습니다. 저장 내용을 다시 불러온 뒤 수정하세요.",
      statusCode: 409,
    };
  }

  const temporaryPath = path.join(
    path.dirname(realFilePath),
    `.${path.basename(realFilePath)}.workbook-${crypto.randomUUID()}.tmp`,
  );
  try {
    await fs.writeFile(temporaryPath, content, {
      encoding: "utf8",
      flag: "wx",
      mode: fileStats.mode,
    });
    await fs.rename(temporaryPath, realFilePath);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }

  return {
    message: "파일을 저장했습니다.",
    statusCode: 200,
    version: sourceVersion(content),
  };
}

async function handleRequest(request, response, context) {
  if (!["GET", "HEAD", "PUT"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD, PUT");
    send(response, 405, "Method Not Allowed");
    return;
  }

  const requestOrigin = `http://${request.headers.host || `${HOST}:${PORT}`}`;
  const requestUrl = new URL(request.url, requestOrigin);
  const pathname = requestUrl.pathname;
  const isSourceView = requestUrl.searchParams.get("view") === "source";
  const workbookBasePath = context.workbookPath.slice(0, -1);

  if (pathname === "/" || pathname === workbookBasePath) {
    response.writeHead(302, { Location: context.workbookPath });
    response.end();
    return;
  }

  if (!pathname.startsWith(context.workbookPath)) {
    send(response, 404, "Not Found");
    return;
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(
      pathname.slice(context.workbookPath.length),
    );
  } catch {
    send(response, 400, "Bad Request");
    return;
  }

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

    if (
      isSourceView &&
      !isEditableProblemPath(relativePath, context.editablePaths)
    ) {
      send(response, 403, "Source editing is not allowed");
      return;
    }

    if (request.method === "PUT") {
      if (!isSourceView) {
        response.setHeader("Allow", "GET, HEAD");
        send(response, 405, "Method Not Allowed");
        return;
      }
      if (request.headers.origin !== requestOrigin) {
        sendJson(response, 403, {
          message: "같은 문제집 화면에서 보낸 저장 요청만 허용됩니다.",
        });
        return;
      }
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

    const body = await fs.readFile(filePath);
    const isMarkdown = path.extname(filePath).toLowerCase() === ".md";
    const isHtmlDocument = isMarkdown || isSourceView;
    let responseBody = body;
    if (isSourceView) {
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
      "X-Content-Type-Options": "nosniff",
    };
    if (isHtmlDocument) {
      responseHeaders["Content-Security-Policy"] =
        `default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: https:; ${isSourceView ? "script-src 'self'; connect-src 'self'; " : ""}base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
    }

    response.writeHead(200, responseHeaders);
    response.end(request.method === "HEAD" ? undefined : responseBody);
  } catch (error) {
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
  renderSourceDocument,
  saveProblemSource,
  sourceVersion,
  WORKBOOK_PATH,
};
