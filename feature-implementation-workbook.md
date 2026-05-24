# 기능 구현 TODO/빈칸 워크북

이 문서는 `01-html-css`부터 `17-interview-prep`, 그리고 `monorepo-mini-app`까지 모든 기능 구현을 공부용 TODO/빈칸 형태로 다시 점검하기 위한 워크북입니다.

목표는 정답을 빨리 보는 것이 아니라, 각 기능을 "왜 필요한가", "어느 파일에서 구현되는가", "어떻게 검증하는가", "면접에서 어떻게 설명하는가"까지 자기 손으로 채우는 것입니다.

## 사용 방법

1. 각 단계의 `README.md`를 읽고 이 워크북의 빈칸을 먼저 채웁니다.
2. `problems.md`와 실제 코드의 `TODO`, `____`, `빈칸`을 직접 해결합니다.
3. 실행 결과를 확인한 뒤 검증 명령 또는 캡처 근거를 적습니다.
4. 막히면 `answers.md`를 보되, 답을 본 이유와 다시 설명할 문장을 남깁니다.
5. 마지막에는 각 단계마다 "내가 구현한 기능 한 문장"을 작성합니다.

완벽하게 정리됐는지 판단하는 기준은 네 가지입니다.

- 개념. 이 기능이 왜 필요한지 설명할 수 있다.
- 구현. 어느 파일의 어느 흐름을 고쳐야 하는지 안다.
- 검증. 브라우저, API 요청, 테스트, 빌드 중 하나로 확인했다.
- 설명. 면접에서 자기 코드 기준으로 1분 안에 말할 수 있다.

## 01 HTML/CSS 자기소개 페이지

관련 파일: `01-html-css/starter/index.html`, `01-html-css/starter/styles.css`

### 개념 빈칸

- HTML에서 페이지의 의미 구조를 만드는 태그를 ____ 태그라고 한다.
- 한 페이지의 핵심 제목은 보통 `<____>` 태그로 작성한다.
- 이미지에는 접근성을 위해 `____` 속성을 반드시 작성한다.
- Flexbox는 한 방향 배치에 강하고, Grid는 ____ 배치에 강하다.
- 모바일 화면에서 가로 배치를 세로로 바꾸려면 media query 안에서 `flex-direction: ____`을 사용한다.

### 구현 TODO

- [ ] `<title>`과 `<h1>`에 자기 이름을 넣는다.
- [ ] 관심 분야와 성장 목표 문장을 자기 말로 채운다.
- [ ] 프로필 이미지 `src`와 `alt`를 의미 있게 채운다.
- [ ] 연락 링크의 `mailto:` 주소를 채운다.
- [ ] CSS의 `font-family`, `display: flex`, `display: grid`, hover 배경색을 채운다.
- [ ] 모바일 media query에서 세로 배치를 적용한다.

### 검증 빈칸

- 브라우저에서 연 파일 경로: ____
- 모바일 너비에서 깨지지 않는지 확인한 방법: ____
- 내가 설명할 CSS 속성 2개: ____, ____

### 설명 문장

이 페이지는 ____ 태그로 구조를 나누고, ____와 ____를 사용해 자기소개 영역과 카드 목록을 반응형으로 배치했습니다.

## 02 JavaScript 이벤트와 계산기

관련 파일: `02-javascript-basics/starter/app.js`

### 개념 빈칸

- 브라우저의 HTML 요소를 JavaScript에서 다루는 객체 모델을 ____이라고 한다.
- 버튼 클릭처럼 사용자의 행동이 발생하는 것을 ____라고 한다.
- input의 현재 값은 보통 `element.____`로 읽는다.
- 배열 끝에 값을 추가할 때 사용하는 메서드는 `____`이다.
- 화면을 다시 그리는 함수를 따로 두면 데이터 변경과 ____를 분리할 수 있다.

### 구현 TODO

- [ ] 이름 입력값을 읽어 환영 문구를 바꾼다.
- [ ] `calculate` 함수에서 더하기, 빼기, 곱하기, 나누기를 완성한다.
- [ ] 0으로 나누는 경우 오류 메시지를 반환한다.
- [ ] 할 일 목록을 렌더링할 때 `<li>` 요소를 만든다.
- [ ] 입력한 할 일을 배열에 넣고 다시 렌더링한다.

### 검증 빈칸

- 클릭 이벤트가 연결된 버튼 id: ____
- 계산기에서 테스트한 입력값: ____ + ____ = ____
- 할 일 추가 후 배열과 화면이 함께 바뀐 이유: ____

