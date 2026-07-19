# 7단계 정답 확인

[문제로 돌아가기](./problems.md) · [배포 점검](./deploy-checklist.md) · [완료 체크](../student-checklist.md) · [다음 단계](../08-fullstack-portfolio-project/README.md)

먼저 직접 풀어본 뒤 확인하세요. 마지막 프로젝트는 "내가 만든 전체 흐름을 설명할 수 있는가"가 가장 중요합니다. 아래 번호는 코드 안의 `빈칸` 번호와 같습니다.

## 빈칸 1 (app.js · API 주소)

```js
const API_BASE = "";
```

## 빈칸 2 (app.js · 제목 렌더링)

```js
title.textContent = post.title;
```

## 빈칸 3 (app.js · 작성자와 작성일)

```js
meta.textContent = `작성자: ${post.author} · 작성일: ${formatDate(post.createdAt)}`;
```

## 빈칸 4, 5, 6 (app.js · 폼 입력값)

```js
const payload = {
  title: titleInput.value.trim(),
  author: authorInput.value.trim(),
  content: contentInput.value.trim(),
};
```

## 빈칸 7, 8, 9 (server.js · 새 게시글 만들기)

```js
const post = {
  id: Date.now(),
  title: req.body.title,
  content: req.body.content,
  author: req.body.author || "익명",
  createdAt: new Date().toISOString(),
};
```

## 자기 점검

- 첫 화면에서 기본 게시글이 보여야 합니다.
- 새 게시글을 작성하면 목록 맨 위에 추가되어야 합니다.
- 새로고침하면 메모리 데이터는 초기화됩니다. DB를 연결하지 않은 최종 프로젝트라서 정상입니다.
- Render에 배포할 때 `npm start`로 실행되어야 합니다.
