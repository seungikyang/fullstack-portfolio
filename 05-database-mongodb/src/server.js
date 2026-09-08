// 문제 2~5에서 읽을 파일: 비동기 CRUD → 공통 오류 처리 → 서버 시작
import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./db.js";
import { Post } from "./models/Post.js";

const app = express();
const PORT = process.env.PORT || 4100;

// 라우트보다 먼저 등록되어, 뒤의 라우트가 JSON 본문을 다룰 수 있게 합니다.
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "mongodb-crud" });
});

// async 함수 안의 DB 작업은 await로 결과를 기다린 뒤 응답합니다.
// 먼저 목록 조회(Read) 흐름을 확인합니다.
app.get("/posts", async (req, res, next) => {
  try {
    // MongoDB 작업은 시간이 걸릴 수 있으므로 완료를 기다린 뒤 결과를 응답합니다.
    // 정렬은 최신 글이 목록의 앞쪽에 오도록 데이터베이스에 요청합니다.
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    // 라우트마다 오류 응답을 반복하지 않고, 마지막 공통 오류 미들웨어로 넘깁니다.
    next(error);
  }
});

app.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    return res.json(post);
  } catch (error) {
    return next(error);
  }
});

// 다음은 새 문서를 저장하는 생성(Create) 흐름입니다.
app.post("/posts", async (req, res, next) => {
  try {
    // create에 전달된 값은 저장 전에 Post 스키마의 필수값과 형식 규칙을 검사받습니다.
    const post = await Post.create({
      title: "____", // 빈칸 2. req.body.title을 넣으세요.
      content: "____", // 빈칸 3. req.body.content를 넣으세요.
      author: "____" // 빈칸 4. req.body.author 또는 기본값을 넣으세요.
    });

    return res.status(201).json(post);
  } catch (error) {
    return next(error);
  }
});

// 그다음은 id로 문서를 찾아 바꾸는 수정(Update) 흐름입니다.
app.put("/posts/:id", async (req, res, next) => {
  try {
    // new는 수정된 결과를 돌려주고, runValidators는 수정값에도 스키마 규칙을 검사하게 합니다.
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: "____", // 빈칸 5. 수정할 title 값을 넣으세요.
        content: "____", // 빈칸 6. 수정할 content 값을 넣으세요.
        author: "____" // 빈칸 7. 수정할 author 값을 넣으세요.
      },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    return res.json(post);
  } catch (error) {
    return next(error);
  }
});

// 마지막 CRUD는 id로 문서를 지우는 삭제(Delete) 흐름입니다.
app.delete("/posts/:id", async (req, res, next) => {
  try {
    const deletedPost = await Post.findByIdAndDelete("____"); // 빈칸 8. req.params.id를 넣으세요.

    if (!deletedPost) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

// CRUD 다음에는 공통 오류 처리를 확인합니다. Express는 매개변수가 네 개인 함수를 오류 미들웨어로 구분합니다.
// 위 CRUD에서 next(error)로 보낸 오류를 이곳에서 같은 형식의 500 응답으로 바꿉니다.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

// 실행할 때는 DB 연결을 먼저 완료한 뒤에만 아래 app.listen으로 서버를 엽니다.
await connectDatabase();

app.listen(PORT, () => {
  console.log(`MongoDB CRUD 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