### 설명 문장

사용자가 버튼을 누르면 ____가 실행되고, 함수가 input 값을 읽은 뒤 배열이나 DOM을 변경해 화면을 갱신합니다.

## 03 React Todo

관련 파일: `03-react-todo/src/App.jsx`, `03-react-todo/src/components/TodoItem.jsx`

### 개념 빈칸

- React에서 화면에 영향을 주는 값은 보통 ____로 관리한다.
- 부모 컴포넌트가 자식 컴포넌트에 넘기는 값은 ____라고 한다.
- 배열 state를 수정할 때 기존 배열을 직접 바꾸지 않고 새 배열을 만드는 이유는 ____를 지키기 위해서다.
- 입력창의 변경 이벤트에서 실제 입력값은 `event.target.____`에 있다.
- 리스트 렌더링에서 `key`가 필요한 이유는 React가 각 항목의 ____를 추적하기 위해서다.

### 구현 TODO

- [ ] `remainingCount`를 `todos.filter`로 계산한다.
- [ ] 새 Todo 제목을 `input.trim()`으로 만든다.
- [ ] 빈 문자열은 추가하지 않도록 막는다.
- [ ] `map`으로 해당 id의 `done` 값을 반대로 바꾼다.
- [ ] input `onChange`에서 `setInput(event.target.value)`를 호출한다.
- [ ] `TodoItem` 버튼 클릭 시 부모의 `onToggle`을 실행한다.

### 검증 빈칸

- 실행 명령: ____
- 빌드 명령: ____
- 완료 토글 시 바뀌는 state 필드: ____

### 설명 문장

Todo 앱은 ____를 단일 기준으로 삼고, 입력 이벤트와 토글 이벤트가 state를 바꾸면 React가 화면을 다시 렌더링합니다.

## 04 Node 게시판 REST API

관련 파일: `04-node-board-api/src/server.js`, `04-node-board-api/requests.http`

### 개념 빈칸

- REST에서 리소스 목록 조회는 보통 HTTP 메서드 ____를 사용한다.
- 리소스 생성 성공 상태 코드는 ____이다.
- 리소스 삭제 성공 후 응답 본문이 없으면 상태 코드 ____를 자주 사용한다.
- URL의 `:id` 값은 `req.____.id`에서 읽는다.
- JSON 요청 본문을 읽기 위해 Express에 `express.____()` 미들웨어를 등록한다.

### 구현 TODO

- [ ] `GET /posts`가 게시글 배열을 응답하게 한다.
- [ ] `GET /posts/:id`에서 URL id를 숫자로 변환한다.
- [ ] 없는 게시글은 404를 반환한다.
- [ ] `POST /posts`에서 title과 content를 body에서 읽는다.
- [ ] `PUT /posts/:id`에서 기존 값과 요청 값을 병합한다.
- [ ] `DELETE /posts/:id`에서 배열에서 항목을 제거한다.

### 검증 빈칸

- health check URL: ____
- 생성 요청의 상태 코드: ____
- 없는 id 조회 시 상태 코드: ____

### 설명 문장

게시판 API는 ____ 메서드로 조회, 생성, 수정, 삭제를 나누고, 성공과 실패를 HTTP 상태 코드로 구분했습니다.

## 05 MongoDB 게시판 API

관련 파일: `05-database-mongodb/src/db.js`, `05-database-mongodb/src/models/Post.js`, `05-database-mongodb/src/server.js`

### 개념 빈칸

- MongoDB와 Node.js를 연결할 때 이 프로젝트에서 사용하는 ODM은 ____이다.
- Mongoose에서 컬렉션 문서의 모양을 정의하는 객체는 ____이다.
- 데이터가 서버 재시작 후에도 남는 성질을 ____이라고 한다.
- `findByIdAndUpdate`에서 수정된 최신 문서를 받으려면 옵션 `____: true`를 사용한다.
- 비동기 라우터에서 에러를 중앙 처리로 넘길 때 `____(error)`를 호출한다.

### 구현 TODO

- [ ] author 기본값을 스키마 default로 채운다.
- [ ] 생성 API에서 title, content, author를 body에서 읽는다.
- [ ] 수정 API에서 title, content, author 값을 body에서 읽는다.
- [ ] 삭제 API에서 `req.params.id`로 문서를 삭제한다.
- [ ] DB 연결 실패 또는 ObjectId 오류가 응답으로 드러나는지 확인한다.

### 검증 빈칸

