// CORS 안전 설정 연습.

import express from 'express';
import cors from 'cors';

const app = express();

// 위험. * 와 credentials: true를 함께 두면 브라우저가 거부합니다.
// app.use(cors({ origin: '*', credentials: true }));

// TODO: 허용 출처를 화이트리스트로 두고, 출처가 명단에 없으면 거부하도록 만드세요.
const allowedOrigins = [
  'http://localhost:5173',
  'https://app.example.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없을 수도 있는 경우. curl이나 같은 출처 요청.
    if (!origin) return callback(null, true);
    if (____.includes(____)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: ____,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/api/me', (_req, res) => res.json({ user: 'demo' }));

app.listen(3000);
