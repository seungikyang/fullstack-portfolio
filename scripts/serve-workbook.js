// 저장소를 폴더명 기반 고정 URI로 제공하는 로컬 문제집 서버
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const WORKBOOK_ROOT = path.resolve(__dirname, "..");
const WORKBOOK_SLUG = path.basename(WORKBOOK_ROOT);
const WORKBOOK_PATH = `/${encodeURIComponent(WORKBOOK_SLUG)}/`;
const HOST = "127.0.0.1";
const PORT = 4187;

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

  const pathname = new URL(request.url, `http://${HOST}:${PORT}`).pathname;
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

    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type":
        contentTypes[path.extname(filePath).toLowerCase()] ??
        "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : body);
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
    handleRequest(request, response).catch(() => {
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
  WORKBOOK_PATH,
};
