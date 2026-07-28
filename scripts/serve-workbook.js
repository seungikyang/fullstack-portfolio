// 저장소를 폴더명 기반 고정 URI로 제공하는 로컬 문제집 서버
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const sanitizeHtml = require("sanitize-html");
const { markdownSlug } = require("./markdown-slug.js");

const WORKBOOK_ROOT = path.resolve(__dirname, "..");
const WORKBOOK_SLUG = path.basename(WORKBOOK_ROOT);
const WORKBOOK_PATH = `/${encodeURIComponent(WORKBOOK_SLUG)}/`;
const HOST = "127.0.0.1";
const PORT = 4187;
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
const sourceViewExtensions = new Set([
  ".css",
  ".html",
  ".http",
  ".java",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".properties",
  ".sql",
  ".ts",
  ".tsx",
  ".xml",
  ".yaml",
  ".yml",
]);
const sourceViewNames = new Set([
  ".dockerignore",
  ".env.example",
  "Dockerfile",
]);

function send(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

function getMarked() {
  markedPromise ??= import("marked").then(({ Marked }) => Marked);
  return markedPromise;
}

async function renderMarkdownDocument(markdown, documentTitle) {
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
        return `<h${token.depth} id="${slug}">${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
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
  const safeTitle = sanitizeHtml(documentTitle, {
    allowedTags: [],
    allowedAttributes: {},
  });

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
      @media (max-width: 560px) {
        .header-inner { min-height: 72px; align-items: flex-start; justify-content: center; padding: 12px 0; flex-direction: column; gap: 2px; }
        main { width: calc(100% - 24px); margin-top: 12px; padding: 22px 18px; border-radius: 12px; }
        h1, h2, h3 { scroll-margin-top: 92px; }
      }
      @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
    </style>
  </head>
  <body>
    <header class="document-header">
      <div class="header-inner">
        <a class="brand" href="${WORKBOOK_PATH}">← 문제집 목차</a>
        <span class="document-name">${safeTitle}</span>
      </div>
    </header>
    <main>${safeContent}</main>
  </body>
</html>`;
}

function canRenderSource(filePath) {
  return (
    sourceViewNames.has(path.basename(filePath)) ||
    sourceViewExtensions.has(path.extname(filePath).toLowerCase())
  );
}

async function renderSourceDocument(source, documentTitle) {
  const longestFence = Math.max(
    0,
    ...[...source.matchAll(/`+/g)].map((match) => match[0].length),
  );
  const fence = "`".repeat(Math.max(3, longestFence + 1));
  const markdown = [
    `# ${documentTitle}`,
    "",
    "> 읽기 전용 실습 코드입니다. 문제의 빈칸과 TODO는 로컬 파일에서 직접 수정하세요.",
    "",
    fence,
    source,
    fence,
  ].join("\n");

  return renderMarkdownDocument(markdown, documentTitle);
}

function isOutsideWorkbook(filePath) {
  const relativePath = path.relative(WORKBOOK_ROOT, filePath);
  return (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  );
}

async function handleRequest(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    send(response, 405, "Method Not Allowed");
    return;
  }

  const requestUrl = new URL(request.url, `http://${HOST}:${PORT}`);
  const pathname = requestUrl.pathname;
  const isSourceView = requestUrl.searchParams.get("view") === "source";
  const workbookBasePath = WORKBOOK_PATH.slice(0, -1);

  if (pathname === "/" || pathname === workbookBasePath) {
    response.writeHead(302, { Location: WORKBOOK_PATH });
    response.end();
    return;
  }

  if (!pathname.startsWith(WORKBOOK_PATH)) {
    send(response, 404, "Not Found");
    return;
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname.slice(WORKBOOK_PATH.length));
  } catch {
    send(response, 400, "Bad Request");
    return;
  }

  let filePath = path.resolve(WORKBOOK_ROOT, relativePath || "index.html");
  if (isOutsideWorkbook(filePath)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStats = await fs.stat(filePath);
    if (fileStats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (isSourceView && !canRenderSource(filePath)) {
      send(response, 415, "Source preview not supported");
      return;
    }

    const body = await fs.readFile(filePath);
    const isMarkdown = path.extname(filePath).toLowerCase() === ".md";
    const isHtmlDocument = isMarkdown || isSourceView;
    const responseBody = isSourceView
      ? await renderSourceDocument(body.toString("utf8"), path.basename(filePath))
      : isMarkdown
        ? await renderMarkdownDocument(
            body.toString("utf8"),
            path.basename(filePath),
          )
        : body;
    const responseHeaders = {
      "Content-Type": isHtmlDocument
        ? "text/html; charset=utf-8"
        : (contentTypes[path.extname(filePath).toLowerCase()] ??
          "application/octet-stream"),
      "X-Content-Type-Options": "nosniff",
    };
    if (isHtmlDocument) {
      responseHeaders["Content-Security-Policy"] =
        "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
    }

    response.writeHead(200, responseHeaders);
    response.end(request.method === "HEAD" ? undefined : responseBody);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      send(response, 404, "Not Found");
      return;
    }
    throw error;
  }
}

function createWorkbookServer() {
  return http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
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
  WORKBOOK_PATH,
};
