# 폴더부터 실무까지 학습 가이드

이 문서는 루트의 8개 프로그램을 순서대로 공부해 SI/SW 취업용 포트폴리오로 연결하는 핵심 안내서입니다.

목표는 많은 문법을 외우는 것이 아니라, 각 폴더에서 만든 결과물을 실무 능력과 이력서 문장으로 바꾸는 것입니다.

## 한 줄 흐름

`01-html-css`에서 화면을 만들고, `02-javascript-basics`에서 화면을 움직이고, `03-react-todo`에서 컴포넌트로 나누고, `04-node-board-api`에서 API를 만들고, `05-database-mongodb`에서 데이터를 저장하고, `06-login-auth`에서 로그인으로 보호하고, `07-project-deploy`에서 배포를 준비한 뒤, `08-fullstack-portfolio-project`에서 하나의 제출용 앱으로 통합합니다.

## 8개 폴더 전체 지도

| 순서 | 폴더 | 먼저 만드는 결과물 | 실무에서 보이는 능력 | 8번 Career Hub 연결 | 제출 증거 |
| --- | --- | --- | --- | --- | --- |
| 1 | `01-html-css` | 자기소개 페이지 | 화면 구조, 시맨틱 태그, 반응형 배치 | 로그인 화면, 사이드바, 카드 UI | 완성 화면 캡처와 CSS 설명 |
| 2 | `02-javascript-basics` | 이벤트 페이지와 계산기 | 입력값 처리, 이벤트, 함수 분리 | 폼 제출, 버튼 클릭, 목록 갱신 | 계산기 동작 화면과 함수 설명 |
| 3 | `03-react-todo` | Todo 앱 | 컴포넌트, state, props, 리스트 렌더링 | `src/App.jsx`의 로그인 상태와 CRUD 화면 | `npm run build` 결과와 컴포넌트 설명 |
| 4 | `04-node-board-api` | 게시판 REST API | HTTP 메서드, 상태 코드, API 설계 | 지원 현황과 프로젝트 CRUD API | `requests.http` 응답 예시 |
| 5 | `05-database-mongodb` | MongoDB 게시판 API | 스키마, 모델, 데이터 영속성 | `server/data-store.js`의 저장소 계층 | DB 저장 확인과 CRUD 설명 |
| 6 | `06-login-auth` | 회원가입과 로그인 API | 비밀번호 해시, JWT, 보호 API | `server/auth.js`의 bcrypt와 JWT 인증 | 401, 409, 로그인 토큰 검증 |
| 7 | `07-project-deploy` | 미니 블로그 배포 준비 | 프론트와 백 연결, 환경 변수, 배포 문서 | `.env.example`, 빌드, 실행 문서 | 배포 체크리스트와 실행 방법 |
| 8 | `08-fullstack-portfolio-project` | Career Hub fullstack 앱 | 인증, CRUD, 저장소, 검증 자동화 통합 | 최종 포트폴리오 본체 | `npm run verify` 통과 결과 |

## 매 단계 공부 루틴

1. 폴더의 `README.md`를 읽고 오늘 만들 기능을 한 문장으로 적습니다.
2. `problems.md`를 보고 `starter` 또는 `src`의 `빈칸`, `TODO`, `____`를 직접 채웁니다.
3. 실행해서 화면, API 응답, 에러 메시지 중 하나를 반드시 확인합니다.
4. 실패하면 에러 첫 줄, 파일명, 줄 번호를 읽고 한 곳만 고친 뒤 다시 실행합니다.
5. 막히면 `answers.md`와 비교하고, 틀린 이유를 한 문장으로 남깁니다.
6. 완료 후 "이 기능은 실무에서 어디에 쓰이는가"를 자기 말로 설명합니다.
7. 8번 Career Hub의 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)를 열어 같은 개념이 실제 앱에서 쓰인 위치를 찾습니다.

## 폴더별 완료 기준

| 폴더 | 공부 완료 기준 | 설명 완료 기준 |
| --- | --- | --- |
| `01-html-css` | 브라우저에서 자기소개 페이지가 깨지지 않습니다. | flexbox와 grid를 어디에 썼는지 말할 수 있습니다. |
| `02-javascript-basics` | 버튼 이벤트, 계산기, 할 일 추가가 동작합니다. | `addEventListener`, 함수, 배열을 연결해 설명할 수 있습니다. |
| `03-react-todo` | `npm run build`가 통과합니다. | state가 바뀌면 화면이 다시 그려지는 흐름을 말할 수 있습니다. |
| `04-node-board-api` | health, 목록, 생성, 수정, 삭제 API를 호출했습니다. | 200, 201, 204, 400, 404의 차이를 말할 수 있습니다. |
| `05-database-mongodb` | 생성한 데이터가 DB에 저장되고 다시 조회됩니다. | 스키마와 모델이 왜 필요한지 말할 수 있습니다. |
| `06-login-auth` | 회원가입, 로그인, 보호 API 호출이 동작합니다. | 비밀번호 해시와 JWT 검증 흐름을 말할 수 있습니다. |
| `07-project-deploy` | 정적 화면과 API가 함께 동작합니다. | 로컬 환경과 배포 환경의 차이를 말할 수 있습니다. |
| `08-fullstack-portfolio-project` | `npm run verify`가 통과합니다. | 1~7단계가 Career Hub에 어떻게 합쳐졌는지 말할 수 있습니다. |

