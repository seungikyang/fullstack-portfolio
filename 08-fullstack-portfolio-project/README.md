# Career Hub Fullstack Portfolio

[HTML 목차](../index.html) · [학습 연결](./learning-map.md) · [제출 점검](./submission-checklist.md) · [이력서·면접 근거](./resume-assets.md) · [다음 단계](../09-typescript/README.md)

SI/SW 취업 준비자가 목표 설정부터 포트폴리오, 지원, 면접 준비까지 기록하는 fullstack 취업 워크북입니다.

React 화면, Express API, JWT 인증, CRUD, JSON 파일 저장소, 자동 검증을 한 저장소에서 실행하고 설명하는 포트폴리오 후보입니다. 실제 제출 전에는 아래 검증 명령과 [제출 체크리스트](./submission-checklist.md)를 직접 확인해야 합니다.

## 주요 기능

- 회원가입과 로그인.
- JWT 기반 보호 API.
- 목표 직무, 목표 지원일, 주간 목표, 다음 행동, 회고를 저장하는 취업 워크북.
- 사용자별 워크북 저장 이력: 변경 시점의 전체 내용을 최신 100건까지 보관.
- 목표 설정, 이번 주 실행, 제출 자료, 실제 지원·설명의 네 단계를 집계하는 취업 준비도.
- 지원 현황 CRUD.
- 회사·직무·기술 스택·메모·연락처 검색과 상태·우선순위 필터.
- 포트폴리오 프로젝트 CRUD.
- 저장한 프로젝트 정보로 README Markdown 미리보기와 파일 다운로드.
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

## 기록 찾기와 저장 이력, README 생성

- **지원 현황:** 회사·직무·기술 스택·메모·연락처에서 검색합니다. 앞뒤 공백과 영문 대소문자를 무시하며, 상태와 우선순위 필터를 함께 적용할 수 있습니다. 검색 결과 건수와 전체 건수를 구분하고, `검색·필터 초기화`로 전체 목록을 다시 표시합니다. 대시보드 지표는 전체 기록 기준입니다.
- **취업 워크북:** 처음 저장하거나 입력값을 변경해 저장하면 저장 시점의 전체 워크북을 남깁니다. 화면 아래 `워크북 저장 이력`에서 날짜를 펼쳐 이전 목표·행동·회고·준비 상태를 확인합니다. 같은 값의 재저장은 이력을 추가하지 않으며, 사용자별 최신 100건을 보관합니다. 기존 JSON 파일도 사용할 수 있지만 이 기능 도입 전의 과거 이력은 복원하지 않습니다.
- **프로젝트:** 카드의 `README 생성`을 누르면 저장한 프로젝트 이름·소개·상태·스택·강조할 경험·링크로 Markdown을 만듭니다. 미리보기에서 내용을 복사하거나 `README 파일 다운로드`로 저장합니다. 실행 명령이나 테스트 결과는 자동으로 작성하지 않으므로 제출 전에 직접 보완합니다.

구현 위치: [App.jsx](./src/App.jsx)의 `ApplicationSection`, `WorkbookSection`, `ProjectSection`, [data-store.js](./server/data-store.js)의 `updateWorkbook`·`getWorkbookHistory`, [project-readme.js](./src/project-readme.js)의 `generateProjectReadme`입니다. 이력 조회는 인증된 계정의 기록만 반환합니다.

## 1~7단계와의 연결

이 프로젝트는 기존 학습 폴더의 결과를 하나로 통합한 포트폴리오입니다.

- `01-html-css`는 화면 구조, 반응형 레이아웃, 카드 UI에 쓰였습니다.
- `02-javascript-basics`는 함수, 조건문, 폼 이벤트, 버튼 클릭, 배열 렌더링에 쓰였습니다.
- `03-react-todo`는 React state, props, 컴포넌트 분리에 쓰였습니다.
- `04-node-board-api`는 Express REST API와 HTTP 상태 코드 처리에 쓰였습니다.
- `05-database-mongodb`의 영속화·CRUD 개념을 JSON 파일 저장소에서 다시 확인했습니다. MongoDB를 직접 사용한 프로젝트는 아닙니다.
- `06-login-auth`는 bcrypt 비밀번호 해시와 JWT 보호 API에 쓰였습니다.
- `07-project-deploy`는 프론트엔드와 API 연결, 빌드, 실행 문서, 환경 변수, 배포 설정에 쓰였습니다.

