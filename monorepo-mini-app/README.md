# Note Hub — 모노레포 미니 앱

DevContainer(가상환경)에서 동작하는 풀스택 TypeScript 모노레포 데모입니다. 8번 Career Hub와 독립된 별도 프로그램으로, 모노레포의 핵심 가치(공유 타입, 단일 의존성 그래프, 한 줄 실행)와 실서비스 스택(Postgres + Docker + 자동화 테스트)을 동시에 보여줍니다.

## 무엇을 보여주는가

- **공유 타입**: `@note-hub/shared`의 `Note`, `CreateNoteInput`, `ApiRoutes`를 API와 Web이 그대로 import. 백엔드 응답 모양이 바뀌면 프론트엔드 컴파일이 즉시 실패합니다.
- **npm workspaces**: 별도 도구(turbo, nx, pnpm) 없이 Node에 내장된 기능만으로 모노레포 구성.
- **저장소 추상화**: `NotesStore` 인터페이스 한 개에 InMemory와 PostgreSQL 두 구현. `DATABASE_URL` 환경변수 유무로 자동 전환.
- **단일 실행**: `npm run dev` 한 줄로 API(5200)와 Web(5174)이 동시에 뜹니다.
- **자동화 테스트**: Vitest로 shared/api/web 3개 환경 단위·통합 테스트가 한 번에 실행됩니다.
- **컨테이너 배포**: 멀티 스테이지 Dockerfile + Postgres compose로 단일 이미지 운영 배포.
- **운영 접근 제어**: 운영에서는 32자 이상의 `NOTE_HUB_ACCESS_TOKEN`을 필수로 검사하고 노트 API에 Bearer 인증을 적용합니다.

## 구조

```
monorepo-mini-app/
├── package.json                  # workspaces + 공통 스크립트
├── tsconfig.base.json            # 공통 TS 설정
├── vitest.config.ts              # shared/api/web 3 projects
├── eslint.config.js              # typescript-eslint + React (패키지별 분리)
├── Dockerfile                    # 멀티 스테이지: build → runtime
├── docker-compose.yml            # 운영: Postgres + 단일 app 이미지
├── docker-compose.dev.yml        # 개발: Postgres만 컨테이너
├── render.yaml                   # Render.com Blueprint (web + Postgres)
├── fly.toml                      # fly.io 설정
└── packages/
    ├── shared/                   # 도메인 타입 + API 경로 상수
    │   └── src/{index.ts, index.test.ts}
    ├── api/                      # Express 5 + TS, 포트 5200
    │   ├── db/init.sql           # Postgres 초기 스키마
    │   ├── openapi.json          # 핸드라이팅 OpenAPI 3 스펙
    │   └── src/
    │       ├── server.ts         # createApp + 정적 서빙
    │       ├── notes-store.ts    # 인터페이스 + InMemory 구현 + 검증
    │       ├── notes-store-pg.ts # PostgreSQL 구현
    │       ├── notes-store.test.ts
    │       ├── server.test.ts    # supertest 통합 테스트
    │       └── openapi-sync.test.ts  # OpenAPI ↔ shared 타입 동기화 검증
    └── web/                      # Vite + React 19 + TS, 포트 5174
        ├── vite.config.ts        # /api → 5200 프록시
        └── src/
            ├── {main.tsx, App.tsx, styles.css}
            ├── App.test.tsx      # RTL 스모크
            └── test/setup.ts
```

## 실행

### A. 가장 빠른 흐름 — 인메모리 (DB 불필요)

```bash
cd monorepo-mini-app
npm install
npm run dev                          # predev가 shared를 빌드한 뒤 API(5200) + Web(5174) 동시 실행
# http://localhost:5174 접속
```

토큰을 설정하지 않은 개발 모드는 학습 편의를 위한 **로컬 전용 무인증 모드**입니다. 인터넷에 공개하지 마세요. 토큰을 시험하려면 `NOTE_HUB_ACCESS_TOKEN=local-test-token-with-at-least-32-characters npm run dev`로 실행하고 화면의 “API 접근 토큰”에 같은 값을 입력합니다.

### B. Postgres 백엔드로 실행 (실서비스에 더 가까움)

```bash
cd monorepo-mini-app
docker compose -f docker-compose.dev.yml up -d   # Postgres만 컨테이너로
npm install
DATABASE_URL=postgres://notehub:notehub@localhost:5432/notehub npm run dev
```

