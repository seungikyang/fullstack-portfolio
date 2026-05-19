# 4단계 백엔드 Node.js

## 목표

Node.js와 Express로 게시판 API를 만들며 서버, 라우팅, 요청, 응답의 흐름을 익힙니다.

## 실행 방법

```bash
cd 04-node-board-api
npm install
npm run dev
```

브라우저에서 `http://localhost:4000/health`를 열어 서버 상태를 확인하세요.

막히면 `answers.md`를 보고 다시 직접 고칩니다.

## 완료 기준

- `GET /posts`가 게시글 목록을 반환합니다.
- `POST /posts`가 새 게시글을 추가합니다.
- `PUT /posts/:id`가 게시글을 수정합니다.
- `DELETE /posts/:id`가 게시글을 삭제합니다.

## 취업 연결

SI/SW 프로젝트는 화면만큼 API와 데이터 흐름을 많이 다룹니다. 이 단계에서는 HTTP 메서드, 요청 body, URL 파라미터, 상태 코드를 직접 확인하는 것이 중요합니다.

이 단계가 끝나면 “게시판 CRUD API를 Express로 만들고 HTTP 상태 코드를 구분했다”고 설명할 수 있어야 합니다.

## 면접 연습

- `GET`과 `POST`의 차이를 설명해보세요.
- 404와 201 상태 코드를 언제 쓰는지 설명해보세요.
- 메모리 배열에 저장한 데이터가 서버 재시작 후 사라지는 이유를 설명해보세요.
