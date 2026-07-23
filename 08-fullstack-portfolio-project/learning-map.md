# 1~7단계와 Career Hub 연결표

Career Hub는 `01-html-css`부터 `07-project-deploy`까지의 개념을 한 앱에서 다시 찾아보는 포트폴리오 후보입니다. 아래 파일·함수는 현재 코드에 존재하는 근거이며, 학습자가 직접 실행한 단계만 본인 경험으로 설명합니다.

## 전체 연결 요약

| 학습 단계 | 기존 폴더              | 현재 코드 근거                                                                                                                | 실행 후 사용할 수 있는 설명                                                                         |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1단계     | `01-html-css`          | `src/App.jsx`의 `LoginScreen`, `WorkbookSection`과 `src/styles.css`                                                           | 시맨틱 요소와 grid/flex 배치를 실제 화면에서 확인했습니다.                                          |
| 2단계     | `02-javascript-basics` | `src/App.jsx`의 `request`, `submitWorkbook`, `submitApplication`, `submitProject`                                             | 폼 이벤트를 API 요청과 목록 갱신으로 연결했습니다.                                                  |
| 3단계     | `03-react-todo`        | `src/App.jsx`의 `getWorkbookSteps`, `WorkbookSection`, `ApplicationSection`, `ProjectSection`, `App`                          | state와 props로 네 화면의 데이터 흐름을 관리했습니다.                                               |
| 4단계     | `04-node-board-api`    | `server/index.js`의 `createApp`과 `/api/workbook`, `/api/applications`, `/api/projects` 라우트                                | Express 라우트에서 GET·POST·PATCH·DELETE와 상태 코드를 확인했습니다.                                |
| 5단계     | `05-database-mongodb`  | `server/data-store.js`의 `JsonStore`, `updateWorkbook`, application/project CRUD 메서드                                       | JSON 저장소의 CRUD와 원자적 임시 파일 교체를 확인했습니다. MongoDB 사용 경험으로 표현하지 않습니다. |
| 6단계     | `06-login-auth`        | `server/auth.js`의 `hashPassword`, `verifyPassword`, `signToken`, `requireAuth`, `assertAuthConfig`                           | bcrypt work factor 10, HS256·2시간 JWT, 운영 시크릿 검증을 확인했습니다.                            |
| 7단계     | `07-project-deploy`    | `package.json`의 build/verify, `Dockerfile`, `docker-compose.yml`, `render.yaml`, `fly.toml`, 루트 `.github/workflows/ci.yml` | 실제로 실행한 build·test·컨테이너·CI 항목만 배포 준비 근거로 설명합니다.                            |

## 파일별 연결 근거

### `src/App.jsx`

- 1단계에서 배운 화면 구조를 React 컴포넌트 구조로 확장했습니다.
- 2단계에서 배운 이벤트 처리와 배열 렌더링을 `map`, `onSubmit`, `onClick`으로 사용했습니다.
- 3단계에서 배운 state와 props는 `App`과 각 Section 컴포넌트 사이의 데이터·갱신 함수 전달에서 확인할 수 있습니다.

### `server/index.js`

- `createApp` 안에서 취업 워크북, 지원 현황, 프로젝트 라우트를 구성합니다.
- `GET`, `POST`, `PATCH`, `DELETE`를 기능별로 분리했습니다.
- API 오류 상황에 맞게 `400`, `401`, `404`, `409` 상태 코드를 반환합니다.

### `server/data-store.js`

- 5단계에서 배운 데이터 저장과 CRUD 개념을 JSON 파일 저장소로 구현했습니다.
- 현재는 별도 DB 설치 없이 실행됩니다. `JsonStore`가 파일 저장을 담당하지만 라우터가 구체 클래스를 사용하므로 DB 교체에는 같은 메서드 계약의 구현과 생성 지점 변경이 필요합니다.
- 임시 파일 rename은 파일 교체 한 번을 안전하게 만들지만 여러 프로세스의 read-modify-write 전체를 잠그지는 않습니다. 현재는 단일 인스턴스 한계를 설명하고, 확장 시 DB 트랜잭션으로 옮깁니다.

### `server/auth.js`

- `hashPassword`와 `verifyPassword`가 비밀번호를 처리하고, `signToken`과 `requireAuth`가 토큰 발급·검증을 담당합니다.
- `assertAuthConfig`는 운영 환경에서 32자 이상의 비예제 `JWT_SECRET`이 없으면 시작을 거부합니다.
- 로그인하지 않은 사용자는 `/api/workbook`, `/api/applications`, `/api/projects`, `/api/dashboard`에 접근할 수 없습니다.

### `scripts/api-smoke-test.js`

- 7단계 배포 준비에서 필요한 검증 습관을 자동화했습니다.
- 회원가입, 로그인 실패·성공, 워크북 저장, 네 단계 준비도, 보호 API, 지원 기록 CRUD, 프로젝트 CRUD를 임시 데이터 파일에서 확인합니다.

## 면접 답변 예시

실제 실행·검증 기록이 있다면 다음 순서로 설명합니다. HTML/CSS와 JavaScript 개념을 React 컴포넌트·이벤트로 확장했고, Express 라우트와 `JsonStore`로 API·저장 흐름을 나눴습니다. `server/auth.js`에서 bcrypt와 JWT 흐름을 확인했고, `scripts/api-smoke-test.js`로 핵심 HTTP 경로를 실행했습니다. 실행하지 않은 단계는 코드에서 연결 위치를 확인한 학습 항목으로 구분합니다.

## 다음 확장 방향

- `server/data-store.js`를 MongoDB 또는 PostgreSQL 모델로 교체합니다. (저장소 추상화의 PostgreSQL 구현 사례는 같은 저장소 안의 [monorepo-mini-app](../monorepo-mini-app/)에서 확인할 수 있습니다 — `NotesStore` 인터페이스 + `InMemoryNotesStore`/`PostgresNotesStore` 두 구현을 환경변수로 전환.)
- 지원 현황에 검색, 필터, 정렬을 추가합니다.
- 프로젝트별 README 자동 생성 기능을 추가합니다.
- 저장소에 포함된 `render.yaml`/`fly.toml`을 사용해 실제 배포한 경우에만 도메인을 README에 첨부합니다. JSON 기록 보존은 영속 볼륨이나 외부 DB를 설정하고 재시작 후 다시 조회한 경우에만 완료로 표시합니다.
