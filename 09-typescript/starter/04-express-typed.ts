// 4단계 게시판 API를 TypeScript로 다시 작성하는 연습 파일

import express, { Request, Response } from 'express';

// TODO: Post 인터페이스를 정의하세요. id(number), title(string), content(string).
interface Post {
  id: ____;
  title: ____;
  content: ____;
}

// TODO: URL 파라미터 타입을 정의하세요. Express params는 항상 문자열입니다.
interface PostParams {
  id: ____;
}

// TODO: POST 요청 body 타입을 정의하세요.
interface CreatePostBody {
  title: ____;
  content: ____;
}

// TODO: 에러 응답 형태를 정의하세요.
interface ErrorResponse {
  error: ____;
}

const app = express();
app.use(express.json());

const posts: ____[] = [];

app.get('/posts/:id', (req: Request<____>, res: Response<____ | ____>) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'not found' });
  res.json(post);
});

app.post('/posts', (req: Request<{}, ____, ____>, res: Response<____>) => {
  const next: Post = { id: posts.length + 1, ...req.body };
  posts.push(next);
  res.status(201).json(next);
});

app.listen(4000);
