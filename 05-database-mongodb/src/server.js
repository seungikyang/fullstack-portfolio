// MongoDB 게시글 CRUD API의 서버와 라우터를 정의하는 파일
import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./db.js";
import { Post } from "./models/Post.js";

const app = express();
const PORT = process.env.PORT || 4100;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "mongodb-crud" });
});

app.get("/posts", async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
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

app.post("/posts", async (req, res, next) => {
  try {
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

app.put("/posts/:id", async (req, res, next) => {
  try {
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

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

await connectDatabase();

app.listen(PORT, () => {
  console.log(`MongoDB CRUD 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