자세한 연결표는 [learning-map.md](./learning-map.md)에 정리했습니다.

이력서와 지원서의 초안 후보는 [resume-assets.md](./resume-assets.md)에 정리했습니다. 실제 실행 로그가 있는 문장만 골라 사용하고, 제출 전에는 [submission-checklist.md](./submission-checklist.md)를 확인하세요.

## 기술 스택

- Frontend. React 19, Vite, lucide-react.
- Backend. Node.js, Express 5.
- Auth. bcryptjs, jsonwebtoken.
- Security. helmet, express-rate-limit, CORS.
- Storage. JSON file store.
- Quality. ESLint 10 (flat config), Prettier.
- Test. Vitest, supertest, API smoke test 스크립트.
- Container. 멀티 스테이지 Dockerfile + docker-compose.
- CI. GitHub Actions (lint, test, build, docker smoke).

### 기술을 쓰는 이유와 동작 흐름

처음에는 화면을 만드는 기술과 요청을 처리하는 기술부터 읽으세요. [처음 읽는 기술 안내서](../technology-guide.md)에는 용어 설명과 지원 기록 저장 과정을 단계별로 정리했습니다.

| 기술                         | 왜 사용하는가                                                        | 이 코드에서 어떻게 동작하는가                                                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React / CSS                  | 입력값, 목록, 선택한 메뉴를 화면에 일관되게 반영합니다.              | [App.jsx](./src/App.jsx)의 state(화면 상태)가 바뀌면 컴포넌트가 화면을 다시 계산합니다. [styles.css](./src/styles.css)는 화면 너비에 맞춰 열과 간격을 조정합니다.                                  |
| Vite                         | 개발 중 화면 코드를 제공하고 배포용 파일을 만듭니다.                 | [vite.config.js](./vite.config.js)는 기본 개발 환경에서 3000번의 `/api` 요청을 5100번 서버로 전달합니다. 빌드하면 `dist`에 브라우저용 파일을 만듭니다.                                             |
| Node.js / Express            | 브라우저 밖에서 요청을 검사하고 데이터를 저장합니다.                 | Node.js가 [server/index.js](./server/index.js)를 실행합니다. Express는 메서드와 경로에 맞는 처리 함수로 요청을 연결합니다.                                                                         |
| bcryptjs / JWT               | 비밀번호 원문을 저장하지 않고 로그인 이후의 사용자를 확인합니다.     | [auth.js](./server/auth.js)에서 비밀번호 해시를 생성·비교하고, 서명·만료를 확인할 토큰을 발급·검증합니다. JWT 내용 자체를 암호화하는 방식은 아닙니다.                                              |
| 입력 검증 / JsonStore        | 잘못된 데이터를 막고 서버 재시작 뒤에도 기록을 읽습니다.             | [validators.js](./server/validators.js)가 입력을 검사한 뒤 [data-store.js](./server/data-store.js)가 사용자 id와 함께 JSON 파일에 저장합니다. 별도 DB 설치 없이 실행하기 위한 구성입니다.          |
| helmet / CORS / rate-limit   | 브라우저 보안 정책, 다른 출처의 요청, 과도한 요청을 각각 처리합니다. | [서버 미들웨어](./server/index.js)가 보안 헤더를 붙이고 허용 출처를 검사하며 요청 횟수를 제한합니다. CORS는 로그인 확인을 대신하지 않습니다.                                                       |
| pino / pino-http             | 오류가 어느 요청에서 생겼는지 찾습니다.                              | [서버](./server/index.js)가 요청 id와 처리 기록을 JSON 형태의 로그로 남깁니다.                                                                                                                     |
| OpenAPI / Vitest / supertest | API 약속을 읽고 실제 응답이 기대와 맞는지 확인합니다.                | [openapi.json](./server/openapi.json)은 요청·응답 명세이고, [api.test.js](./server/api.test.js)는 요청을 보내 상태·응답을 검사합니다. 명세 파일을 작성하는 것만으로 서버 동작이 바뀌지는 않습니다. |

