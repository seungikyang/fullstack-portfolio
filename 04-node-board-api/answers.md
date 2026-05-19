# 4단계 정답 확인

먼저 직접 풀어본 뒤 확인하세요. API 학습에서는 브라우저보다 `requests.http` 또는 Postman 같은 도구로 요청과 응답을 보는 것이 좋습니다. 아래 번호는 코드 안의 `빈칸` 번호와 같습니다.

## 빈칸 1 (GET /posts)

```js
res.json(posts);
```

## 빈칸 2 (GET /posts/:id · id 구하기)

```js
const id = Number(req.params.id);
```

## 빈칸 3, 4 (POST /posts · 새 게시글 값)

```js
title: req.body.title,
content: req.body.content,
```

## 빈칸 5 (PUT /posts/:id · id 구하기)

```js
const id = Number(req.params.id);
```

## 빈칸 6, 7 (PUT /posts/:id · 수정 값)

```js
post.title = req.body.title || post.title;
post.content = req.body.content || post.content;
```

## 빈칸 8 (DELETE /posts/:id · id 구하기)

```js
const id = Number(req.params.id);
```

## 자기 점검

- `GET /posts` 응답이 배열이어야 합니다.
- `GET /posts/1` 응답에 `id`, `title`, `content`가 있어야 합니다.
- `POST /posts` 요청 후 목록 개수가 늘어야 합니다.
- 없는 id를 조회하면 404가 나와야 합니다.
- 삭제 성공 시 204가 나와야 합니다.
