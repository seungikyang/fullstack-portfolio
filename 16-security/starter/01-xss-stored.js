// 저장형 XSS 방어 연습. 실행 후 본문에 <script>alert('XSS')</script>를 제출해 확인하세요.

import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: false }));

const posts = [];
let nextId = 1;

// TODO: 출력 시점에 HTML escape를 적용하는 함수를 완성하세요.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '____')
    .replace(/</g, '____')
    .replace(/>/g, '____')
    .replace(/"/g, '____')
    .replace(/'/g, '____');
}

app.get('/', (_req, res) => {
  res.send(`
    <h1>미니 게시판</h1>
    <form method="POST" action="/posts">
      <input name="title" placeholder="제목" />
      <textarea name="content" placeholder="본문"></textarea>
      <button>작성</button>
    </form>
    <ul>
      ${posts.map((p) => `<li><a href="/posts/${p.id}">${escapeHtml(p.title)}</a></li>`).join('')}
    </ul>
  `);
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  posts.push({ id: nextId++, title, content });
  res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).send('not found');
  // TODO: 본문 출력에도 escape를 적용하세요.
  res.send(`<h1>${____(post.title)}</h1><div>${____(post.content)}</div>`);
});

app.listen(3000, () => console.log('http://localhost:3000'));
