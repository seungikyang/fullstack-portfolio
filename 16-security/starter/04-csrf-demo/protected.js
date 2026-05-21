// CSRF 방어가 적용된 서버 예시. SameSite 쿠키와 CSRF 토큰 두 방식을 모두 적용합니다.

import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import crypto from 'node:crypto';

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// TODO: 세션 쿠키에 SameSite를 적용해 외부 사이트에서 자동 전송되지 않게 만드세요.
app.post('/login', (_req, res) => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  res.cookie('session', sessionId, {
    httpOnly: true,
    secure: false, // 학습용. 운영에서는 반드시 true.
    sameSite: '____', // 'lax' 또는 'strict'
  });
  res.json({ ok: true });
});

// TODO: CSRF 토큰 미들웨어를 적용하세요.
const csrfProtection = csurf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.send(`
    <form action="/transfer" method="POST">
      <input type="hidden" name="_csrf" value="${____}" />
      <input name="to" />
      <input name="amount" />
      <button>송금</button>
    </form>
  `);
});

app.post('/transfer', csrfProtection, (req, res) => {
  res.json({ ok: true, to: req.body.to, amount: req.body.amount });
});

app.listen(4000);
