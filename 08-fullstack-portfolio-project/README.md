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
- API smoke test와 Vitest 단위·통합 테스트(서버 + 프론트 jsdom).
- React ErrorBoundary로 화이트 스크린 방지.
- 명시적 CSP를 포함한 helmet, rate-limit, body size limit, CORS 등 기본 보안 미들웨어.
- SIGTERM/SIGINT 그레이스풀 셧다운(컨테이너/PM2 호환).
- pino + pino-http 기반 JSON 구조적 로깅과 X-Request-Id 상관관계 ID.
- 핸드라이팅 OpenAPI 3 스펙(`/api/openapi.json`)으로 자체 문서화.
- husky + lint-staged 프리커밋 훅으로 스테이지된 파일만 자동 정리.
- ESLint와 Prettier로 코드 품질 자동 검사.
- 멀티 스테이지 Dockerfile과 docker-compose.
- GitHub Actions로 lint → test → build → 도커 빌드까지 자동화.

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

이력서와 지원서에 바로 쓸 문장은 [resume-assets.md](./resume-assets.md)에 정리했습니다. 제출 전 점검 목록은 [submission-checklist.md](./submission-checklist.md)를 확인하세요.

## 기술 스택

- Frontend. React 19, Vite, lucide-react.
- Backend. Node.js, Express 5.
- Auth. bcryptjs, jsonwebtoken.
- Security. helmet, express-rate-limit, CORS.
- Storage. JSON file store.
- Quality. ESLint 9 (flat config), Prettier.
- Test. Vitest, supertest, API smoke test 스크립트.
- Container. 멀티 스테이지 Dockerfile + docker-compose.
- CI. GitHub Actions (lint, test, build, docker smoke).

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
npm run lint            # ESLint로 코드 스타일·잠재적 오류 검사
npm run format:check    # Prettier 포맷 검사
npm run test:unit       # Vitest 단위·통합 테스트 (서버/검증/저장소/API)
npm run test:api        # 실제 서버를 띄워 인증·CRUD 흐름 smoke test
npm run build           # Vite 프론트엔드 빌드
npm run audit:submit    # 제출 전 산출물 감사
npm run verify          # 위 항목을 한 번에 실행 (CI와 동일한 흐름)
```

`npm run verify`는 lint → build → test → 제출 감사 순서로 실행해 CI와 동일한 게이트를 로컬에서 재현합니다.

ZIP 파일로 직접 제출하기 전에는 생성 파일을 정리하세요.

```bash
npm run clean:generated
```

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `PORT` | Express API 포트입니다. 기본값은 5100입니다. |
| `CLIENT_ORIGIN` | API를 직접(프록시 없이) 호출할 때 허용할 프론트엔드 주소입니다. `npm run dev`의 Vite 프록시를 쓰면 보통 그대로 둬도 됩니다. |
| `JWT_SECRET` | JWT 서명에 사용하는 비밀값입니다. 배포 전 반드시 바꾸세요. |
| `DATA_FILE` | JSON 저장소 파일 경로입니다. |
| `SEED_DEMO` | `true`이면 첫 실행 시 데모 계정을 만듭니다. |

## Docker로 실행

로컬 Docker Desktop이 설치되어 있으면 컨테이너로도 띄울 수 있습니다.

### 운영(production) 컨테이너

```bash
docker compose up --build
# 브라우저에서 http://localhost:5100 접속 (정적 빌드 + API가 같은 포트)
```

멀티 스테이지 빌드라 최종 이미지에는 devDependencies와 소스가 거의 포함되지 않습니다. 컨테이너는 비루트 사용자로 실행되고 `/api/health`에 HEALTHCHECK가 걸려 있습니다.

배포 시에는 반드시 `JWT_SECRET` 환경변수를 안전한 값으로 교체하세요.

### 개발(dev) 컨테이너 — 핫리로드

소스를 컨테이너 안에 마운트해 핫리로드까지 가능한 버전입니다. Node를 로컬에 설치하지 않아도 동작합니다.

```bash
docker compose -f docker-compose.dev.yml up
# API:   http://localhost:5100
# Vite:  http://localhost:5173
```

루트의 `.devcontainer/devcontainer.json`을 쓰면 VS Code가 자동으로 이 환경에 붙고 ESLint·Prettier·Docker·Java 확장까지 한 번에 설치됩니다.

## CI

`.github/workflows/ci.yml`에서 main 푸시와 PR마다 다음 작업이 실행됩니다.

1. 워크북 구조 검증 (`npm run verify` at root).
2. Career Hub lint → 단위/통합 테스트 → 빌드 → API smoke test → 제출 감사.
3. Docker 이미지 빌드 후 컨테이너를 띄워 `/api/health` 확인.

## 배포

두 가지 매니페스트가 함께 들어 있습니다. 둘 다 무료 플랜으로 시작할 수 있습니다.

### Render.com

저장소 루트에 `render.yaml`이 있으므로 Render 대시보드에서 "New + Blueprint"로 자동 인식됩니다.

- `JWT_SECRET`은 Render가 자동 생성.
- `CLIENT_ORIGIN`은 배포 후 생긴 도메인을 대시보드에서 직접 입력.
- free 플랜은 idle 시 자동 sleep → 첫 요청에 cold start.

### fly.io

```bash
flyctl auth login
flyctl launch --no-deploy --copy-config       # 이 폴더의 fly.toml 사용
flyctl secrets set JWT_SECRET=$(openssl rand -hex 32)
flyctl volumes create career_hub_data --size 1 --region nrt
flyctl deploy
```

데이터는 `/data`에 마운트된 볼륨에 저장되어 재배포 후에도 보존됩니다. Tokyo(nrt) 리전이 한국 사용자에 가장 가깝습니다.

## API 문서

핸드라이팅 OpenAPI 3 스펙을 `server/openapi.json`에 두고 런타임에서도 노출합니다.

```bash
curl http://localhost:5100/api/openapi.json | jq
```

브라우저에서 시각화하려면 위 응답을 https://editor.swagger.io 의 좌측 패널에 붙여 넣으세요.

## 로깅과 추적

운영을 흉내내기 위해 pino + pino-http로 모든 요청을 JSON 로그로 남깁니다. 각 요청에는 `X-Request-Id`가 자동으로 부여되며 응답 헤더에도 그대로 echo됩니다. 외부에서 `X-Request-Id`를 보내면 그 값을 그대로 사용해 분산 추적(distributed tracing)을 흉내낼 수 있습니다.

```bash
curl -i -H "X-Request-Id: my-trace-1" http://localhost:5100/api/health
# < X-Request-Id: my-trace-1
```

로그는 비밀번호와 Authorization 헤더를 자동 마스킹합니다.

## 제출 시 제외할 파일

GitHub에 올릴 때는 `.gitignore`가 아래 파일을 제외합니다. ZIP으로 직접 제출한다면 `npm run clean:generated`를 먼저 실행하고, `node_modules`는 압축하지 마세요.

- `node_modules`
- `dist`
- `.env`
- `data/career-hub.json`

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

### React state로 로그인 상태, 지원 기록, 프로젝트 목록을 어떻게 관리했나요?

로그인 성공 후 사용자 정보와 토큰을 state에 저장하고, 지원 기록과 프로젝트 목록은 API 응답을 받아 state로 관리했습니다. state가 바뀌면 React가 화면을 다시 렌더링하므로 대시보드, 목록, 폼 상태가 같은 데이터 기준으로 갱신됩니다. 면접에서는 "화면은 state의 결과이고, API 응답으로 state를 갱신했다"고 말하면 됩니다.

### Express REST API와 HTTP 상태 코드를 어떻게 구분했나요?

리소스 조회는 `GET`, 생성은 `POST`, 수정은 `PATCH`, 삭제는 `DELETE`로 나누었습니다. 성공 생성은 201, 인증 실패는 401, 입력 검증 실패나 존재하지 않는 리소스는 400 계열, 서버 예외는 500 계열로 구분했습니다. 상태 코드를 구분하면 프론트엔드가 실패 원인을 사용자에게 더 정확히 보여줄 수 있습니다.

### bcrypt와 JWT 인증 흐름을 어떻게 설명하나요?

회원가입 때 비밀번호는 bcrypt로 해시해서 저장하고, 로그인 때 입력 비밀번호와 해시를 비교합니다. 검증이 성공하면 서버가 JWT를 발급하고, 클라이언트는 보호 API 요청마다 `Authorization` 헤더에 토큰을 담습니다. 서버는 JWT 서명을 확인해 요청자가 누구인지 판단합니다.

### 저장소 로직을 `server/data-store.js`로 분리한 이유는 무엇인가요?

파일 저장, MongoDB, PostgreSQL처럼 저장 방식은 바뀔 수 있지만 API의 핵심 흐름은 유지되어야 합니다. 저장소 로직을 분리하면 라우터와 비즈니스 로직이 특정 저장 방식에 강하게 묶이지 않습니다. 나중에 DB로 교체할 때 영향 범위를 줄이는 구조입니다.

### `scripts/api-smoke-test.js`로 무엇을 검증했나요?

smoke test는 인증, 생성, 조회, 수정, 삭제 같은 핵심 흐름이 최소한 동작하는지 빠르게 확인하는 테스트입니다. 배포 전이나 리팩터링 후 전체 기능이 크게 깨지지 않았는지 확인하는 안전장치 역할을 합니다. 면접에서는 "사용자가 반드시 거치는 경로를 자동으로 확인했다"고 설명하면 좋습니다.

### 학습 연결 탭과 `learning-map.md`는 어떤 의미인가요?

학습 단계가 단순 예제로 끝난 것이 아니라 실제 포트폴리오 앱의 기능으로 연결됐다는 근거입니다. 예를 들어 HTML/CSS는 UI 구조, JavaScript는 이벤트와 API 호출, Express는 REST API, 인증 단계는 JWT 로그인으로 연결됩니다. 이 자료를 통해 "무엇을 배웠고 어디에 적용했는지"를 면접관에게 빠르게 설명할 수 있습니다.

## 다음 개선 아이디어

- JSON 저장소를 MongoDB 또는 PostgreSQL로 교체.
- 지원 기록 검색과 필터 추가.
- 프로젝트별 README 생성 기능 추가.
- 배포 후 스크린샷과 배포 URL 추가.