- MongoDB 연결 문자열 환경변수 이름: ____
- 생성 후 다시 조회했을 때 같은 데이터가 보인 이유: ____
- Mongoose 모델 이름: ____

### 설명 문장

MongoDB 단계에서는 Express 라우터가 직접 배열을 고치는 대신, ____ 모델을 통해 데이터를 저장하고 조회하도록 바꿨습니다.

## 06 로그인과 JWT 인증

관련 파일: `06-login-auth/src/server.js`, `06-login-auth/src/auth.js`, `06-login-auth/src/users.js`

### 개념 빈칸

- 비밀번호는 평문 저장 대신 ____로 저장해야 한다.
- bcrypt의 `hash(password, 10)`에서 10은 work factor, 즉 ____ 비용을 의미한다.
- 로그인 성공 후 서버가 발급하는 서명된 토큰은 ____이다.
- 보호 API는 요청 헤더 `____: Bearer <token>`을 확인한다.
- 인증 실패 상태 코드는 보통 ____이다.

### 구현 TODO

- [ ] 회원가입에서 `bcrypt.hash(password, 10)`을 사용한다.
- [ ] 이름이 없을 때 사용할 기본 이름을 정한다.
- [ ] 로그인에서 `bcrypt.compare(password, user.passwordHash)`를 호출한다.
- [ ] JWT payload에 user id와 email을 담는다.
- [ ] `/me` 라우트가 `requireAuth`를 통과한 사용자만 응답하게 한다.

### 검증 빈칸

- 회원가입 성공 상태 코드: ____
- 중복 이메일 상태 코드: ____
- 토큰 없이 `/me` 호출 시 상태 코드: ____

### 설명 문장

회원가입 때 비밀번호를 ____로 해시하고, 로그인 성공 시 ____를 발급해 이후 보호 API에서 요청자를 확인했습니다.

## 07 프론트와 백 연결 및 배포 준비

관련 파일: `07-project-deploy/src/server.js`, `07-project-deploy/public/app.js`, `07-project-deploy/deploy-checklist.md`

### 개념 빈칸

- Express에서 정적 파일을 제공하는 미들웨어는 `express.____`이다.
- 같은 서버에서 API를 호출할 때 `API_BASE`는 보통 ____ 문자열로 둔다.
- 브라우저에서 HTTP 요청을 보낼 때 이 프로젝트가 사용하는 함수는 ____이다.
- 로컬과 배포 환경에서 달라지는 값은 ____ 변수로 분리한다.
- 배포 전 실행 방법, 환경 변수, 검증 방법은 ____에 남겨야 한다.

### 구현 TODO

- [ ] `API_BASE`를 같은 서버 기준으로 설정한다.
- [ ] 게시글 목록 렌더링에서 title, author, createdAt을 표시한다.
- [ ] 폼 입력값을 `trim()`해서 요청 body에 담는다.
- [ ] 서버 생성 API에서 title, content, author를 body에서 읽는다.
- [ ] 배포 체크리스트에 빌드, 환경 변수, 실행 확인을 기록한다.

### 검증 빈칸

- API 목록 URL: ____
- 정적 페이지 URL: ____
- 배포 전 꼭 제외할 폴더: ____

### 설명 문장

7단계는 브라우저의 ____ 요청과 Express API를 연결하고, 배포 환경에서 필요한 설정을 문서화하는 단계입니다.

## 08 Career Hub Fullstack Portfolio

관련 파일: `08-fullstack-portfolio-project/src/App.jsx`, `08-fullstack-portfolio-project/server/index.js`, `08-fullstack-portfolio-project/server/auth.js`, `08-fullstack-portfolio-project/server/data-store.js`, `08-fullstack-portfolio-project/server/validators.js`

### 전체 기능 지도 빈칸

- 앱 이름: ____
- 해결하는 문제: SI/SW 취업 준비자가 ____와 ____를 관리한다.
- 프론트엔드 스택: React + ____
- 백엔드 스택: Node.js + ____
- 인증 방식: bcrypt + ____
- 저장 방식: JSON 파일 저장소, 추후 ____ 또는 PostgreSQL로 교체 가능
- 핵심 검증 명령: `npm run ____`

### 프론트엔드 구현 TODO

