# 포트폴리오 README 템플릿

각 단계가 끝난 뒤 GitHub README에 아래 형식으로 정리하세요. 면접관이 빠르게 실행하고 이해할 수 있게 쓰는 것이 목표입니다.

## 프로젝트 이름

예시.

풀스택 학습 미니 블로그.

## 만든 이유

예시.

HTML, JavaScript, React, Express, MongoDB, 로그인, 배포 흐름을 하나씩 익히기 위해 만들었습니다.

## 주요 기능

- 게시글 목록 조회.
- 게시글 작성.
- 게시글 수정과 삭제.
- 회원가입과 로그인.
- 보호된 API 접근.

## 사용 기술

- Frontend. HTML, CSS, JavaScript, React.
- Backend. Node.js, Express.
- Database. MongoDB, Mongoose.
- Auth. bcryptjs, JWT.
- Deploy. Render 또는 Vercel.

## 실행 방법

```bash
npm install
npm run dev
```

## 실행·문제 해결 근거

- 실행 명령. `____`
- 관찰 결과. `____`
- 해결한 오류와 수정. `____`
- 직접 바꾼 코드 위치. `____`

## API 예시

```http
GET /posts
POST /posts
PUT /posts/:id
DELETE /posts/:id
```

## 배운 점

- 화면 입력값을 서버 API 요청으로 연결하는 흐름을 배웠습니다.
- 서버에서 HTTP 상태 코드를 상황에 맞게 반환하는 방법을 배웠습니다.
- 비밀번호를 평문으로 저장하지 않고 해시해야 하는 이유를 배웠습니다.

## 어려웠던 점과 해결 방법

예시.

처음에는 로그인 후 `/me` 요청이 계속 401로 실패했습니다. 요청 헤더에 `Authorization: Bearer 토큰` 형식으로 보내야 한다는 점을 확인하고 해결했습니다.

실제로 겪지 않은 오류나 실행하지 않은 명령은 예시 그대로 제출하지 않습니다. 자신의 로그와 코드 위치로 바꾼 항목만 남깁니다.

## 다음 개선 계획

- MongoDB를 연결해 게시글을 영구 저장합니다.
- 입력값 검증을 추가합니다.
- 배포 주소와 스크린샷을 README에 추가합니다.