**지원 기록 한 건의 처리 순서:** `ApplicationSection` 입력 → `request`의 `POST /api/applications` → `requireUser`의 토큰·사용자 확인(`requireAuth` 서명 검사 + 저장소 사용자 대조) → `validateApplication`의 입력 검사 → `JsonStore.createApplication`의 파일 저장 → `201` 응답 → `reload`와 `loadAll`의 최신 데이터 조회 → state 갱신입니다.

**직접 확인하기:** 아래 실행 방법으로 앱을 켜고 본인 계정에 로그인한 뒤, 브라우저 개발자 도구의 Network 탭을 열어 지원 기록 한 건을 저장합니다. 생성 요청의 `201` 응답과 뒤따르는 목록 조회를 확인하고 새로고침해 보세요. 입력 칸의 state와 서버 저장 파일이 각각 어떤 역할을 했는지 설명하면 됩니다. [학습 연결표](./learning-map.md)에서 같은 개념을 배운 1~7단계로 돌아갈 수 있습니다.

## 필요 환경

- **Node.js 24.19 LTS 이상**. Vite 8 요구 사항을 충족하는 저장소 표준 버전입니다.
- 확인. `node --version`

## 실행 방법

```bash
cd 08-fullstack-portfolio-project
npm install
cp .env.example .env
# Windows cmd:        copy .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

`npm run dev`는 API 서버(`http://localhost:5100`)와 프론트엔드(`http://localhost:3000`)를 함께 실행합니다. 브라우저에서 **`http://localhost:3000`** 을 엽니다.

프론트엔드 포트는 항상 3000번으로 고정됩니다. 실행 전에 3000번을 사용 중인 수신 프로세스가 있으면 자동으로 종료하며, 직접 정리하려면 `npm run dev:stop`을 실행합니다. 종료 권한이 없으면 3001번으로 이동하지 않고 오류를 표시한 뒤 중단합니다.

프론트엔드는 API 주소를 따로 적지 않고 같은 주소로 `/api` 요청을 보냅니다. 개발 중에는 Vite가 그 요청을 자동으로 API 서버(5100)로 전달(proxy)하므로 CORS 설정을 신경 쓰지 않아도 됩니다. 이는 7단계에서 배운 "같은 서버면 `API_BASE`를 빈 문자열로 둔다"와 같은 원리입니다.

기본값인 `SEED_DEMO=false`에서는 데모 사용자를 만들지 않습니다. 기본 흐름에서는 회원가입으로 자기 계정을 먼저 만드세요. 데모가 필요하면 데이터 파일에 사용자가 없는 상태에서 `.env`의 `SEED_DEMO=true`와 `VITE_SHOW_DEMO=true`를 함께 명시하고 서버를 다시 시작합니다.

데모 시드를 명시적으로 켰을 때만 아래 계정을 사용할 수 있습니다.

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
npm run verify          # 위 자동화 범위를 묶은 로컬 통합 검증
```

`npm run verify`는 lint → format:check → build → test:unit → test:api → audit:submit 순서로 실행합니다. 현재 자동화된 범위의 통과를 뜻하며 실제 배포, 접근성, 모든 브라우저 동작까지 보증하지는 않습니다.

## 단계 완료 근거

[루트 체크리스트의 4종 근거](../student-checklist.md#단계마다-남길-4종-근거)에 다음 내용을 남깁니다.

- 실행 명령. 개발 서버와 `npm run verify` 명령.
- 관찰 결과. 3000번 화면, 5100번 API 응답, 검증 로그.
- 해결한 오류. 실제 오류 메시지와 한 가지 수정.
- 코드 위치. 직접 바꾼 파일과 함수.

ZIP 파일로 직접 제출하기 전에는 생성 파일을 정리하세요.

```bash
npm run clean:generated
```

## 환경 변수

| 이름             | 설명                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`           | Express API 포트입니다. 기본값은 5100입니다.                                                                                                      |
| `CLIENT_ORIGIN`  | API를 직접(프록시 없이) 호출할 때 허용할 프론트엔드 주소입니다. `npm run dev`의 Vite 프록시를 쓰면 보통 그대로 둬도 됩니다.                       |
| `JWT_SECRET`     | JWT 서명 비밀값입니다. 로컬 개발은 기본값을 쓸 수 있지만, `NODE_ENV=production`에서는 예제값이 아닌 32자 이상 값이 없으면 서버 시작을 거부합니다. |
| `DATA_FILE`      | JSON 저장소 파일 경로입니다.                                                                                                                      |
| `APP_TIME_ZONE`  | 대시보드가 '오늘'과 7일 내 마감을 계산할 지역입니다. 기본값은 `Asia/Seoul`이며, 잘못된 이름이면 서버 시작 시 오류가 납니다.                       |
| `SEED_DEMO`      | 기본값은 `false`입니다. `true`이고 저장소에 사용자가 없을 때만 데모 계정을 만듭니다.                                                              |
| `VITE_SHOW_DEMO` | 로그인 화면에 데모 이메일·비밀번호 안내를 표시할 때만 `true`로 둡니다. 서버의 데모 사용자 생성 여부는 `SEED_DEMO`가 별도로 결정합니다.            |