- [ ] 로그인/회원가입 화면에서 `mode` state로 화면을 전환한다.
- [ ] 로그인 성공 후 token과 user를 state에 저장한다.
- [ ] token은 새로고침 후 유지되도록 `____`에 저장한다.
- [ ] `loadAll`에서 `/api/me`, `/api/dashboard`, `/api/applications`, `/api/projects`를 한 번에 갱신한다.
- [ ] 지원 현황 폼에서 생성과 수정 모드를 `editingId`로 구분한다.
- [ ] 프로젝트 폼에서 기술 스택 문자열을 배열로 변환한다.
- [ ] 탭 state로 지원 현황, 프로젝트, 학습 연결 화면을 전환한다.
- [ ] ErrorBoundary로 렌더링 예외 시 대체 화면을 보여준다.

### 백엔드 API 구현 TODO

- [ ] `/api/health`로 서버 상태를 반환한다.
- [ ] `/api/openapi.json`으로 API 문서를 노출한다.
- [ ] `/api/auth/register`에서 입력 검증, 중복 이메일 확인, 비밀번호 해시를 처리한다.
- [ ] `/api/auth/login`에서 비밀번호 검증 후 JWT를 발급한다.
- [ ] `/api/me`에서 현재 사용자 공개 정보를 반환한다.
- [ ] `/api/dashboard`에서 지원 현황과 프로젝트 기반 지표를 계산한다.
- [ ] `/api/applications` CRUD를 인증 사용자 기준으로 처리한다.
- [ ] `/api/projects` CRUD를 인증 사용자 기준으로 처리한다.
- [ ] API 오류는 400, 401, 404, 409, 500으로 의미 있게 구분한다.

### 저장소 계층 빈칸

- 저장소 파일: `server/____.js`
- 사용자에게 노출하면 안 되는 필드: ____
- 이메일 비교 전 적용하는 정규화: ____
- 저장소 계층을 분리한 이유: 라우터가 특정 ____ 방식에 묶이지 않게 하기 위해서다.

### 검증과 품질 TODO

- [ ] `npm run lint`로 ESLint를 통과한다.
- [ ] `npm run format:check`로 Prettier 포맷을 확인한다.
- [ ] `npm run test:unit`으로 서버, 저장소, 검증, 프론트 테스트를 실행한다.
- [ ] `npm run test:api`로 실제 서버 기준 인증과 CRUD smoke test를 실행한다.
- [ ] `npm run build`로 Vite production build를 만든다.
- [ ] `npm run audit:submit`으로 제출 필수 파일과 보안 항목을 확인한다.
- [ ] `npm run verify`로 위 항목을 한 번에 실행한다.

### 보안/운영 빈칸

- 기본 보안 헤더는 ____ 미들웨어로 설정한다.
- 로그인과 API 요청 남용은 ____ 미들웨어로 제한한다.
- request body 크기 제한은 `express.json({ limit: "____" })`처럼 설정한다.
- 구조적 JSON 로그는 ____와 pino-http로 남긴다.
- 요청 추적용 헤더 이름은 `____`이다.
- 컨테이너 종료 신호 SIGTERM/SIGINT에서는 ____ 셧다운을 수행한다.

### 설명 문장

Career Hub는 React로 ____를 관리하고, Express API로 ____와 ____ CRUD를 제공하며, bcrypt와 JWT로 보호 API를 구성한 제출용 fullstack 포트폴리오입니다.

## 09 TypeScript

관련 파일: `09-typescript/starter/*.ts`, `09-typescript/starter/*.tsx`

### 개념 빈칸

- TypeScript의 핵심 가치는 런타임 전에 ____ 시점에 오류를 잡는 것이다.
- 객체의 구조를 이름 붙여 정의할 때 `____` 또는 `type`을 사용한다.
- 여러 가능한 타입을 표현하는 `string | number` 같은 타입을 ____ 타입이라고 한다.
- `typeof`, `instanceof`로 타입을 좁히는 과정을 ____이라고 한다.
- 호출자가 응답 타입을 지정하게 하는 문법 `fetchJson<T>`에서 T는 ____이다.

### 구현 TODO

- [ ] 기본 타입, 배열, 객체 타입 빈칸을 채운다.
- [ ] Todo 컴포넌트 props 타입을 명시한다.
- [ ] Express Request params와 body 타입을 정의한다.
- [ ] `formatValue`에서 string, number, Date를 모두 처리한다.
- [ ] 마지막 분기에서 `never`로 exhaustiveness를 확인한다.
- [ ] `fetchJson<T>`가 `Promise<T>`를 반환하도록 만든다.

### 검증 빈칸

- 타입 검사 명령: ____
- `any`를 남기면 위험한 이유: ____
- 컴파일 시점에 잡은 오류 예시: ____

### 설명 문장

