# 이력서·지원서용 프로젝트 자료

이 문서는 Career Hub를 이력서, 자기소개서, 지원서, GitHub README에 사용할 때 고르는 문장 후보입니다. 실제 실행 명령·관찰 결과·해결한 오류·코드 위치가 있는 문장만 사용합니다.

## 한 줄 소개

React와 Express로 작성한 취업 워크북으로, 네 단계 준비도와 JWT 인증, 지원·프로젝트 CRUD, JSON 파일 저장소, 자동 검증 명령을 포함합니다.

## 이력서 프로젝트 항목

**Career Hub. Fullstack Portfolio Project**

- `src/App.jsx`의 `WorkbookSection`, `ApplicationSection`, `ProjectSection`으로 워크북과 두 CRUD 화면을 나누고, `getWorkbookSteps`로 네 단계 진행 조건을 표시했습니다.
- `server/index.js`의 `createApp`에 회원가입·로그인, 워크북, 지원, 프로젝트 라우트를 작성하고 `dashboardFor`에서 네 단계 준비도를 계산했습니다.
- `server/auth.js`에서 bcrypt work factor 10, HS256·2시간 JWT, Bearer 토큰 검증, 운영용 `JWT_SECRET` 검사를 적용했습니다.
- `server/data-store.js`의 `JsonStore`로 파일 저장 코드를 라우터와 분리했습니다. DB 교체는 다음 개선 항목으로 구분합니다.
- `npm run verify`에 format check, lint, build, Vitest·supertest, API smoke test, 제출 감사를 연결했습니다.

## 자기소개서 문장 예시

실제 학습·검증 기록이 있을 때 사용할 수 있는 예시입니다. HTML/CSS, JavaScript, React, Node.js, 데이터 저장, 로그인, 배포 개념을 Career Hub의 화면과 API에서 다시 확인했습니다. 특히 `scripts/api-smoke-test.js`로 가입, 로그인 실패·성공, 보호 API, 워크북, 지원·프로젝트 CRUD를 실행했습니다. 실제 오류를 고친 기록이 있다면 “`[오류 첫 줄]`을 확인하고 `[파일·코드]`를 수정해 `[재검증 명령]`을 통과시켰습니다” 형식으로 자기 경험을 채웁니다.

## 면접 1분 설명

Career Hub는 SI/SW 취업 준비자가 목표 직무와 주간 행동, 제출 자료, 지원 현황을 관리하는 fullstack 취업 워크북입니다. 프론트엔드는 React로 만들었고, 백엔드는 Express REST API로 구성했습니다. 회원가입과 로그인은 bcrypt 비밀번호 해시와 JWT 인증을 사용했고, 워크북과 지원 기록, 프로젝트는 로컬 또는 영속 볼륨의 JSON 파일 저장소에 보존됩니다. 1~7단계에서 학습한 HTML/CSS, JavaScript, React, API, 데이터 저장, 로그인, 배포 준비를 하나의 제출용 프로젝트로 연결한 것이 핵심입니다.

## 면접 질문과 답변 포인트

### Q. 이 프로젝트에서 1~7단계 학습이 어떻게 연결되나요?

1단계 HTML/CSS는 반응형 화면과 카드 UI에, 2단계 JavaScript는 입력 처리와 이벤트에, 3단계 React는 state와 컴포넌트 구조에 쓰였습니다. 4단계 Express API는 CRUD 서버로 확장했고, 5단계 데이터 저장은 JSON 저장소 계층으로 구현했습니다. 6단계 로그인은 bcrypt와 JWT 인증으로 적용했고, 7단계 배포 준비는 README, 환경 변수, 빌드, smoke test로 연결했습니다.

### Q. DB 대신 JSON 파일을 쓴 이유는 무엇인가요?

포트폴리오를 보는 사람이 별도 DB 없이 실행할 수 있도록 `server/data-store.js`의 `JsonStore`를 사용했습니다. 라우터가 구체 클래스를 사용하므로 MongoDB나 PostgreSQL로 옮길 때는 같은 CRUD 메서드 계약을 구현하고 생성 지점을 바꿔야 합니다.

파일 하나를 임시 파일로 쓴 뒤 rename하는 방식은 단일 프로세스의 손상 위험을 줄이지만 여러 서버의 전체 read-modify-write를 트랜잭션으로 만들지는 않습니다. 현재 배포는 단일 인스턴스를 전제로 설명하고, 확장 단계에서는 PostgreSQL 같은 DB의 트랜잭션과 제약으로 옮길 계획입니다.

### Q. 보안 관점에서 신경 쓴 부분은 무엇인가요?

`server/auth.js`에서 bcrypt work factor 10으로 비밀번호를 해시하고 HS256·2시간 JWT를 발급합니다. `requireAuth`는 `Authorization: Bearer` 토큰을 검증하고, `assertAuthConfig`는 운영에서 32자 이상의 비예제 `JWT_SECRET`을 요구합니다. `scripts/api-smoke-test.js`는 회원가입 응답에 `passwordHash`가 없는지도 확인합니다.

### Q. 검증은 어떻게 했나요?

`npm run verify`는 lint → format:check → build → test:unit → test:api → audit:submit을 실행합니다. smoke test는 데모 시드 없이 임시 데이터 파일에서 회원가입, 로그인 실패·성공, 워크북 저장, 보호 API, 지원·프로젝트 CRUD, 네 단계 준비도를 HTTP 요청으로 확인합니다.

## 지원서에 적기 좋은 기술 키워드

기본(이력서에 항상 적는 핵심).

- React 19, Vite, Component, State, Props, ErrorBoundary.
- Node.js, Express 5, REST API, HTTP Status Code.
- JWT, bcrypt, Authentication Middleware.
- CRUD, JSON File Store, Repository Layer.
- API Smoke Test, Build Verification, Environment Variables.

심화. 해당 파일을 직접 확인하고 명령을 실행한 경우에만 추가합니다.

- Docker(멀티 스테이지) + docker-compose + DevContainer.
- Vitest + supertest + React Testing Library (서버·프론트 단위/통합 테스트).
- ESLint(flat config) + Prettier + husky/lint-staged 프리커밋.
- helmet, express-rate-limit, body size limit, 명시적 CSP.
- pino + pino-http JSON 구조적 로깅, X-Request-Id 상관관계.
- 핸드라이팅 OpenAPI 3 스펙(`/api/openapi.json`).
- GitHub Actions CI(lint → test → build → 도커 스모크).
- 배포 매니페스트(Render.com Blueprint, fly.toml).
- SIGTERM/SIGINT 그레이스풀 셧다운.

## 제출 전 확인

```bash
npm install
npm run verify
npm run audit:submit
```

위 명령의 최신 통과 로그와 직접 수정한 코드 위치가 있을 때 “format, lint, build, 테스트, 제출 감사 명령을 포함한 fullstack 프로젝트”라고 적을 수 있습니다. 실제 배포를 하지 않았다면 배포 경험 대신 배포 매니페스트를 작성했다고 구분합니다.

## 참고 근거

- NCS 공정채용 안내는 채용에서 직무능력 중심 평가를 강조합니다. https://ncs.go.kr/company/ch03/CH-104-001-01.scdo
- OWASP Password Storage Cheat Sheet는 비밀번호 저장 시 안전한 해시 알고리즘 사용을 안내합니다. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
