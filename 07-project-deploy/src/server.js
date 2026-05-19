// 미니 블로그 프로젝트의 API와 정적 파일 제공을 담당하는 서버 파일
import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
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

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "mini-blog" });
});

app.get("/api/posts", (req, res) => {
  res.json(posts);
});

app.post("/api/posts", (req, res) => {
  const post = {
    id: Date.now(),
    title: "____", // 빈칸 7. req.body.title을 넣으세요.
    content: "____", // 빈칸 8. req.body.content를 넣으세요.
    author: "____", // 빈칸 9. req.body.author 또는 기본값을 넣으세요.
    createdAt: new Date().toISOString()
  };

  posts = [post, ...posts];
  res.status(201).json(post);
});

app.listen(PORT, () => {
  console.log(`미니 블로그가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

