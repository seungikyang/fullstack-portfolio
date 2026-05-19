# Career Hub Fullstack Portfolio

SI/SW 취업 준비자가 지원 현황과 포트폴리오 프로젝트를 관리하는 fullstack 미니 프로젝트입니다.

이 프로젝트는 단순 예제가 아니라 GitHub 포트폴리오에 올리고 면접에서 설명할 수 있도록 만들었습니다. React 화면, Express API, JWT 인증, CRUD, JSON 파일 영속 저장, smoke test를 포함합니다.

## 주요 기능

- 회원가입과 로그인.
- JWT 기반 보호 API.
- 지원 현황 CRUD.
- 포트폴리오 프로젝트 CRUD.
- 1~7단계 학습 내용이 실제 프로젝트에 쓰인 위치를 보여주는 학습 연결 탭.
- 대시보드 지표.
- JSON 파일 저장소를 통한 데이터 보존.
- API smoke test.

## 1~7단계와의 연결

이 프로젝트는 기존 학습 폴더의 결과를 하나로 통합한 포트폴리오입니다.

- `01-html-css`는 화면 구조, 반응형 레이아웃, 카드 UI에 쓰였습니다.
- `02-javascript-basics`는 폼 이벤트, 버튼 클릭, 배열 렌더링, API 호출 흐름에 쓰였습니다.
- `03-react-todo`는 React state, props, 컴포넌트 분리에 쓰였습니다.
- `04-node-board-api`는 Express REST API와 HTTP 상태 코드 처리에 쓰였습니다.
- `05-database-mongodb`는 저장소 계층과 CRUD 데이터 흐름 설계에 쓰였습니다.
- `06-login-auth`는 bcrypt 비밀번호 해시와 JWT 보호 API에 쓰였습니다.
- `07-project-deploy`는 빌드, 실행 문서, 환경 변수, 검증 스크립트에 쓰였습니다.

자세한 연결표는 [learning-map.md](./learning-map.md)에 정리했습니다.

## 기술 스택

- Frontend. React 19, Vite, lucide-react.
- Backend. Node.js, Express 5.
- Auth. bcryptjs, jsonwebtoken.
- Storage. JSON file store.
- Verification. Vite build, API smoke test.

## 필요 환경

- **Node.js 20.19 이상 또는 22.12 이상** (Vite 8 요구 사항). 권장은 LTS인 22.12+ 입니다.
- 확인. `node --version`

## 실행 방법

```bash
cd 08-fullstack-portfolio-project
npm install
cp .env.example .env
npm run dev
```

`npm run dev`는 API 서버(`http://localhost:5100`)와 프론트엔드(`http://localhost:5173`)를 함께 실행합니다. 브라우저에서 **`http://localhost:5173`** 을 엽니다.

프론트엔드는 API 주소를 따로 적지 않고 같은 주소로 `/api` 요청을 보냅니다. 개발 중에는 Vite가 그 요청을 자동으로 API 서버(5100)로 전달(proxy)하므로 CORS 설정을 신경 쓰지 않아도 됩니다. 이는 7단계에서 배운 "같은 서버면 `API_BASE`를 빈 문자열로 둔다"와 같은 원리입니다.

데모 계정입니다.

```text
email: demo@careerhub.dev
password: demo1234
```

## 검증 방법

```bash
npm run build
npm run test:api
npm run verify
```

`npm run verify`는 프론트엔드 빌드와 API smoke test를 함께 실행합니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `PORT` | Express API 포트입니다. 기본값은 5100입니다. |
| `CLIENT_ORIGIN` | API를 직접(프록시 없이) 호출할 때 허용할 프론트엔드 주소입니다. `npm run dev`의 Vite 프록시를 쓰면 보통 그대로 둬도 됩니다. |
| `JWT_SECRET` | JWT 서명에 사용하는 비밀값입니다. 배포 전 반드시 바꾸세요. |
| `DATA_FILE` | JSON 저장소 파일 경로입니다. |
| `SEED_DEMO` | `true`이면 첫 실행 시 데모 계정을 만듭니다. |

## API 요약

| Method | Path | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 서버 상태 확인 |
| `POST` | `/api/auth/register` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 |
| `GET` | `/api/me` | 내 정보 조회 |
| `GET` | `/api/dashboard` | 대시보드 지표 |
| `GET` | `/api/applications` | 지원 현황 목록 |
| `POST` | `/api/applications` | 지원 현황 추가 |
| `PATCH` | `/api/applications/:id` | 지원 현황 수정 |
| `DELETE` | `/api/applications/:id` | 지원 현황 삭제 |
| `GET` | `/api/projects` | 프로젝트 목록 |
| `POST` | `/api/projects` | 프로젝트 추가 |
| `PATCH` | `/api/projects/:id` | 프로젝트 수정 |
| `DELETE` | `/api/projects/:id` | 프로젝트 삭제 |

## 면접에서 설명할 포인트

- React state로 로그인 상태, 지원 기록, 프로젝트 목록을 관리했습니다.
- Express에서 REST API를 만들고 HTTP 상태 코드를 구분했습니다.
- 비밀번호는 bcrypt로 해시하고 JWT로 보호 API를 만들었습니다.
- 저장소 로직을 `server/data-store.js`로 분리해 나중에 DB로 바꾸기 쉽게 했습니다.
- `scripts/api-smoke-test.js`로 인증과 CRUD 핵심 흐름을 자동 검증했습니다.
- 앱의 학습 연결 탭과 `learning-map.md`로 1~7단계가 Career Hub에 어떻게 통합됐는지 설명할 수 있습니다.

## 다음 개선 아이디어

- JSON 저장소를 MongoDB 또는 PostgreSQL로 교체.
- 지원 기록 검색과 필터 추가.
- 프로젝트별 README 생성 기능 추가.
- 배포 후 스크린샷과 배포 URL 추가.
