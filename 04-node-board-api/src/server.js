// Express 게시판 API의 서버와 라우터를 정의하는 파일
import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let nextId = 3;
let posts = [
  {
    id: 1,
    title: "첫 번째 게시글",
    content: "Express 서버에서 내려주는 예시 데이터입니다.",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "API 연습",
    content: "GET, POST, PUT, DELETE를 하나씩 채워보세요.",
    createdAt: new Date().toISOString()
  }
];

function findPost(id) {
  return posts.find((post) => post.id === id);
}

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "board-api" });
});

app.get("/posts", (req, res) => {
  res.json([]); // 빈칸 1. 실제 게시글 목록을 응답하세요.
});

app.get("/posts/:id", (req, res) => {
  const id = 0; // 빈칸 2. req.params.id를 숫자로 바꾸세요.
  const post = findPost(id);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  return res.json(post);
});

app.post("/posts", (req, res) => {
  const newPost = {
    id: nextId,
    title: "____", // 빈칸 3. 요청 body의 title을 넣으세요.
    content: "____", // 빈칸 4. 요청 body의 content를 넣으세요.
    createdAt: new Date().toISOString()
  };

  nextId += 1;
  posts.push(newPost);

  return res.status(201).json(newPost);
});

app.put("/posts/:id", (req, res) => {
  const id = 0; // 빈칸 5. 수정할 게시글 id를 구하세요.
  const post = findPost(id);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  post.title = "____"; // 빈칸 6. 기존 값 또는 요청 body의 title을 넣으세요.
  post.content = "____"; // 빈칸 7. 기존 값 또는 요청 body의 content를 넣으세요.

  return res.json(post);
});

app.delete("/posts/:id", (req, res) => {
  const id = 0; // 빈칸 8. 삭제할 게시글 id를 구하세요.
  const beforeCount = posts.length;
  posts = posts.filter((post) => post.id !== id);

  if (posts.length === beforeCount) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  return res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`게시판 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