TypeScript 단계에서는 값의 모양을 ____로 명시해 API와 화면 사이의 계약이 어긋나는 문제를 미리 잡았습니다.

## 10 SQL/Oracle

관련 파일: `10-sql-oracle/starter/*.sql`

### 개념 빈칸

- 테이블을 만들고 변경하는 SQL 범주는 ____이다.
- 데이터를 조회, 삽입, 수정, 삭제하는 SQL 범주는 ____이다.
- 기본키는 각 행을 ____하게 식별한다.
- 외래키는 두 테이블 사이의 ____ 관계를 보장한다.
- `INNER JOIN`은 양쪽 조건이 맞는 행만 반환하고, `LEFT JOIN`은 ____ 테이블의 행을 모두 유지한다.
- 트랜잭션의 ACID 중 Atomicity는 ____를 의미한다.
- 인덱스는 조회 속도를 높일 수 있지만 ____ 비용과 저장 공간을 늘릴 수 있다.

### 구현 TODO

- [ ] departments와 employees 테이블의 PK/FK를 정의한다.
- [ ] 더미 부서와 직원을 INSERT한다.
- [ ] WHERE와 ORDER BY로 조건 조회를 작성한다.
- [ ] GROUP BY와 HAVING으로 부서별 집계를 작성한다.
- [ ] INNER JOIN과 LEFT JOIN 결과 행 수를 비교한다.
- [ ] 서브쿼리로 평균보다 높은 급여를 조회한다.
- [ ] COMMIT과 ROLLBACK 결과를 직접 확인한다.
- [ ] 인덱스 생성 전후 실행 계획을 비교한다.

### 검증 빈칸

- 실행한 SQL 환경: ____
- INNER JOIN 결과 행 수: ____
- LEFT JOIN 결과 행 수: ____
- 인덱스 전후 실행 계획 차이: ____

### 설명 문장

SQL 단계에서는 테이블 관계를 ____로 보장하고, JOIN과 GROUP BY로 화면에 필요한 데이터를 조회하는 연습을 했습니다.

## 11 Java/Spring

관련 파일: `11-java-spring/README.md`, `11-java-spring/starter/README.md`

### 개념 빈칸

- Spring에서 HTTP 요청을 받는 계층은 ____이다.
- 비즈니스 규칙을 담당하는 계층은 ____이다.
- DB 접근을 담당하는 계층은 ____이다.
- 객체 생성을 프레임워크에 맡기고 필요한 곳에 주입받는 방식을 ____라고 한다.
- API 요청/응답 전용 객체는 보통 ____라고 부른다.

### 구현 TODO

- [ ] 게시글 도메인 모델을 정의한다.
- [ ] Controller에서 REST 엔드포인트를 나눈다.
- [ ] Service에서 생성, 조회, 수정, 삭제 규칙을 처리한다.
- [ ] Repository에서 데이터 접근을 분리한다.
- [ ] DTO로 요청/응답 모양을 분리한다.
- [ ] 없는 게시글은 404로 응답한다.

### 검증 빈칸

- 실행 명령: ____
- 게시글 목록 엔드포인트: ____
- Express와 Spring의 가장 큰 구조 차이: ____

### 설명 문장

Spring 단계에서는 Express에서 한 파일에 작성하던 API를 ____, ____, ____ 계층으로 나누어 유지보수하기 쉽게 만들었습니다.

## 12 Testing

관련 파일: `12-testing/starter/js/src/*.ts`

### 개념 빈칸

- 단일 함수의 작은 동작을 확인하는 테스트는 ____ 테스트다.
- 여러 모듈이 함께 동작하는 흐름을 확인하는 테스트는 ____ 테스트다.
- 외부 의존성을 가짜로 바꾸는 것을 ____이라고 한다.
- 테스트의 기본 흐름 AAA는 Arrange, Act, ____이다.
- Express API 테스트에서 HTTP 요청을 흉내내는 라이브러리는 ____이다.

### 구현 TODO

- [ ] calculator 테스트에서 add, subtract, divide 정상 케이스를 검증한다.
- [ ] divide 0 나누기 예외를 검증한다.
- [ ] Express 앱 통합 테스트에서 GET /posts 빈 배열을 확인한다.
- [ ] POST /posts 생성 성공 상태 코드를 확인한다.
- [ ] body 누락 시 400을 확인한다.
- [ ] 없는 id 조회 시 404를 확인한다.
- [ ] mailer를 `vi.spyOn`으로 mock 처리한다.
- [ ] mock이 올바른 인자로 호출됐는지 검증한다.

### 검증 빈칸

