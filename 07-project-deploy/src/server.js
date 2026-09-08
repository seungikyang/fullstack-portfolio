// 읽기 순서 3 · 문제 4: 정적 파일 제공 → API 처리 → 배포용 서버 시작
import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

// ES module에는 __dirname이 기본 제공되지 않아 현재 파일의 URL로부터 폴더 경로를 만듭니다.
// 이 경로를 기준으로 잡으면 서버를 어느 폴더에서 실행해도 public 위치를 정확히 찾습니다.
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
// 배포 서비스가 PORT 환경 변수를 주면 그 값을 쓰고, 로컬에서는 4300번을 사용합니다.
const PORT = process.env.PORT || 4300;

let posts = [
  {
    id: 1,
    title: "풀스택 학습 시작",
    content: "HTML부터 배포까지 한 단계씩 완성해봅니다.",
    author: "관리자",
    createdAt: new Date().toISOString()
  }
];

// 요청은 아래에 등록한 순서대로 공통 처리 단계를 거칩니다.
// express.static은 public의 HTML·CSS·JS를 보내고, /api 라우트는 게시글 데이터를 보냅니다.
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "mini-blog" });
});

// public/app.js의 GET fetch 요청이 이 라우트에 도착합니다.
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// public/app.js의 POST fetch 요청이 이 라우트에 도착합니다.
app.post("/api/posts", (req, res) => {
  // 브라우저가 보낸 게시글 값에 서버가 관리할 식별자와 작성 시각을 더합니다.
  const post = {
    id: Date.now(),
    title: "____", // 빈칸 7. req.body.title을 넣으세요.
    content: "____", // 빈칸 8. req.body.content를 넣으세요.
    author: "____", // 빈칸 9. req.body.author 또는 기본값을 넣으세요.
    createdAt: new Date().toISOString()
  };

  // 새 글을 배열 앞에 넣어 다음 목록 조회에서 최신 글이 먼저 보이게 합니다.
  posts = [post, ...posts];
  res.status(201).json(post);
});

// 마지막으로 모든 준비가 끝나면 배포 환경이 지정한 포트에서 서버를 시작합니다.
app.listen(PORT, () => {
  console.log(`미니 블로그가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