고급 실행 변수로 `LOG_LEVEL`은 서버 로그 수준, `VITE_API_URL`은 Vite에서 직접 호출할 API 주소, `SKIP_DEV_PORT_CLEANUP`은 개발 compose에서 호스트 3000번 정리를 건너뛸 때 사용합니다. 기본 실행에서는 변경할 필요가 없습니다.

## Docker로 실행

로컬 Docker Desktop이 설치되어 있으면 컨테이너로도 띄울 수 있습니다.

### 운영(production) 컨테이너

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
# 브라우저에서 http://localhost:5100 접속 (정적 빌드 + API가 같은 포트)
```

PowerShell이나 Windows cmd에서는 먼저 `.env`의 `JWT_SECRET`에 32자 이상의 임의값을 넣은 뒤 `docker compose up --build`를 실행합니다. `docker-compose.yml`은 값이 없으면 시작을 거부하며 데모 시드는 기본 비활성입니다.

멀티 스테이지 빌드라 최종 이미지에는 devDependencies와 소스가 거의 포함되지 않습니다. 컨테이너는 비루트 사용자로 실행되고 `/api/health`에 HEALTHCHECK가 걸려 있습니다.

운영 실행에는 예제값이 아닌 32자 이상의 `JWT_SECRET`이 필수입니다. `server/auth.js`의 `assertAuthConfig`가 이 조건을 검사합니다.

### 개발(dev) 컨테이너 — 핫리로드

소스를 컨테이너 안에 마운트해 핫리로드까지 가능한 버전입니다. Node를 로컬에 설치하지 않아도 동작합니다.

```bash
docker compose -f docker-compose.dev.yml up
# API:   http://localhost:5100
# Vite:  http://localhost:3000
```

개발 compose는 실습 편의를 위해 `SEED_DEMO=true`와 `VITE_SHOW_DEMO=true`를 명시한 예외입니다. 운영 compose, Render, fly.io는 데모 시드가 기본 비활성입니다.

루트의 `.devcontainer/devcontainer.json`을 쓰면 VS Code가 자동으로 이 환경에 붙고 ESLint·Prettier·Docker·Java 확장까지 한 번에 설치됩니다.

## CI

루트 `.github/workflows/ci.yml`에서 main 푸시와 PR마다 다음 Career Hub 관련 작업이 실행됩니다. 같은 워크플로의 Note Hub 잡은 별도 프로그램을 검증합니다.

1. 루트 워크북 구조 검증 (`npm run verify:structure`와 같은 `npm run verify`).
2. Career Hub format check, lint, 단위·통합 테스트, 빌드, API smoke test, 제출 감사.
3. Docker 이미지 빌드 후 컨테이너를 띄워 `/api/health` 확인.

## 배포

두 가지 매니페스트가 함께 들어 있습니다. 저장 방식이 JSON 파일이므로 제출용 배포는 영속 볼륨이 있는 환경을 사용하고, 무료 Render는 화면 시연용으로만 구분합니다.

### Render.com

저장소 루트에 `render.yaml`이 있으므로 Render 대시보드에서 "New + Blueprint"로 자동 인식됩니다.

- `JWT_SECRET`은 Render가 자동 생성.
- free 플랜은 idle 시 자동 sleep → 첫 요청에 cold start.
- free 서비스의 파일시스템은 임시이므로 재시작·재배포 뒤 계정과 취업 기록이 사라질 수 있습니다. [Render Persistent Disks 안내](https://render.com/docs/disks)를 확인하고, 데이터 보존이 필요한 제출 링크에는 persistent disk 또는 외부 DB를 사용하세요.
- 프론트와 API를 다른 도메인으로 나눈 경우에만 `CLIENT_ORIGIN`에 프론트 주소를 설정합니다. 기본 단일 컨테이너 배포는 같은 주소를 사용합니다.

### fly.io

```bash
flyctl auth login
flyctl launch --no-deploy --copy-config       # 이 폴더의 fly.toml 사용
flyctl secrets set JWT_SECRET=$(openssl rand -hex 32)
flyctl volumes create career_hub_data --size 1 --region nrt
flyctl deploy
```

데이터는 `/data`에 마운트된 볼륨에 저장되어 재배포 후에도 보존됩니다. Tokyo(nrt) 리전이 한국 사용자에 가장 가깝습니다.

배포 링크를 제출하기 전에는 회원가입 → 워크북 저장 → 앱 재시작 → 재로그인 후 같은 기록 조회를 직접 확인합니다. 이 검증 전에는 “운영 데이터 보존”이 아니라 “배포 매니페스트 작성”으로만 설명합니다.

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

| Method   | Path                    | 설명                |
| -------- | ----------------------- | ------------------- |
| `GET`    | `/api/health`           | 서버 상태 확인      |
| `GET`    | `/api/openapi.json`     | OpenAPI 명세 조회   |
| `POST`   | `/api/auth/register`    | 회원가입            |
| `POST`   | `/api/auth/login`       | 로그인              |
| `GET`    | `/api/me`               | 내 정보 조회        |
| `GET`    | `/api/dashboard`        | 대시보드 지표       |
| `GET`    | `/api/workbook`         | 취업 워크북 조회    |
| `PATCH`  | `/api/workbook`         | 취업 워크북 저장    |
| `GET`    | `/api/workbook/history` | 내 워크북 저장 이력 |
| `GET`    | `/api/applications`     | 지원 현황 목록      |
| `POST`   | `/api/applications`     | 지원 현황 추가      |
| `PATCH`  | `/api/applications/:id` | 지원 현황 수정      |
| `DELETE` | `/api/applications/:id` | 지원 현황 삭제      |
| `GET`    | `/api/projects`         | 프로젝트 목록       |
| `POST`   | `/api/projects`         | 프로젝트 추가       |
| `PATCH`  | `/api/projects/:id`     | 프로젝트 수정       |
| `DELETE` | `/api/projects/:id`     | 프로젝트 삭제       |

## 면접에서 설명할 포인트

<!-- written-choice:start -->

4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### R08-01. 취업 준비도를 어떤 기준으로 계산했나요?

취업 준비도를 어떤 기준으로 계산했나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 로그인만 하면 준비도가 항상 100%다.
2. 지원 기록 수가 곧 준비도 백분율이다.
3. 프로젝트 한 개를 생성하면 네 단계가 모두 완료된다.
4. 목표·행동·제출 준비·면접/지원 진행의 네 조건 묶음을 각각 한 단계로 집계한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

server/index.js의 dashboardFor와 src/App.jsx의 getWorkbookSteps는 목표 직무·지원일, 주간 목표·다음 행동, 제출 체크·완료 프로젝트, 면접 체크·진행 지원 기록을 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W196)

### R08-02. React state로 로그인 상태, 지원 기록, 프로젝트 목록을 어떻게 관리했나요?

React state로 로그인 상태, 지원 기록, 프로젝트 목록을 어떻게 관리했나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. App이 사용자·토큰·워크북·목록을 state로 관리하고 자식에 데이터와 갱신 함수를 props로 전달한다.
2. 자식 컴포넌트가 서버 JSON 파일을 브라우저에서 직접 연다.
3. React state에 값을 넣으면 서버 저장도 자동 완료된다.
4. props를 변경하면 부모의 state를 직접 수정해도 된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

src/App.jsx에서 App과 각 Section의 역할을 나눕니다. API 응답을 받은 뒤 state를 갱신하는 흐름과 서버의 영속 저장은 별개입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W197)

### R08-03. Express REST API와 HTTP 상태 코드를 어떻게 구분했나요?

Express REST API와 HTTP 상태 코드를 어떻게 구분했나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 모든 API는 GET으로 데이터를 수정한다.
2. GET 조회·POST 생성·PATCH 수정·DELETE 삭제로 나누고 생성 201, 인증 실패 401 등으로 응답한다.
3. 입력 오류·인증 실패·서버 오류를 모두 200으로 응답한다.
4. 없는 리소스는 언제나 생성 성공 201로 응답한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

server/index.js에서 리소스와 작업에 맞는 HTTP 메서드와 상태 코드를 사용합니다. 클라이언트는 성공 여부와 오류 원인을 구분합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W198)

### R08-04. bcrypt와 JWT 인증 흐름을 어떻게 설명하나요?

bcrypt와 JWT 인증 흐름을 어떻게 설명하나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 비밀번호 원문을 JWT payload에 넣어 보호한다.
2. JWT 서명은 클라이언트에서만 검사하고 서버는 건너뛴다.
3. bcrypt cost 10으로 해시하고 HS256·2시간 JWT를 발급하며 Bearer 토큰을 검증한다.
4. 운영 JWT_SECRET은 예제 값이어도 항상 허용된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

server/auth.js의 hashPassword, signToken, requireAuth를 연결하고, server/index.js의 requireUser가 서명이 맞는 토큰이라도 저장소에 같은 번호·이메일의 사용자가 있을 때만 통과시킵니다. assertAuthConfig는 운영에서 32자 이상의 비예제 JWT_SECRET을 요구합니다. 해시 비용과 정책은 실제 코드 기준입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W199)

### R08-05. 저장소 로직을 `server/data-store.js`로 분리한 이유는 무엇인가요?

저장소 로직을 `server/data-store.js`로 분리한 이유는 무엇인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. JSON 파일을 쓰면 어떤 동시성·운영 문제도 없어진다.
2. 저장소를 바꾸려면 CSS만 수정하면 된다.
3. JsonStore는 이미 PostgreSQL을 운영한다는 증거이다.
4. JsonStore로 저장 책임을 나누고 실제 DB 요구와 계약에 맞춰 구현을 교체할 수 있다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

현재 구현과 교체 계획을 구분합니다. 저장소 인터페이스와 API 계약·회귀 테스트를 함께 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W200)

### R08-06. `scripts/api-smoke-test.js`로 무엇을 검증했나요?

`scripts/api-smoke-test.js`로 무엇을 검증했나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 데모 시드 없는 임시 저장소에서 가입·로그인·워크북·준비도·지원/프로젝트 CRUD를 HTTP로 확인한다.
2. 화면 색상만 검사하고 HTTP 요청은 보내지 않는다.
3. 실제 운영 계정과 저장 파일을 반드시 초기화한다.
4. 스크립트가 있다는 사실만으로 실행 통과를 증명한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

scripts/api-smoke-test.js는 임시 데이터 파일과 SEED_DEMO=false를 사용합니다. 검증 경험은 실제 통과 로그가 있을 때 설명합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W201)

### R08-07. 학습 연결 탭과 `learning-map.md`는 어떤 의미인가요?

학습 연결 탭과 `learning-map.md`는 어떤 의미인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 모든 학습 단계가 Career Hub에서 MongoDB로만 구현됐다.
2. React 상태·Express API·인증·저장·배포의 코드 위치를 학습 개념과 연결한다.
3. Career Hub의 모든 서버는 Java로 작성됐다.
4. 실제 코드 없이 기술 이름만 나열하면 연결이 증명된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

learning-map과 실제 소스를 함께 확인합니다. Career Hub는 JSON 파일 저장소를 사용합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W202)

<!-- written-choice:end -->

## 다음 개선 아이디어

- JSON 저장소를 MongoDB 또는 PostgreSQL로 교체.
- 워크북 저장 이력의 기간별 조회와 지원 기록 마감일 정렬.
- 배포 후 스크린샷과 배포 URL 추가.