- 테스트 실행 명령: ____
- 내가 추가한 회귀 방지 케이스: ____
- mock을 쓴 이유: ____

### 설명 문장

테스트 단계에서는 함수, API, 외부 의존성 호출을 자동 검증해 리팩터링 후 ____가 생겼는지 빠르게 확인할 수 있게 했습니다.

## 13 Git 협업

관련 파일: `13-git-collab/README.md`, `13-git-collab/problems.md`

### 개념 빈칸

- 기능 단위 작업 브랜치는 보통 ____ 브랜치라고 부른다.
- GitHub에서 코드 리뷰와 병합을 요청하는 단위는 ____이다.
- 두 브랜치가 같은 줄을 다르게 고치면 ____이 발생한다.
- main 브랜치에 직접 push를 막는 설정은 ____ branch 규칙이다.
- 이전 커밋을 정리해 직선 히스토리로 만드는 명령 흐름은 ____이다.

### 구현 TODO

- [ ] feature 브랜치를 만든다.
- [ ] 작은 단위로 커밋 메시지를 작성한다.
- [ ] GitHub에서 PR을 연다.
- [ ] 리뷰 코멘트를 반영한다.
- [ ] 충돌을 재현하고 해결 기록을 남긴다.
- [ ] merge 후 로컬 main을 최신화한다.

### 검증 빈칸

- 브랜치 생성 명령: ____
- PR 제목: ____
- 충돌 해결한 파일: ____

### 설명 문장

Git 협업 단계에서는 기능 브랜치와 PR을 통해 변경을 검토하고, 충돌이 났을 때 ____를 기준으로 안전하게 해결했습니다.

## 14 Docker와 CI

관련 파일: `14-docker-deploy/starter/**`, `.github/workflows/ci.yml`

### 개념 빈칸

- Docker 이미지를 만드는 설계 파일은 ____이다.
- 컨테이너가 실행할 기본 명령은 `CMD` 또는 ____로 정의한다.
- 빌드 캐시를 살리려면 `package*.json`을 먼저 복사한 뒤 ____를 실행한다.
- 여러 컨테이너를 함께 실행하는 도구는 docker ____이다.
- GitHub Actions에서 push/PR마다 자동 실행되는 파이프라인을 ____라고 한다.
- 이미지에 포함하면 안 되는 로컬 파일 목록은 ____에 둔다.

### 구현 TODO

- [ ] Node 앱 Dockerfile의 base image를 채운다.
- [ ] package 파일 먼저 복사 후 `npm ci`를 실행한다.
- [ ] 소스 전체를 복사하고 포트를 노출한다.
- [ ] Spring Boot Dockerfile을 build/runtime 멀티 스테이지로 나눈다.
- [ ] compose에서 Postgres 이미지와 볼륨을 설정한다.
- [ ] GitHub Actions에서 checkout, setup-node, install, test, build 단계를 구성한다.
- [ ] 시크릿이 Dockerfile이나 커밋에 들어가지 않았는지 확인한다.

### 검증 빈칸

- Docker 빌드 명령: ____
- 컨테이너 실행 명령: ____
- compose 실행 명령: ____
- CI에서 자동 확인할 명령: ____

### 설명 문장

Docker 단계에서는 앱과 실행 환경을 ____로 묶고, CI에서 빌드와 테스트를 자동화해 "내 컴퓨터에서는 됨" 문제를 줄였습니다.

## 15 CS Fundamentals

관련 파일: `15-cs-fundamentals/problems.md`

### 개념 빈칸

- HTTP는 OSI 7계층 중 ____ 계층 프로토콜이다.
- TCP는 신뢰성을 제공하고, UDP는 ____이 낮고 빠르다.
- 프로세스는 실행 중인 프로그램이고, 스레드는 프로세스 안의 ____ 단위다.
- DB 트랜잭션의 격리 수준이 낮으면 ____ read 같은 문제가 생길 수 있다.
- Big-O는 입력 크기가 커질 때 알고리즘의 ____ 변화를 표현한다.

### 구현 연결 TODO

- [ ] HTTP 상태 코드를 04, 08 단계 API와 연결해 설명한다.
- [ ] TCP/UDP를 브라우저와 API 통신 흐름에 연결한다.
- [ ] 프로세스/스레드를 Node 서버 실행과 연결한다.
- [ ] ACID를 10단계 트랜잭션과 연결한다.
- [ ] 자료구조를 Todo 배열, 게시글 목록, Map/Set 예시와 연결한다.

### 검증 빈칸