## 실무처럼 공부하는 방법

- 기능을 하나 끝낼 때마다 Git 커밋 메시지처럼 한 문장으로 기록합니다.
- 화면 기능은 캡처, API 기능은 요청과 응답 예시, 검증 기능은 명령 실행 결과를 남깁니다.
- README에는 기능 설명보다 실행 방법, 검증 방법, 해결한 오류를 먼저 적습니다.
- 코드가 실패했을 때는 추측으로 여러 파일을 고치지 말고, 에러 위치를 읽고 한 번에 한 파일만 수정합니다.
- 면접 대비는 "무엇을 만들었다"보다 "왜 이렇게 나누었고 어떻게 검증했다"를 말하는 연습으로 합니다.

## 8번 Career Hub로 통합하는 순서

1. `08-fullstack-portfolio-project` 폴더로 이동합니다.
2. `npm install`을 실행합니다.
3. `cp .env.example .env`로 로컬 환경 파일을 만듭니다.
4. `npm run dev`로 앱을 실행합니다.
5. 브라우저에서 `http://localhost:5173`을 열고 데모 계정으로 로그인합니다.
6. 지원 현황과 프로젝트를 직접 추가, 수정, 삭제합니다.
7. 앱 안의 학습 연결 탭과 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)를 함께 봅니다.
8. `npm run verify`로 빌드, API smoke test, 제출 감사가 모두 통과하는지 확인합니다.

## 이력서와 지원서로 바꾸는 방법

| 준비물 | 어디서 작성하는가 | 제출에 쓰는 방식 |
| --- | --- | --- |
| 프로젝트 한 줄 소개 | [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md) | 이력서 프로젝트 제목 아래 |
| 기술 스택 설명 | [08 README](./08-fullstack-portfolio-project/README.md) | GitHub README와 포트폴리오 설명 |
| 1~7단계 연결 근거 | [learning-map.md](./08-fullstack-portfolio-project/learning-map.md) | 자기소개서와 면접 답변 |
| 제출 전 점검 | [submission-checklist.md](./08-fullstack-portfolio-project/submission-checklist.md) | GitHub 업로드 직전 확인 |
| 전체 학습 진행 | [student-checklist.md](./student-checklist.md) | 부족한 단계 재학습 |

## 면접 답변 3문장 공식

1. 어떤 문제를 해결하는 앱인지 말합니다.
2. 프론트엔드, 백엔드, 저장소, 인증을 어떻게 나누었는지 말합니다.
3. 어떤 명령과 테스트로 동작을 확인했는지 말합니다.

예시 문장입니다.

Career Hub는 SI/SW 취업 준비자가 지원 현황과 포트폴리오 프로젝트를 관리하는 fullstack 앱입니다. React로 화면을 만들고 Express로 REST API를 구성했으며, bcrypt와 JWT로 로그인 기능을 보호했습니다. `npm run verify`로 production build, API smoke test, 제출 전 감사가 통과하는지 확인했습니다.

## 권장 일정

| 일정 | 추천 대상 | 진행 방식 |
| --- | --- | --- |
| 12주 안정형 | 처음부터 차근차근 공부하는 학습자 | 1~7단계를 계획대로 끝내고 8번으로 통합합니다. |
| 4주 집중형 | 이미 기초가 조금 있는 학습자 | 1~2단계는 빠르게 복습하고 3~8단계 구현과 설명에 집중합니다. |
| 제출 직전형 | 이력서에 넣을 결과물이 급한 학습자 | 8번 Career Hub를 먼저 실행하고, 부족한 개념을 1~7단계에서 역으로 보강합니다. |

## 참고 자료를 보는 순서

1. 지금 여는 폴더의 `README.md`, `problems.md`, `answers.md`를 먼저 봅니다.
2. 개념이 부족하면 [references.md](./references.md)의 단계별 공식 문서를 봅니다.
3. 취업 방향이 흔들리면 [career-roadmap.md](./career-roadmap.md)를 봅니다.
4. GitHub 제출 문장이 필요하면 [portfolio-template.md](./portfolio-template.md)와 [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md)를 봅니다.
5. 최종 제출 전에는 아래 명령을 실제로 실행합니다.

```bash
npm run verify
cd 08-fullstack-portfolio-project
npm run verify
npm run audit:submit
```

## 최종 제출 전 자기 점검

- 8개 폴더가 각각 무엇을 배우는지 설명할 수 있습니다.
- 1~7단계가 Career Hub의 어느 파일과 기능으로 연결되는지 설명할 수 있습니다.
- GitHub README에 실행 방법, 주요 기능, 검증 명령, 배운 점이 들어 있습니다.
- `.env`, `node_modules`, `dist`, 로컬 데이터 파일을 제출하지 않는 이유를 알고 있습니다.
- 면접에서 오류를 만났던 경험과 해결 과정을 한 가지 말할 수 있습니다.