서버 콘솔에 `[notes] using PostgresNotesStore`가 나오면 Postgres에 연결된 것입니다.

### C. 운영 모드(단일 이미지 + Postgres)

```bash
cd monorepo-mini-app
export NOTE_HUB_ACCESS_TOKEN="$(openssl rand -hex 32)"
docker compose up --build
# http://localhost:5200 접속 (API와 정적 web이 같은 포트)
```

운영 모드는 토큰이 없거나 32자보다 짧으면 서버 시작을 거부합니다. 화면에서 같은 토큰을 연결하면 현재 탭의 `sessionStorage`에만 보관하고 모든 노트 요청에 `Authorization: Bearer` 헤더를 붙입니다.

## 테스트와 품질

```bash
npm test                       # pretest 훅이 @note-hub/shared를 먼저 빌드한 뒤 shared+api+web 모두 실행
npm run test:watch             # watch 모드 (역시 pretest:watch가 shared를 먼저 빌드)
npm test -w @note-hub/api      # 특정 패키지만 (이때는 shared 빌드를 수동으로: npm run build -w @note-hub/shared)
npm run lint                   # ESLint (typescript-eslint + react)
npm run lint:fix               # 자동 수정
npm run format:check           # Prettier 포맷 검사
npm run typecheck              # 전 패키지 tsc --noEmit
npm run prepare                # husky 활성화 (1회)
```

`api/src/server.test.ts`와 `openapi-sync.test.ts`는 `@note-hub/shared`의 `ApiRoutes` 런타임 값을 import 하므로 shared가 먼저 빌드되어 있어야 합니다. 루트 `pretest` 훅이 이를 자동으로 처리합니다.

`.husky/pre-commit`이 lint-staged를 실행해 스테이지된 파일만 ESLint + Prettier로 자동 정리합니다.

루트 GitHub Actions는 `npm ci` 후 format·lint·typecheck·41개 테스트·build를 실행하고, Linux Docker 잡에서는 접근 토큰을 포함한 Postgres 노트 생성·조회 smoke를 확인합니다. 로컬 테스트 수와 CI 정의는 실제 실행 시점에 다시 확인한 뒤 지원 자료에 사용합니다.

## API 요약

| Method   | Path                | 설명                                       |
| -------- | ------------------- | ------------------------------------------ |
| `GET`    | `/api/health`       | 헬스 체크 (DB 스키마·핑 포함, 실패 시 503) |
| `GET`    | `/api/openapi.json` | OpenAPI 3 스펙                             |
| `GET`    | `/api/notes`        | 노트 목록 (최신순, 운영 Bearer 필요)       |
| `POST`   | `/api/notes`        | 노트 생성 (운영 Bearer 필요)               |
| `DELETE` | `/api/notes/:id`    | 노트 삭제 (운영 Bearer 필요)               |

노트 입력은 제목 120자, 본문 10,000자, 태그 20개, 태그당 50자로 제한됩니다. `tags`는 문자열 배열만 허용하며 잘못된 JSON은 400, 100KB 초과 본문은 413으로 응답합니다.

## API 문서

핸드라이팅 OpenAPI 3 스펙을 `packages/api/openapi.json`에 두고 런타임에서도 노출합니다.

```bash
curl http://localhost:5200/api/openapi.json | jq
```

브라우저에서 시각화하려면 위 응답을 https://editor.swagger.io 의 좌측 패널에 붙여 넣으세요.

## 배포

### Render.com (권장 — Postgres 함께 무료)

`render.yaml`에 web 서비스와 Postgres 데이터베이스가 함께 정의되어 있습니다. 이 파일은 모노레포 하위에 있으므로 Render 대시보드에서 "New + Blueprint"를 선택한 뒤 Blueprint Path에 `monorepo-mini-app/render.yaml`을 입력합니다. 서비스의 `rootDir`도 같은 폴더로 고정되어 Dockerfile과 build context를 그 위치에서 찾습니다.

`DATABASE_URL`은 web 서비스에 자동 주입되고, 앱이 Postgres를 처음 사용할 때 `notes` 테이블과 인덱스를 멱등하게 준비합니다. `NOTE_HUB_ACCESS_TOKEN`은 `sync: false`라 대시보드에서 32자 이상의 임의값을 직접 입력해야 합니다.

Render 무료 Postgres는 90일 후 만료되므로 시연 후엔 백업이 필요합니다.

### fly.io

