// 읽는 순서: HTTP와 Express → 미들웨어 → CRUD 라우트 → 상태 코드
// 문제 순서: 1. 목록 → 2. 한 건 조회 → 3. 생성 → 4. 수정 → 5. 삭제
import cors from "cors";
import express from "express";

// 서버 준비. Express 앱은 HTTP 메서드와 경로를 처리 함수에 연결합니다.
// 처리 함수의 req는 요청 정보, res는 브라우저나 API 도구로 보낼 응답입니다.
const app = express();
const PORT = process.env.PORT || 4000;

// 공통 처리. 미들웨어는 라우트보다 먼저 요청을 공통 처리하는 함수입니다.
// cors는 다른 주소에서 온 브라우저 요청을 허용하고, express.json은 JSON body를 읽게 합니다.
app.use(cors());
app.use(express.json());

// 아직 데이터베이스를 쓰지 않는 단계이므로 서버를 재시작하면 이 메모리 데이터도 초기화됩니다.
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

// 여러 라우트에서 같은 검색 규칙을 쓰도록 작은 함수로 분리했습니다.
function findPost(id) {
  return posts.find((post) => post.id === id);
}

// 서버가 요청을 받을 준비가 됐는지 가장 단순한 GET 요청으로 확인합니다.
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "board-api" });
});

// CRUD는 생성(Create), 조회(Read), 수정(Update), 삭제(Delete)를 뜻합니다.
// GET /posts는 여러 게시글을 조회합니다.
app.get("/posts", (req, res) => {
  res.json([]); // 빈칸 1. 실제 게시글 목록을 응답하세요.
});

// GET /posts/:id는 게시글 한 개를 조회합니다. :id 값은 req.params에서 꺼냅니다.
app.get("/posts/:id", (req, res) => {
  const id = 0; // 빈칸 2. req.params.id를 숫자로 바꾸세요.
  const post = findPost(id);

  if (!post) {
    // 응답한 뒤 return으로 끝내면 아래 성공 응답까지 두 번 보내는 일을 막을 수 있습니다.
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  return res.json(post);
});

// POST /posts는 req.body로 받은 값으로 새 게시글을 생성합니다.
app.post("/posts", (req, res) => {
  // 클라이언트가 보낸 값과 서버가 정하는 식별자·작성 시각을 합쳐 저장할 객체를 만듭니다.
  const newPost = {
    id: nextId,
    title: "____", // 빈칸 3. 요청 body의 title을 넣으세요.
    content: "____", // 빈칸 4. 요청 body의 content를 넣으세요.
    createdAt: new Date().toISOString()
  };

  nextId += 1;
  posts.push(newPost);

  // 새 자원이 만들어졌으므로 201 상태와 생성 결과를 함께 돌려줍니다.
  return res.status(201).json(newPost);
});

// PUT /posts/:id는 id로 대상을 찾은 뒤 요청값으로 수정합니다.
app.put("/posts/:id", (req, res) => {
  // 수정도 먼저 대상을 찾고, 없으면 404로 종료한 뒤에만 값을 바꾸는 순서입니다.
  const id = 0; // 빈칸 5. 수정할 게시글 id를 구하세요.
  const post = findPost(id);

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  post.title = "____"; // 빈칸 6. 기존 값 또는 요청 body의 title을 넣으세요.
  post.content = "____"; // 빈칸 7. 기존 값 또는 요청 body의 content를 넣으세요.

  return res.json(post);
});

// DELETE /posts/:id는 id가 같은 게시글을 삭제합니다.
app.delete("/posts/:id", (req, res) => {
  const id = 0; // 빈칸 8. 삭제할 게시글 id를 구하세요.
  const beforeCount = posts.length;
  posts = posts.filter((post) => post.id !== id);

  // 삭제 전후 개수가 같다면 조건에 맞는 게시글이 없었다는 뜻입니다.
  if (posts.length === beforeCount) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  // 204는 처리는 성공했지만 응답 본문은 없다는 의미입니다.
  return res.status(204).send();
});

// 서버 시작. 라우트와 미들웨어 준비가 끝난 뒤 포트를 열어 HTTP 요청을 받기 시작합니다.
app.listen(PORT, () => {
  console.log(`게시판 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
