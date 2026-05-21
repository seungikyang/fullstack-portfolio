// 반사형 XSS 방어 연습. ?q= 파라미터를 그대로 화면에 그리는 검색 페이지.

import express from 'express';

const app = express();

// TODO: 1번 파일과 같은 escapeHtml 함수를 구현하세요.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '____')
    .replace(/</g, '____')
    .replace(/>/g, '____')
    .replace(/"/g, '____')
    .replace(/'/g, '____');
}

app.get('/search', (req, res) => {
  const q = req.query.q ?? '';
  // TODO: 사용자 입력을 출력 시점에 escape 하세요.
  res.send(`
    <h1>검색 결과</h1>
    <p>검색어. ${____(q)}</p>
    <form>
      <input name="q" value="${____(q)}" />
      <button>검색</button>
    </form>
  `);
});

app.listen(3000, () => {
  console.log('http://localhost:3000/search?q=hello');
  console.log('공격 페이로드 예시: ?q=<img src=x onerror=alert(1)>');
});