```bash
flyctl auth login
flyctl postgres create --name note-hub-db --region nrt
flyctl launch --no-deploy --copy-config
flyctl postgres attach --app note-hub note-hub-db    # DATABASE_URL 자동 주입
flyctl secrets set NOTE_HUB_ACCESS_TOKEN="$(openssl rand -hex 32)"
flyctl deploy
# 앱이 시작된 뒤 첫 DB 확인에서 notes 테이블과 인덱스를 자동 준비
```

## 환경변수

| 이름                    | 기본값                  | 설명                                                         |
| ----------------------- | ----------------------- | ------------------------------------------------------------ |
| `PORT`                  | `5200`                  | Express API 포트                                             |
| `DATABASE_URL`          | (없음)                  | 설정되면 Postgres, 없으면 인메모리                           |
| `CLIENT_ORIGIN`         | `http://localhost:5174` | 별도 프론트 개발 서버에서 허용할 CORS Origin                 |
| `NOTE_HUB_ACCESS_TOKEN` | (없음)                  | 설정 시 노트 API Bearer 인증 사용, 운영에서는 32자 이상 필수 |
| `POSTGRES_PASSWORD`     | `notehub`               | docker-compose.yml의 Postgres 비밀번호                       |

## 면접에서 설명할 포인트

### 프론트와 백엔드 타입 동기화는 어떤 장점이 있나요?

`@note-hub/shared`에 `Note`, `CreateNoteInput`, `ApiRoutes` 같은 타입을 한 번 정의하고 API와 Web이 함께 import합니다. 백엔드 응답 구조가 바뀌면 프론트엔드 타입 체크가 실패하므로 런타임 오류 전에 문제를 발견할 수 있습니다. 면접에서는 "계약을 문서가 아니라 코드 타입으로 공유했다"고 설명하면 좋습니다.

### monorepo 도구 선택 기준은 무엇인가요?

패키지 수가 적고 빌드 그래프가 단순하면 npm workspaces만으로 충분합니다. 패키지가 많아지고 캐시, 병렬 빌드, 변경 영향 분석이 중요해지면 Turborepo나 Nx 같은 도구를 검토합니다. 처음부터 무거운 도구를 넣기보다 문제 규모에 맞춰 선택하는 것이 합리적입니다.

### 저장소 추상화는 왜 했나요?

`NotesStore` 인터페이스를 두고 InMemory와 PostgreSQL 구현을 분리하면 API 라우터는 저장 방식에 덜 의존합니다. 테스트에서는 빠른 InMemory 구현을 주입하고, 운영에서는 Postgres 구현을 사용할 수 있습니다. 이 구조는 저장소 교체와 테스트 격리를 쉽게 만듭니다.

### 단일 이미지 배포는 어떤 의미인가요?

Dockerfile의 빌드 단계에서 web을 정적 파일로 만들고, 런타임 단계에는 API 서버와 web/dist를 함께 담습니다. 운영에서는 `node server.js` 하나로 API와 정적 웹을 같은 포트에서 제공합니다. 작은 서비스에서는 배포 단위가 단순해지고 프론트 서버를 따로 운영하지 않아도 되는 장점이 있습니다.

### DB 헬스체크는 왜 필요한가요?

서버 프로세스가 살아 있어도 DB 연결이 끊기거나 필수 테이블이 없으면 실제 서비스는 정상 동작하지 않을 수 있습니다. PostgreSQL 저장소는 첫 사용 전에 스키마를 멱등하게 준비하고 `/api/health`에서 `store.ping()`까지 확인합니다. 컨테이너 환경에서는 헬스체크 실패를 기준으로 재시작이나 트래픽 제외를 자동화할 수 있습니다.

## 8번 Career Hub와 비교

| 항목     | 08 Career Hub            | monorepo-mini-app                        |
| -------- | ------------------------ | ---------------------------------------- |
| 구조     | 단일 패키지              | npm workspaces (3 패키지)                |
| 언어     | JavaScript (ESM)         | TypeScript strict                        |
| 저장소   | JSON 파일                | InMemory 또는 PostgreSQL                 |
| 테스트   | smoke + Vitest 단위/통합 | Vitest(shared+api+web) + supertest + RTL |
| 컨테이너 | 멀티 스테이지            | 멀티 스테이지 + Postgres compose         |
| 목적     | 1~7단계 통합 + 제출      | 모노레포·공유 타입·DB 추상화 시연        |
| 포트     | API 5100 / Web 3000      | API 5200 / Web 5174                      |
