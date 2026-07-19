# 5단계 정답 확인

[문제로 돌아가기](./problems.md) · [DB 요청 모음](./requests.http) · [완료 체크](../student-checklist.md) · [다음 단계](../06-login-auth/README.md)

먼저 직접 풀어본 뒤 확인하세요. 데이터베이스 단계에서는 서버를 끄고 다시 켜도 데이터가 남는지 확인하는 것이 중요합니다. 아래 번호는 코드 안의 `빈칸` 번호와 같습니다.

## 빈칸 1 (Post.js · author 기본값)

```js
default: "익명"
```

## 빈칸 2, 3, 4 (server.js · POST /posts)

```js
const post = await Post.create({
  title: req.body.title,
  content: req.body.content,
  author: req.body.author || "익명",
});
```

## 빈칸 5, 6, 7 (server.js · PUT /posts/:id)

```js
const post = await Post.findByIdAndUpdate(
  req.params.id,
  {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author || "익명",
  },
  { new: true, runValidators: true },
);
```

## 빈칸 8 (server.js · DELETE /posts/:id)

```js
const deletedPost = await Post.findByIdAndDelete(req.params.id);
```

## 문제 5 참고: 연결 실패 에러 모양

`.env`의 주소가 틀리거나 MongoDB가 꺼져 있으면 터미널에 아래와 비슷한 에러가 나옵니다. 이 문장을 읽고 "DB에 연결을 못 했다"는 뜻임을 설명할 수 있으면 됩니다.

```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
    at ... (src/db.js:7:3)
```

- `ECONNREFUSED` = 연결이 거부됨 → MongoDB가 실행 중인지, 주소·포트가 맞는지 확인합니다.

## 자기 점검

- MongoDB가 꺼져 있으면 연결 오류가 나와야 합니다.
- 게시글을 생성한 뒤 서버를 재시작해도 목록에 남아 있어야 합니다.
- MongoDB Compass 또는 Atlas에서 실제 데이터가 보이면 통과입니다.
- 존재하지 않는 id를 삭제하면 404가 나와야 합니다.
