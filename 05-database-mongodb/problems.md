# 5단계 문제

빈칸은 `src/models/Post.js`의 1번, 그다음 `src/server.js`의 2~8번 순서입니다.

## 문제 1. 모델 완성하고 이해하기 (Post.js · 빈칸 1)

`src/models/Post.js`의 `author` 기본값 빈칸을 채우세요. 작성자를 입력하지 않았을 때 쓸 이름입니다. (예: `"익명"`)

채운 뒤 아래 질문에 말로 답해보세요.

- `title`은 왜 필수(`required`)인가요?
- `trim`은 어떤 역할을 하나요?
- `timestamps` 옵션으로 어떤 필드가 자동으로 생기나요?

## 문제 2. 데이터 생성하기 (server.js · 빈칸 2, 3, 4)

`POST /posts`에서 요청 body의 `title`, `content`, `author`를 읽어 `Post.create`에 전달하세요. `author`가 없으면 기본값을 쓰도록 `req.body.author || "익명"` 형태로 넣습니다.

## 문제 3. 데이터 수정하기 (server.js · 빈칸 5, 6, 7)

`PUT /posts/:id`에서 요청 body 값으로 게시글의 `title`, `content`, `author`를 수정하세요.

## 문제 4. 데이터 삭제하기 (server.js · 빈칸 8)

`DELETE /posts/:id`에서 URL 파라미터의 id(`req.params.id`)로 게시글을 삭제하세요.

## 문제 5. 오류 읽기

`.env`의 MongoDB 연결 주소를 일부러 틀리게 바꾼 뒤, 서버 실행 시 터미널에 나오는 오류를 읽고 원인을 한 줄로 적어보세요.
