# Note Hub — 모노레포 미니 앱

DevContainer(가상환경)에서 동작하는 풀스택 TypeScript 모노레포 데모입니다. 8번 Career Hub와 독립된 별도 프로그램으로, 모노레포의 핵심 가치(공유 타입, 단일 의존성 그래프, 한 줄 실행)와 실서비스 스택(Postgres + Docker + 자동화 테스트)을 동시에 보여줍니다.

## 무엇을 보여주는가

### 기술을 쓰는 이유와 동작 흐름

화면·API·저장소가 낯설면 [처음 읽는 기술 안내서](../technology-guide.md)를 먼저 읽으세요. 이 앱의 모노레포는 여러 패키지의 코드를 한 저장소에서 함께 관리한다는 뜻입니다.

| 기술                    | 왜 들어가는가                                                            | 코드에서 어떻게 동작하는가                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| npm workspaces          | 화면·서버·공통 코드의 의존성과 실행 명령을 함께 관리합니다.              | [package.json](./package.json)이 세 패키지를 등록하고 개발 실행 전에 shared를 먼저 빌드합니다.                                                                                                                                       |
| TypeScript / shared     | 노트의 데이터 모양과 API 경로를 여러 곳에서 중복 정의하는 일을 줄입니다. | [shared/src/index.ts](./packages/shared/src/index.ts)의 타입은 개발 중 검사에, `ApiRoutes`와 `normalizeTags`는 실행 중 공통 규칙에 쓰입니다. 외부 요청값은 서버의 `validateCreate`로 따로 검사합니다.                                |
| React / Express         | 사용자의 입력과 서버의 처리를 나눕니다.                                  | [웹 App.tsx](./packages/web/src/App.tsx)가 노트 생성 요청을 보내고 [API server.ts](./packages/api/src/server.ts)가 검사·저장 후 응답합니다.                                                                                          |
| NotesStore / PostgreSQL | DB 없이 빠르게 시작하고, 나중에 영속 저장을 비교해 봅니다.               | [notes-store.ts](./packages/api/src/notes-store.ts)는 저장소가 제공할 메서드를 정의합니다. 서버의 `createStore`가 `DATABASE_URL`이 있으면 [PostgresNotesStore](./packages/api/src/notes-store-pg.ts), 없으면 메모리 구현을 고릅니다. |
| Docker / Dev Container  | DB나 개발 도구를 정해진 환경에서 실행합니다.                             | [개발 Compose 설정](./docker-compose.dev.yml)은 PostgreSQL을 실행합니다. Dev Container는 편집기가 컨테이너 안의 개발 환경에 연결되도록 돕습니다.                                                                                     |

**노트 생성 흐름:** 화면 입력 → shared의 태그 정리 함수 → `POST /api/notes` → 설정된 접근 제어와 `validateCreate` 검사 → 선택한 저장소의 `create` → 응답 → 화면 목록 갱신입니다. shared 타입을 가져오는 것만으로 네트워크 데이터의 유효성이 확인되지는 않습니다.

**직접 확인하기:** 아래 A 방식으로 본인의 연습 노트를 만든 뒤 API 서버를 껐다 켜고 목록을 다시 읽어보세요. 메모리 저장은 서버 프로세스가 끝나면 사라집니다. B 방식에서는 서버 로그의 저장소 이름과 재시작 뒤 목록을 비교해, 실행 중인 변수와 DB 저장의 차이를 확인합니다.

### 이 앱에서 확인할 구성

- **공유 타입**: `@note-hub/shared`의 `Note`, `CreateNoteInput`, `ApiRoutes`를 API와 Web이 그대로 import. 백엔드 응답 모양이 바뀌면 프론트엔드 컴파일이 즉시 실패합니다.
- **npm workspaces**: 별도 도구(turbo, nx, pnpm) 없이 Node에 내장된 기능만으로 모노레포 구성.
- **저장소 추상화**: `NotesStore` 인터페이스 한 개에 InMemory와 PostgreSQL 두 구현. `DATABASE_URL` 환경변수 유무로 자동 전환.
- **단일 실행**: `npm run dev` 한 줄로 API(5200)와 Web(5174)이 동시에 뜹니다.
- **자동화 테스트**: Vitest로 shared/api/web 3개 환경 단위·통합 테스트가 한 번에 실행됩니다.
- **컨테이너 배포**: 멀티 스테이지 Dockerfile + PostgreSQL 18 compose로 단일 이미지 운영 배포.
- **운영 접근 제어**: 운영에서는 32자 이상의 `NOTE_HUB_ACCESS_TOKEN`을 필수로 검사하고 노트 API에 Bearer 인증을 적용합니다.

## 구조

