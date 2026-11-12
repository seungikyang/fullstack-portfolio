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

<!-- written-choice:start -->

4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### RA-01. Q. 이 프로젝트에서 1~7단계 학습이 어떻게 연결되나요?

Q. 이 프로젝트에서 1~7단계 학습이 어떻게 연결되나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. React 상태·Express API·인증·저장·배포의 코드 위치를 학습 개념과 연결한다.
2. 모든 학습 단계가 Career Hub에서 MongoDB로만 구현됐다.
3. Career Hub의 모든 서버는 Java로 작성됐다.
4. 실제 코드 없이 기술 이름만 나열하면 연결이 증명된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

learning-map과 실제 소스를 함께 확인합니다. Career Hub는 JSON 파일 저장소를 사용합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W253)

### RA-02. Q. DB 대신 JSON 파일을 쓴 이유는 무엇인가요?

Q. DB 대신 JSON 파일을 쓴 이유는 무엇인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 파일 rename 한 번으로 여러 서버의 모든 동시 수정도 직렬화된다.
2. 별도 DB 없이 실행할 수 있는 JSON 저장소를 쓰고, 다중 서버 확장 시 DB 트랜잭션과 제약 도입을 검토한다.
3. JSON 파일은 트랜잭션 DB와 모든 동시성 보장이 같다.
4. 저장소 파일만 바꾸면 라우터와 생성 지점은 검토할 필요가 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

server/data-store.js의 JsonStore와 server/index.js의 생성 지점을 함께 봅니다. 임시 파일 rename은 파일 교체를 돕지만 여러 서버의 read-modify-write 전체를 잠그지는 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W254)

### RA-03. Q. 보안 관점에서 신경 쓴 부분은 무엇인가요?

Q. 보안 관점에서 신경 쓴 부분은 무엇인가요?

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

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W255)

### RA-04. Q. 검증은 어떻게 했나요?

Q. 검증은 어떻게 했나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. npm run dev만 실행하면 모든 회귀 테스트가 통과한 것이다.
2. npm install은 외부 배포 성공까지 검사한다.
3. npm run verify는 사용자 대신 모든 학습 빈칸을 채운다.
4. npm run verify는 lint·포맷·빌드·테스트·제출 감사를 묶는다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

package.json의 실행 명령과 실제 로그를 함께 근거로 사용합니다. 검증 성공은 자동화된 범위에 한정됩니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W256)

<!-- written-choice:end -->

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
