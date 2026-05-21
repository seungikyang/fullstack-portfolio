// SQL Injection 방어 연습. mysql2 콜백 스타일 가정.

import mysql from 'mysql2';
import express from 'express';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'pass',
  database: 'app',
});

const app = express();

// 위험. 사용자 입력을 문자열로 결합하면 ' OR '1'='1 로 우회됩니다.
app.get('/search-bad', (req, res) => {
  const sql = `SELECT id, name FROM users WHERE name = '${req.query.name}'`;
  connection.query(sql, (err, rows) => res.json(rows));
});

// TODO: 파라미터화 쿼리로 같은 기능을 안전하게 다시 작성하세요.
app.get('/search-safe', (req, res) => {
  connection.query(
    '____',           // 쿼리에 ? 자리표시자만 두고
    [____],           // 값 배열로 전달하세요
    (err, rows) => res.json(rows),
  );
});

app.listen(3000);
