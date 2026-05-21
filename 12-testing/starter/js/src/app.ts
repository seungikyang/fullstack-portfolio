// 2번 문제의 통합 테스트 대상. 메모리 저장소를 쓰는 작은 게시판 API.

import express, { Request, Response } from 'express';

interface Post {
  id: number;
  title: string;
  content: string;
}

export function createApp() {
  const app = express();
  app.use(express.json());

  const posts: Post[] = [];
  let nextId = 1;

  app.get('/posts', (_req, res) => {
    res.json(posts);
  });

  app.get('/posts/:id', (req: Request<{ id: string }>, res: Response) => {
    const post = posts.find((p) => p.id === Number(req.params.id));
    if (!post) return res.status(404).json({ error: 'not found' });
    res.json(post);
  });

  app.post('/posts', (req, res) => {
    const { title, content } = req.body ?? {};
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });
    const post: Post = { id: nextId++, title, content };
    posts.push(post);
    res.status(201).json(post);
  });

  return app;
}