- 가장 약한 CS 주제: ____
- 내 코드와 연결한 파일: ____
- 1분 답변 녹음 여부: ____

### 설명 문장

CS 단계에서는 암기 답안이 아니라, 네트워크와 DB, 자료구조 개념을 내가 만든 ____ 기능과 연결해 설명하는 연습을 했습니다.

## 16 Security

관련 파일: `16-security/starter/**`

### 개념 빈칸

- 저장형 XSS는 악성 스크립트가 ____에 저장된 뒤 다른 사용자에게 실행되는 공격이다.
- 반사형 XSS는 요청 파라미터가 응답 HTML에 그대로 ____될 때 발생한다.
- XSS 방어의 핵심은 입력을 무조건 믿지 않고 출력 시점에 HTML ____를 적용하는 것이다.
- SQL Injection 방어는 문자열 연결 대신 ____ 쿼리를 사용한다.
- CSRF는 사용자가 로그인된 상태를 악용해 원치 않는 ____을 보내게 한다.
- CORS에서 credential 요청을 허용할 때 `origin: "*"`와 함께 쓰면 ____하다.

### 구현 TODO

- [ ] `escapeHtml`에서 `&`, `<`, `>`, `"`, `'`를 안전한 엔티티로 바꾼다.
- [ ] 저장형 XSS 출력 지점에 escape를 적용한다.
- [ ] 반사형 XSS 검색어와 input value에 escape를 적용한다.
- [ ] SQL 검색을 `?` placeholder와 값 배열로 바꾼다.
- [ ] CSRF 방어에서 SameSite 쿠키를 적용한다.
- [ ] CSRF 토큰을 hidden input으로 전달한다.
- [ ] CORS 허용 출처 whitelist를 적용한다.
- [ ] credential 허용 여부를 명시한다.

### 검증 빈칸

- 재현한 공격 payload: ____
- 방어 후 화면/응답 변화: ____
- 6단계 인증과 연결되는 보안 개념: ____

### 설명 문장

보안 단계에서는 공격을 먼저 재현한 뒤, 출력 인코딩, 파라미터화 쿼리, CSRF 토큰, CORS whitelist로 ____를 줄였습니다.

## 17 Interview Prep

관련 파일: `17-interview-prep/interview-cards.md`, `17-interview-prep/self-intro-templates.md`, `17-interview-prep/behavioral-questions.md`, `17-interview-prep/project-pitch-template.md`

### 개념 빈칸

- 좋은 기술 면접 답변은 "무엇을 했다"보다 "왜 그렇게 했고 어떻게 ____했다"를 포함한다.
- STAR 답변은 Situation, Task, Action, ____ 순서로 구성한다.
- 프로젝트 설명의 첫 문장은 해결한 ____를 말해야 한다.
- 꼬리질문 대비에는 사용한 기술의 장점뿐 아니라 ____도 준비해야 한다.

### 작성 TODO

- [ ] 30초 자기소개를 작성한다.
- [ ] 1분 자기소개를 작성한다.
- [ ] 3분 자기소개를 작성한다.
- [ ] Career Hub 기술 설명 카드를 작성한다.
- [ ] 가장 어려웠던 오류와 해결 과정을 STAR로 작성한다.
- [ ] 협업/갈등/학습 경험 답변을 작성한다.
- [ ] 프로젝트 피치에서 문제, 기능, 기술, 검증, 배운 점을 모두 포함한다.

### 검증 빈칸

- 가장 자신 있는 기술 질문: ____
- 가장 약한 꼬리질문: ____
- 스톱워치로 맞춘 답변 시간: ____

### 설명 문장

면접 준비 단계에서는 1~16단계의 구현 근거를 모아, 내가 직접 만든 ____를 기준으로 기술과 협업 경험을 설명합니다.

## monorepo-mini-app Note Hub

관련 파일: `monorepo-mini-app/packages/shared/src/index.ts`, `monorepo-mini-app/packages/api/src/server.ts`, `monorepo-mini-app/packages/api/src/notes-store.ts`, `monorepo-mini-app/packages/api/src/notes-store-pg.ts`, `monorepo-mini-app/packages/web/src/App.tsx`

### 개념 빈칸