```
monorepo-mini-app/
├── package.json                  # workspaces + 공통 스크립트
├── tsconfig.base.json            # 공통 TS 설정
├── vitest.config.ts              # shared/api/web 3 projects
├── eslint.config.js              # typescript-eslint + React Hooks (패키지별 분리)
├── Dockerfile                    # 멀티 스테이지: build → runtime
├── docker-compose.yml            # 운영: PostgreSQL 18 + 단일 app 이미지
├── docker-compose.dev.yml        # 개발: PostgreSQL 18만 컨테이너
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

### B. PostgreSQL 18 백엔드로 실행 (실서비스에 더 가까움)

```bash
cd monorepo-mini-app
docker compose -f docker-compose.dev.yml up -d   # Postgres만 컨테이너로
npm install
DATABASE_URL=postgres://notehub:notehub@localhost:5432/notehub npm run dev
```

서버 콘솔에 `[notes] using PostgresNotesStore`가 나오면 Postgres에 연결된 것입니다.

PostgreSQL 17에서 올린 기존 로컬 볼륨은 자동 변환하지 않습니다. Compose는 기존 데이터를 보존하기 위해 새 `note-hub-pg18-data` 볼륨을 사용하므로, 이전 데이터가 필요하면 PostgreSQL 공식 `pg_dump`/`pg_restore` 절차로 옮기세요.

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
npm run build -w @note-hub/shared && npx vitest run --project api  # API 테스트만
npm run lint                   # ESLint (typescript-eslint + React Hooks)
npm run lint:fix               # 자동 수정
npm run format:check           # Prettier 포맷 검사
npm run typecheck              # 전 패키지 tsc --noEmit
npm run prepare                # husky 활성화 (1회)
```

`api/src/server.test.ts`와 `openapi-sync.test.ts`는 `@note-hub/shared`의 `ApiRoutes` 런타임 값을 import 하므로 shared가 먼저 빌드되어 있어야 합니다. 루트 `pretest` 훅이 이를 자동으로 처리합니다.

`.husky/pre-commit`이 lint-staged를 실행해 스테이지된 파일만 ESLint + Prettier로 자동 정리합니다.

루트 GitHub Actions는 `npm ci` 후 format·lint·typecheck·43개 테스트·build를 실행하고, Linux Docker 잡에서는 접근 토큰을 포함한 PostgreSQL 18 노트 생성·조회 smoke를 확인합니다. 로컬 테스트 수와 CI 정의는 실제 실행 시점에 다시 확인한 뒤 지원 자료에 사용합니다.

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

<!-- written-choice:start -->

4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### RM-01. 프론트와 백엔드 타입 동기화는 어떤 장점이 있나요?

프론트와 백엔드 타입 동기화는 어떤 장점이 있나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 타입 공유는 네트워크 오류를 모두 제거한다.
2. 타입이 있으면 서버의 입력 검사도 자동 완료된다.
3. 공유 타입은 컴파일에 영향을 줄 수 없다.
4. API와 Web의 정적 계약 불일치를 줄이지만 외부 JSON의 런타임 검증은 별도로 필요하다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

TypeScript 타입은 실행 전에 검사됩니다. 실제 응답 값이 타입을 따른다는 보장은 검증으로 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W248)

### RM-02. monorepo 도구 선택 기준은 무엇인가요?

monorepo 도구 선택 기준은 무엇인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 공유 코드·패키지 수·빌드 그래프·캐시·변경 영향 관리 요구에 맞춰 도구를 선택한다.
2. 모노레포에는 npm workspaces를 사용할 수 없다.
3. 패키지가 두 개여도 반드시 모든 빌드 도구를 함께 설치한다.
4. 캐시 도구를 쓰면 의존성 그래프를 확인할 필요가 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

작은 구조에서는 npm workspaces로 시작할 수 있습니다. 추가 도구는 캐시·빌드 범위 등 실제로 해결해야 할 요구가 있을 때 검토합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W249)

### RM-03. 저장소 추상화는 왜 했나요?

저장소 추상화는 왜 했나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 두 구현을 두면 데이터가 항상 양쪽에 동시에 저장된다.
2. 공통 계약으로 메모리와 PostgreSQL 저장 방식을 교체하고 비교한다.
3. DATABASE_URL이 없어도 PostgreSQL에 반드시 연결된다.
4. 인터페이스만 선언하면 DB가 자동으로 설치된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

저장소 선택은 서버 설정과 구현에 따릅니다. 공통 메서드 계약과 영속성 차이를 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W250)

### RM-04. 단일 이미지 배포는 어떤 의미인가요?

단일 이미지 배포는 어떤 의미인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 개발용 Vite 서버 세 개를 운영에서 반드시 동시에 실행한다.
2. API와 Web은 항상 별도 저장소로 분리해야 한다.
3. 빌드한 Web 정적 파일과 API 런타임을 한 이미지에 담아 같은 서버·포트로 제공한다.
4. 단일 이미지이면 DB까지 무조건 이미지 내부 파일로 저장한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

monorepo-mini-app/Dockerfile의 런타임은 API와 web/dist를 함께 담습니다. 별도 DB 서비스와 프론트/API의 개발 실행 구조는 구분합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W251)

### RM-05. DB 헬스체크는 왜 필요한가요?

DB 헬스체크는 왜 필요한가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 프로세스가 있으면 DB 연결과 테이블도 항상 정상이다.
2. 헬스체크는 회원의 비밀번호 원문을 반환해야 한다.
3. DB 헬스체크가 성공하면 모든 업무 쿼리의 정확성이 증명된다.
4. 프로세스 생존뿐 아니라 store.ping()으로 저장소 사용 가능 여부를 확인한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

Note Hub의 /api/health는 저장소 상태를 확인합니다. PostgreSQL 스키마 준비와 ping 성공은 기본 가용성 근거이며 업무 기능 검증은 별도로 필요합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W252)

<!-- written-choice:end -->

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
