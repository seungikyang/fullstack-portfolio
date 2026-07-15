# 1~7단계와 Career Hub 연결표

Career Hub는 기존 `01-html-css`부터 `07-project-deploy`까지의 학습 결과를 하나의 제출용 fullstack 프로젝트로 합친 결과물입니다.

## 전체 연결 요약

| 학습 단계 | 기존 폴더              | Career Hub에서 쓰인 위치                                                                                                                                | 포트폴리오 설명 문장                                                                                  |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1단계     | `01-html-css`          | 로그인 화면, 사이드바, 대시보드, 카드 목록                                                                                                              | HTML 구조와 CSS grid/flexbox로 반응형 관리 화면을 구현했습니다.                                       |
| 2단계     | `02-javascript-basics` | 입력 폼, 버튼 이벤트, 배열 목록 렌더링                                                                                                                  | 사용자 입력을 읽고 이벤트에 따라 API 요청과 화면 갱신을 처리했습니다.                                 |
| 3단계     | `03-react-todo`        | `src/App.jsx` 전체 React UI                                                                                                                             | React state와 props로 로그인 상태, 지원 기록, 프로젝트 목록을 관리했습니다.                           |
| 4단계     | `04-node-board-api`    | `server/index.js` REST API                                                                                                                              | Express로 지원 현황과 프로젝트 CRUD API를 구현했습니다.                                               |
| 5단계     | `05-database-mongodb`  | `server/data-store.js` 저장소 계층                                                                                                                      | 데이터 생성, 조회, 수정, 삭제 흐름을 저장소 계층으로 분리했습니다.                                    |
| 6단계     | `06-login-auth`        | `server/auth.js` 인증 로직                                                                                                                              | bcrypt 비밀번호 해시와 JWT 인증으로 보호 API를 만들었습니다.                                          |
| 7단계     | `07-project-deploy`    | `README.md`, `.env.example`, `npm run build`, `npm run start`, `Dockerfile`, `docker-compose.yml`, `render.yaml`/`fly.toml`, `.github/workflows/ci.yml` | 빌드·실행 방법을 문서화하고 컨테이너 + CI + 배포 매니페스트까지 갖춘 배포 가능한 형태로 구성했습니다. |

## 파일별 연결 근거

### `src/App.jsx`

- 1단계에서 배운 화면 구조를 React 컴포넌트 구조로 확장했습니다.
- 2단계에서 배운 이벤트 처리와 배열 렌더링을 `map`, `onSubmit`, `onClick`으로 사용했습니다.
- 3단계에서 배운 state와 props를 취업 워크북, 지원 현황, 프로젝트 화면 전체에 적용했습니다.

### `server/index.js`

- 4단계 게시판 API에서 배운 REST API 패턴을 취업 워크북, 지원 현황, 프로젝트 관리 도메인으로 확장했습니다.
- `GET`, `POST`, `PATCH`, `DELETE`를 기능별로 분리했습니다.
- API 오류 상황에 맞게 `400`, `401`, `404`, `409` 상태 코드를 반환합니다.

### `server/data-store.js`

- 5단계에서 배운 데이터 저장과 CRUD 개념을 JSON 파일 저장소로 구현했습니다.
- 현재는 별도 DB 설치 없이 실행되지만, 저장소 계층이 분리되어 MongoDB나 PostgreSQL로 교체하기 쉽습니다.

### `server/auth.js`

- 6단계 로그인 실습의 비밀번호 해시와 JWT 인증을 실제 프로젝트에 적용했습니다.
- 로그인하지 않은 사용자는 `/api/workbook`, `/api/applications`, `/api/projects`, `/api/dashboard`에 접근할 수 없습니다.

### `scripts/api-smoke-test.js`

- 7단계 배포 준비에서 필요한 검증 습관을 자동화했습니다.
- 회원가입, 로그인, 워크북 저장, 보호 API, 지원 기록 CRUD, 프로젝트 CRUD를 한 번에 확인합니다.

## 면접 답변 예시

이 프로젝트는 1~7단계에서 따로 배운 기능을 하나로 합친 취업 준비용 fullstack 앱입니다. 처음에는 HTML/CSS와 JavaScript로 화면과 이벤트를 익혔고, React로 컴포넌트를 나눠 상태를 관리했습니다. 백엔드는 Express로 REST API를 만들었고, 데이터 저장소를 분리해 DB로 확장할 수 있게 했습니다. 로그인은 bcrypt와 JWT로 구현했고, API smoke test로 핵심 기능을 검증했습니다.

## 다음 확장 방향

- `server/data-store.js`를 MongoDB 또는 PostgreSQL 모델로 교체합니다. (저장소 추상화의 PostgreSQL 구현 사례는 같은 저장소 안의 [monorepo-mini-app](../monorepo-mini-app/)에서 확인할 수 있습니다 — `NotesStore` 인터페이스 + `InMemoryNotesStore`/`PostgresNotesStore` 두 구현을 환경변수로 전환.)
- 지원 현황에 검색, 필터, 정렬을 추가합니다.
- 프로젝트별 README 자동 생성 기능을 추가합니다.
- 저장소에 포함된 `render.yaml`/`fly.toml`을 사용해 실제 배포 후 도메인을 README에 첨부합니다.
