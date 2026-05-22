# Note Hub — 모노레포 미니 앱

DevContainer(가상환경)에서 동작하는 풀스택 TypeScript 모노레포 데모입니다. 8번 Career Hub와 독립된 별도 프로그램으로, 모노레포의 핵심 가치(공유 타입, 단일 의존성 그래프, 한 줄 실행)와 실서비스 스택(Postgres + Docker + 자동화 테스트)을 동시에 보여줍니다.

## 무엇을 보여주는가

- **공유 타입**: `@note-hub/shared`의 `Note`, `CreateNoteInput`, `ApiRoutes`를 API와 Web이 그대로 import. 백엔드 응답 모양이 바뀌면 프론트엔드 컴파일이 즉시 실패합니다.
- **npm workspaces**: 별도 도구(turbo, nx, pnpm) 없이 Node에 내장된 기능만으로 모노레포 구성.
- **저장소 추상화**: `NotesStore` 인터페이스 한 개에 InMemory와 PostgreSQL 두 구현. `DATABASE_URL` 환경변수 유무로 자동 전환.
- **단일 실행**: `npm run dev` 한 줄로 API(5200)와 Web(5174)이 동시에 뜹니다.
- **자동화 테스트**: Vitest로 shared/api/web 3개 환경 단위·통합 테스트가 한 번에 실행됩니다.
- **컨테이너 배포**: 멀티 스테이지 Dockerfile + Postgres compose로 단일 이미지 운영 배포.

## 구조

```
monorepo-mini-app/
├── package.json                  # workspaces + 공통 스크립트
├── tsconfig.base.json            # 공통 TS 설정
├── vitest.config.ts              # shared/api/web 3 projects
├── Dockerfile                    # 멀티 스테이지: build → runtime
├── docker-compose.yml            # 운영: Postgres + 단일 app 이미지
├── docker-compose.dev.yml        # 개발: Postgres만 컨테이너
└── packages/
    ├── shared/                   # 도메인 타입 + API 경로 상수
    │   └── src/{index.ts, index.test.ts}
    ├── api/                      # Express 5 + TS, 포트 5200
    │   ├── db/init.sql           # Postgres 초기 스키마
    │   └── src/
    │       ├── server.ts         # createApp + 정적 서빙
    │       ├── notes-store.ts    # 인터페이스 + InMemory 구현 + 검증
    │       ├── notes-store-pg.ts # PostgreSQL 구현
    │       ├── notes-store.test.ts
    │       └── server.test.ts    # supertest 통합 테스트
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
npm run build -w @note-hub/shared   # 1회 (다른 패키지가 dist를 import)
npm run dev                          # API(5200) + Web(5174) 동시
# http://localhost:5174 접속
```

### B. Postgres 백엔드로 실행 (실서비스에 더 가까움)

```bash
cd monorepo-mini-app
docker compose -f docker-compose.dev.yml up -d   # Postgres만 컨테이너로
npm install
npm run build -w @note-hub/shared
DATABASE_URL=postgres://notehub:notehub@localhost:5432/notehub npm run dev
```

서버 콘솔에 `[notes] using PostgresNotesStore`가 나오면 Postgres에 연결된 것입니다.

### C. 운영 모드(단일 이미지 + Postgres)

```bash
cd monorepo-mini-app
docker compose up --build
# http://localhost:5200 접속 (API와 정적 web이 같은 포트)
```

## 테스트와 품질

```bash
npm test                       # shared + api + web 모두 실행
npm run test:watch             # watch 모드
npm test -w @note-hub/api      # 특정 패키지만
npm run lint                   # ESLint (typescript-eslint + react)
npm run lint:fix               # 자동 수정
npm run format:check           # Prettier 포맷 검사
npm run typecheck              # 전 패키지 tsc --noEmit
npm run prepare                # husky 활성화 (1회)
```

`.husky/pre-commit`이 lint-staged를 실행해 스테이지된 파일만 ESLint + Prettier로 자동 정리합니다.

## API 요약

| Method | Path | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 헬스 체크 (DB 핑 포함, 실패 시 503) |
| `GET` | `/api/openapi.json` | OpenAPI 3 스펙 |
| `GET` | `/api/notes` | 노트 목록 (최신순) |
| `POST` | `/api/notes` | 노트 생성 (`{ title, body, tags? }`) |
| `DELETE` | `/api/notes/:id` | 노트 삭제 |

## API 문서

핸드라이팅 OpenAPI 3 스펙을 `packages/api/openapi.json`에 두고 런타임에서도 노출합니다.

```bash
curl http://localhost:5200/api/openapi.json | jq
```

브라우저에서 시각화하려면 위 응답을 https://editor.swagger.io 의 좌측 패널에 붙여 넣으세요.

## 배포

### Render.com (권장 — Postgres 함께 무료)

`render.yaml`에 web 서비스와 Postgres 데이터베이스가 함께 정의되어 있습니다. Render 대시보드에서 "New + Blueprint"로 자동 인식되며 `DATABASE_URL`은 자동으로 web 서비스에 주입됩니다.

Render 무료 Postgres는 90일 후 만료되므로 시연 후엔 백업이 필요합니다.

### fly.io

```bash
flyctl auth login
flyctl postgres create --name note-hub-db --region nrt
flyctl launch --no-deploy --copy-config
flyctl postgres attach --app note-hub note-hub-db    # DATABASE_URL 자동 주입
flyctl deploy
# 최초 1회는 psql로 packages/api/db/init.sql 실행 필요
```

## 환경변수

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `PORT` | `5200` | Express API 포트 |
| `DATABASE_URL` | (없음) | 설정되면 Postgres, 없으면 인메모리 |
| `POSTGRES_PASSWORD` | `notehub` | docker-compose.yml의 Postgres 비밀번호 |

## 면접에서 설명할 포인트

- **프론트와 백엔드 타입 동기화**: `@note-hub/shared`에서 단일 정의, 양쪽이 import. JSON 모양 어긋남이 런타임이 아니라 컴파일에서 잡힘.
- **monorepo 도구 선택 기준**: 패키지 수 5개 미만이고 캐시가 필요 없으면 npm workspaces로 충분. 빌드 의존 그래프가 복잡해지면 turbo 도입.
- **저장소 추상화**: `NotesStore` 인터페이스 한 개를 InMemory(테스트·개발)와 Postgres(운영) 둘이 구현. 테스트에서는 supertest로 InMemory 주입.
- **단일 이미지 배포**: Dockerfile 런타임 스테이지가 API + web/dist를 함께 담아 `node server.js` 하나로 둘 다 제공. 정적 자산 호스트가 따로 필요 없음.
- **DB 헬스체크**: `/api/health`가 `store.ping()`까지 호출해 DB가 죽으면 503. 컨테이너 오케스트레이터가 자동으로 재시작 트리거할 수 있음.

## 8번 Career Hub와 비교

| 항목 | 08 Career Hub | monorepo-mini-app |
| --- | --- | --- |
| 구조 | 단일 패키지 | npm workspaces (3 패키지) |
| 언어 | JavaScript (ESM) | TypeScript strict |
| 저장소 | JSON 파일 | InMemory 또는 PostgreSQL |
| 테스트 | smoke + Vitest 단위/통합 | Vitest(shared+api+web) + supertest + RTL |
| 컨테이너 | 멀티 스테이지 | 멀티 스테이지 + Postgres compose |
| 목적 | 1~7단계 통합 + 제출 | 모노레포·공유 타입·DB 추상화 시연 |
| 포트 | API 5100 / Web 5173 | API 5200 / Web 5174 |