- 여러 패키지를 한 저장소에서 관리하는 구조를 ____라고 한다.
- npm 기본 기능으로 패키지들을 묶는 설정은 ____이다.
- API와 Web이 함께 import하는 공통 패키지는 `@note-hub/____`이다.
- 백엔드 응답 타입이 바뀌면 프론트엔드 ____가 실패해 계약 불일치를 빨리 발견한다.
- `NotesStore` 인터페이스 뒤에 InMemory와 PostgreSQL 구현을 둔 이유는 저장 방식 ____를 쉽게 하기 위해서다.
- `DATABASE_URL`이 있으면 ____ 저장소를 사용하고, 없으면 ____ 저장소를 사용한다.

### 구현 TODO

- [ ] shared 패키지에 `Note`, `CreateNoteInput`, `ApiRoutes`를 정의한다.
- [ ] API 서버에서 `ApiRoutes.notes`를 사용해 목록과 생성 라우트를 만든다.
- [ ] `validateCreate`로 title, body, tags 입력을 검증한다.
- [ ] InMemory store와 Postgres store가 같은 인터페이스를 만족하게 한다.
- [ ] Web에서 `useState<Note[]>`와 `useState<CreateNoteInput>`으로 상태 타입을 고정한다.
- [ ] Web에서 note 생성 후 목록을 다시 불러온다.
- [ ] OpenAPI 스펙과 shared 타입의 동기화 테스트를 유지한다.
- [ ] Dockerfile에서 web 빌드 결과와 API 런타임을 단일 이미지에 담는다.

### 검증 빈칸

- shared 빌드 명령: ____
- 전체 테스트 명령: ____
- API 포트: ____
- Web 포트: ____
- Postgres 실행 명령: ____

### 설명 문장

Note Hub는 npm workspaces로 API, Web, shared를 나누고, ____ 타입을 양쪽이 함께 사용해 API 계약을 컴파일 시점에 검증하는 모노레포 데모입니다.

## 전체 기능 완성 체크 매트릭스

각 줄마다 네 칸이 모두 채워지면 해당 단계는 "공부용으로 설명 가능한 상태"입니다.

| 단계 | 개념 설명 | 구현 완료 | 검증 완료 | 면접 문장 |
| --- | --- | --- | --- | --- |
| 01 HTML/CSS | [ ] | [ ] | [ ] | [ ] |
| 02 JavaScript | [ ] | [ ] | [ ] | [ ] |
| 03 React Todo | [ ] | [ ] | [ ] | [ ] |
| 04 Node API | [ ] | [ ] | [ ] | [ ] |
| 05 MongoDB | [ ] | [ ] | [ ] | [ ] |
| 06 Auth | [ ] | [ ] | [ ] | [ ] |
| 07 Deploy | [ ] | [ ] | [ ] | [ ] |
| 08 Career Hub | [ ] | [ ] | [ ] | [ ] |
| 09 TypeScript | [ ] | [ ] | [ ] | [ ] |
| 10 SQL | [ ] | [ ] | [ ] | [ ] |
| 11 Spring | [ ] | [ ] | [ ] | [ ] |
| 12 Testing | [ ] | [ ] | [ ] | [ ] |
| 13 Git | [ ] | [ ] | [ ] | [ ] |
| 14 Docker/CI | [ ] | [ ] | [ ] | [ ] |
| 15 CS | [ ] | [ ] | [ ] | [ ] |
| 16 Security | [ ] | [ ] | [ ] | [ ] |
| 17 Interview | [ ] | [ ] | [ ] | [ ] |
| Note Hub | [ ] | [ ] | [ ] | [ ] |

## 최종 제출 전 TODO

- [ ] 루트에서 `npm run verify`를 실행했다.
- [ ] `08-fullstack-portfolio-project`에서 `npm run verify`를 실행했다.
- [ ] `monorepo-mini-app`에서 `npm test` 또는 필요한 범위의 테스트를 실행했다.
- [ ] `.env`, `node_modules`, `dist`, 로컬 데이터 파일이 커밋되지 않는지 확인했다.
- [ ] README에 실행 방법, 주요 기능, 검증 명령이 들어 있는지 확인했다.
- [ ] 면접에서 설명할 대표 기능 3개를 골랐다: ____, ____, ____.
- [ ] 각 대표 기능에 대해 "문제, 구현, 검증, 배운 점" 4문장을 작성했다.

## 최종 설명 템플릿

제가 만든 프로젝트는 ____ 문제를 해결하기 위한 ____ 앱입니다. 프론트엔드는 ____로 화면 상태와 폼 흐름을 관리했고, 백엔드는 ____로 REST API를 구성했습니다. 데이터는 ____에 저장하며, 인증은 ____와 ____로 구현했습니다. 마지막으로 ____ 명령으로 빌드, 테스트, 제출 감사를 확인했습니다.
