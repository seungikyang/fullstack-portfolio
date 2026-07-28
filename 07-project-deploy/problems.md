# 7단계 문제

[단계 설명](./README.md) · [배포 점검](./deploy-checklist.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

브라우저 코드와 서버 코드를 완성한 뒤 실행 화면과 배포 체크리스트를 확인하세요.

- [브라우저 실습 코드 보기](./public/app.js?view=source)
- [서버 실습 코드 보기](./src/server.js?view=source)
- [현재 게시판 화면 실행](./public/index.html)
- [배포 체크리스트 열기](./deploy-checklist.md)

빈칸은 `public/app.js`의 1~6번, 그다음 `src/server.js`의 7~9번 순서입니다.

## 문제 1. API 주소 연결하기 (app.js · 빈칸 1)

`API_BASE`를 같은 서버로 호출되도록 바꾸세요.

힌트는 같은 서버에서 실행할 때 빈 문자열(`""`)을 쓰는 것입니다.

## 문제 2. 게시글 목록 렌더링하기 (app.js · 빈칸 2, 3)

`renderPosts` 함수에서 게시글 제목, 작성자, 작성일을 화면에 표시하세요.

- 빈칸 2: 제목 (`post.title`)
- 빈칸 3: `작성자: ... · 작성일: ...` 부분에 `post.author`와 `formatDate(post.createdAt)`을 넣으세요.

## 문제 3. 게시글 작성하기 (app.js · 빈칸 4, 5, 6)

폼 제출 이벤트의 `payload`에 입력값을 읽어 담으세요.

- 빈칸 4: `titleInput.value.trim()`
- 빈칸 5: `authorInput.value.trim()`
- 빈칸 6: `contentInput.value.trim()`

## 문제 4. 서버에서 body 읽기 (server.js · 빈칸 7, 8, 9)

`POST /api/posts`에서 요청 body 값을 사용해 새 게시글을 만드세요. `author`가 없으면 기본값(`req.body.author || "익명"`)을 씁니다.

## 문제 5. 배포 준비하기

`deploy-checklist.md`를 읽고 Render 배포에 필요한 값(Build/Start 명령, `PORT` 처리)을 직접 적어보세요.
