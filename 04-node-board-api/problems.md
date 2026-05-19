# 4단계 문제

`src/server.js`를 위에서 아래로 읽으면 빈칸이 1번부터 8번까지 순서대로 나옵니다.

## 문제 1. 목록 조회 API (빈칸 1)

`GET /posts`에서 빈 배열 대신 실제 `posts` 배열을 응답하세요.

## 문제 2. 단건 조회 API (빈칸 2)

`GET /posts/:id`에서 URL 파라미터를 숫자로 바꾸세요. (`Number(req.params.id)`)

- 없으면 404 응답을 반환합니다. (이미 처리되어 있습니다)
- 있으면 해당 게시글을 JSON으로 반환합니다.

## 문제 3. 게시글 생성 API (빈칸 3, 4)

`POST /posts`에서 요청 body의 `title`, `content`를 읽어 새 게시글을 만드세요.

## 문제 4. 게시글 수정 API (빈칸 5, 6, 7)

`PUT /posts/:id`에서 수정할 게시글을 찾고, 요청 body 값으로 제목과 내용을 바꾸세요.

- 요청 body에 값이 없으면 기존 값을 유지합니다. (`req.body.title || post.title`)

## 문제 5. 게시글 삭제 API (빈칸 8)

`DELETE /posts/:id`에서 삭제할 게시글 id를 숫자로 구하세요.
