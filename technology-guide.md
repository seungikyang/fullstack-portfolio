# 처음 읽는 기술 안내서

[HTML 목차](./index.html) · [시작 워크시트](./START-HERE.md) · [폴더별 실행 지도](./folder-to-practice-guide.md)

코드를 처음 읽을 때는 기술 이름을 모두 외우기보다 **어떤 문제를 해결하려고 넣었는지, 입력이 어디를 지나 결과가 되는지**를 먼저 보세요. 이 안내서는 현재 저장소의 파일을 따라 그 두 가지를 설명합니다. 처음에는 1~3절만 읽고, 각 단계 README의 기술 설명으로 이동해도 됩니다.

## 1. 지금 어떤 프로그램을 보고 있나요?

이 저장소는 여러 프로그램과 학습 자료를 함께 담고 있습니다. 한 폴더의 실행 명령이 모든 프로그램을 켜는 것은 아닙니다.

| 구분 | 하는 일 | 기술이 들어간 이유 | 시작 위치 |
| --- | --- | --- | --- |
| 문제집 웹 화면 | 설명·문제·힌트를 읽고 허용된 실습 파일을 편집합니다. | HTML/CSS로 문서를 보여주고 Node.js로 로컬 파일 읽기·저장을 처리합니다. | 루트의 [package.json](./package.json), [index.html](./index.html) |
| 01~17 학습 트랙 | 기술을 작은 예제로 하나씩 배우고 직접 빈칸을 채웁니다. | 한 번에 화면·서버·저장소를 모두 이해해야 하는 부담을 줄입니다. 일부 트랙은 실행 앱 대신 문서형 실습입니다. | 각 폴더의 README |
| Career Hub | 목표, 프로젝트, 지원 기록을 계정별로 저장합니다. | React 화면, Express API, 인증, JSON 파일 저장을 연결해 풀스택의 전체 흐름을 봅니다. | [08 실행 안내](./08-fullstack-portfolio-project/README.md) |
| Note Hub | 노트를 만들고 목록을 조회합니다. | TypeScript 공통 코드와 교체 가능한 저장소를 별도 앱에서 연습합니다. | [Note Hub 실행 안내](./monorepo-mini-app/README.md) |

문제집 서버에서 코드를 저장했다고 해당 트랙 서버까지 실행되는 것은 아닙니다. 먼저 파일을 저장한 뒤 해당 트랙 README의 실행 명령으로 결과를 확인합니다.

## 2. 화면, 서버, 저장소는 왜 나뉘나요?

**프론트엔드**는 브라우저에서 사용자가 보고 조작하는 부분입니다. **백엔드**는 요청을 받아 데이터를 검사하고 저장하는 서버 쪽 코드입니다. **저장소**는 나중에 다시 읽을 데이터를 보관하는 부분입니다. 이 셋을 함께 다루는 것을 이 저장소에서는 풀스택이라고 부릅니다.

```text
사용자가 입력하고 저장 버튼을 누름
  → 브라우저: 입력값을 모아 HTTP 요청을 보냄
  → 서버: 로그인 여부와 입력값을 검사함
  → 저장소: 기록을 보관함
  → 서버: 처리 결과를 HTTP 응답으로 보냄
  → 브라우저: 응답을 읽고 화면을 갱신함
```

화면의 입력 제한은 사용자를 돕습니다. 서버의 입력 검사는 브라우저를 거치지 않고 직접 보낸 요청에도 같은 규칙을 적용합니다. 저장을 서버에서 맡으면 다른 기기의 사용자에게도 동일한 규칙으로 데이터를 제공할 수 있습니다.

| 처음 만나는 말 | 뜻과 이 저장소에서 하는 일 |
| --- | --- |
| HTTP 요청·응답 | 브라우저가 서버에 작업을 요청하고 서버가 결과를 돌려주는 통신 방식입니다. 요청에는 주소, 메서드, 헤더, 필요하면 본문이 들어갑니다. |
| API | 프로그램끼리 기능을 요청하는 약속입니다. Career Hub의 `GET /api/applications`는 지원 목록을 조회하는 약속입니다. |
| 메서드 / CRUD | `GET`은 조회, `POST`는 생성, `PATCH`는 일부 수정, `DELETE`는 삭제에 사용합니다. 생성·조회·수정·삭제를 묶어 CRUD라고 합니다. |
| JSON | 키와 값으로 데이터를 표현하는 텍스트 형식입니다. 요청 본문, 응답 본문, Career Hub의 저장 파일에 사용합니다. 데이터베이스 제품 이름은 아닙니다. |
| 헤더 / 본문 | 헤더는 데이터 형식이나 인증 같은 부가 정보이고, 본문은 저장할 입력값 또는 조회 결과입니다. |
| 상태 코드 | 요청의 처리 결과입니다. 이 앱에서 `201`은 생성 성공, `400`은 잘못된 입력, `401`은 인증 실패, `404`는 대상 없음, `409`는 중복 등의 충돌입니다. |
| localhost / 포트 | `localhost`는 지금 사용하는 컴퓨터이고, 포트 번호는 같은 컴퓨터에서 어느 서버에 접속할지 구별합니다. |

## 3. 가장 먼저 만나는 기술은 왜 필요한가요?

| 기술 | 왜 들어가나요? | 어떻게 동작하나요? | 실제 코드 |
| --- | --- | --- | --- |
| HTML | 제목·입력 칸·버튼 같은 콘텐츠의 구조와 의미를 정합니다. | 브라우저가 태그를 읽고 요소들의 구조인 DOM을 만듭니다. | [01 HTML](./01-html-css/starter/index.html?view=source) |
| CSS | 같은 내용을 읽기 좋은 간격과 크기로 배치합니다. | 선택자로 요소를 찾고 색·간격·배치 규칙을 적용합니다. 미디어 쿼리는 화면 너비 같은 조건에 따라 규칙을 바꿉니다. | [01 CSS](./01-html-css/starter/styles.css?view=source) |
| JavaScript | 클릭 후 계산하거나 목록을 바꾸는 동작을 만듭니다. | 이벤트 처리 함수가 입력을 읽고 계산한 뒤 DOM을 바꿉니다. | [02 app.js](./02-javascript-basics/starter/app.js?view=source) |
| React | 화면의 여러 부분이 같은 데이터에 맞춰 바뀌도록 관리합니다. | 화면 조각인 컴포넌트가 state(상태)를 읽어 화면을 계산하고, 부모는 props(전달값)로 자식에게 데이터와 함수를 줍니다. | [03 App.jsx](./03-react-todo/src/App.jsx?view=source) |
| Node.js | 브라우저 밖에서도 JavaScript로 서버와 파일 처리를 실행합니다. | 터미널에서 실행한 프로세스가 포트를 열고 요청을 기다립니다. | [04 서버](./04-node-board-api/src/server.js?view=source) |
| Express | 주소별 요청 처리와 공통 검사를 정리합니다. | 라우트가 메서드·경로를 처리 함수에 연결합니다. 미들웨어는 다음 처리로 넘기거나 응답을 끝냅니다. | [04 서버](./04-node-board-api/src/server.js?view=source) |
| MongoDB / Mongoose | 서버를 다시 켠 뒤에도 게시글을 조회하도록 DB에 저장하고 데이터 모양을 정합니다. | Mongoose 모델의 조회·저장 호출이 MongoDB와 통신합니다. 비동기 작업의 결과는 `await`로 기다립니다. | [05 연결 코드](./05-database-mongodb/src/db.js?view=source), [게시글 모델](./05-database-mongodb/src/models/Post.js?view=source) |

React의 state는 브라우저 메모리에 있는 화면용 값입니다. state를 바꾸는 것만으로 서버 파일이나 DB에 저장되지는 않습니다. 03단계에서는 화면 갱신을 먼저 배우고, 07·08단계에서는 요청을 보내 저장하는 과정을 연결합니다.

`async` 함수의 `await`는 그 함수 안에서 작업 결과를 기다리게 합니다. 기다리는 동안 프로그램 전체를 멈추라는 뜻은 아닙니다. 실제 예제의 정답은 먼저 채우지 말고 각 단계의 힌트를 따라가세요.

## 4. Career Hub의 저장 버튼을 따라가 봅니다

아래는 **로그인 후 지원 현황에서 새 기록을 저장하는 정상 흐름**입니다. 함수 이름은 코드에서 검색할 수 있도록 그대로 적었습니다.

```text
ApplicationSection의 입력과 제출
  → request: POST /api/applications
  → requireAuth: 토큰 확인
  → validateApplication: 입력 검사
  → JsonStore.createApplication: 사용자 id와 함께 저장
  → 201 응답
  → reload → loadAll: 최신 목록과 통계 다시 조회
  → React state 갱신 → 화면에 새 기록 표시
```

1. [src/App.jsx](./08-fullstack-portfolio-project/src/App.jsx)의 `ApplicationSection`은 입력값을 state에 보관합니다. 제출하면 `request`가 `JSON.stringify`로 값을 전송할 문자열로 바꾸고 `fetch`로 요청합니다.
2. 기본 개발 설정에서는 브라우저가 `localhost:3000/api/applications`로 보냅니다. [vite.config.js](./08-fullstack-portfolio-project/vite.config.js)의 프록시(요청 전달 설정)가 API 서버 `localhost:5100`으로 전달합니다.
3. [server/index.js](./08-fullstack-portfolio-project/server/index.js)의 JSON 미들웨어가 본문을 `req.body`로 읽습니다. `requireAuth`는 인증 헤더의 토큰을 검사하고 확인된 사용자 id를 `req.user.id`에 넣습니다.
4. [server/validators.js](./08-fullstack-portfolio-project/server/validators.js)의 `validateApplication`이 허용된 값과 오류를 나눕니다. 오류가 있으면 서버는 `400`으로 응답하고 저장 단계로 가지 않습니다.
5. [server/data-store.js](./08-fullstack-portfolio-project/server/data-store.js)의 `createApplication`이 기록 id와 사용자 id를 붙입니다. `write`는 완성한 임시 JSON 파일로 기존 파일을 교체합니다. 임시 파일 교체는 쓰다 만 JSON이 남을 위험을 줄이지만, 여러 서버의 동시 수정을 조정하는 DB 트랜잭션과는 기능이 다릅니다.
6. 서버의 `201` 응답 뒤 화면은 `reload` → `loadAll`을 호출해 목록·통계 등을 다시 조회합니다. state가 바뀌면 React가 새 데이터를 반영한 화면을 계산합니다.

브라우저 개발자 도구의 **Network(네트워크)** 탭을 열고 본인의 실습 기록 한 건을 저장해 보세요. `POST /api/applications`의 메서드·상태 코드·요청 본문과 뒤따르는 조회 요청을 확인합니다. 그다음 새로고침해도 기록이 보이는 이유를 1~6번 중 어느 단계 덕분인지 설명해 보세요. 토큰과 비밀번호는 실행 근거 캡처에 포함하지 않습니다.

`fetch`는 서버가 `400`이나 `500`을 응답했다는 이유만으로 예외를 던지지 않습니다. 이 앱의 `request`는 `response.ok`를 확인해 오류를 만들고 화면에서 표시합니다. 삭제 성공인 `204`는 응답 본문이 없으므로 JSON으로 읽는 단계를 생략합니다.

## 5. 로그인과 저장 기술은 각각 무엇을 맡나요?

| 기술 | 필요한 이유와 처리 방식 | 확인 위치 |
| --- | --- | --- |
| bcryptjs | 비밀번호 원문을 저장하지 않기 위해 해시를 만듭니다. 로그인에서는 `bcrypt.compare`로 입력 비밀번호와 저장된 해시를 비교합니다. 원문으로 복호화하는 과정은 없습니다. | [auth.js](./08-fullstack-portfolio-project/server/auth.js)의 `hashPassword`, `verifyPassword` |
| JWT / jsonwebtoken | 로그인 뒤 요청마다 비밀번호를 다시 보내지 않고 사용자를 확인합니다. 서버가 서명한 토큰을 발급하고 보호 API가 서명·만료를 검사합니다. 이 앱의 JWT는 내용을 암호화하지 않으므로 토큰에 비밀번호를 넣지 않습니다. | 같은 파일의 `signToken`, `requireAuth` |
| localStorage | 새로고침 후 토큰을 다시 읽기 위해 브라우저에 보관합니다. 지원 기록 자체를 저장하는 서버 파일과는 다른 저장 장소입니다. 이 앱은 로그아웃할 때 로컬 토큰을 지웁니다. | [App.jsx](./08-fullstack-portfolio-project/src/App.jsx)의 `handleAuth`, `logout` |
| JsonStore | 별도 DB 설치 없이 전체 앱을 실행할 수 있도록 데이터를 JSON 파일에 보관합니다. 저장 경로는 서버의 `DATA_FILE` 설정으로 바꿀 수 있습니다. Career Hub에서는 MongoDB와 SQL DB를 사용하지 않습니다. | [data-store.js](./08-fullstack-portfolio-project/server/data-store.js), [서버 생성 코드](./08-fullstack-portfolio-project/server/index.js) |

인증은 “누구인가”를 확인하는 일이고, 권한 검사는 “이 기록에 접근해도 되는가”를 확인하는 일입니다. Career Hub는 토큰을 확인한 뒤에도 `JsonStore`에서 사용자 id로 기록을 제한합니다. 로그인 성공만으로 다른 사람의 데이터를 읽을 수 있게 하지는 않습니다.

## 6. 실행·검증 도구는 왜 따로 있나요?

| 도구 또는 파일 | 들어간 이유 | 실행할 때 일어나는 일 |
| --- | --- | --- |
| npm / package.json | 필요한 라이브러리와 실행 명령을 폴더별로 관리합니다. | `npm install`은 의존성을 설치하고, `npm run dev`는 **현재 폴더**의 `scripts.dev` 명령을 실행합니다. |
| package-lock.json / npm ci | 설치할 의존성 버전을 기록해 같은 구성을 다시 설치합니다. | `npm ci`는 잠금 파일을 사용하며 기존 `node_modules`를 새로 설치합니다. 앱 실행 명령은 아닙니다. |
| Vite | 개발 중 React 코드를 브라우저에 제공하고 배포할 파일을 만듭니다. | 개발 서버는 수정 내용을 반영합니다. `npm run build`는 `dist`에 결과물을 만들며, 외부 사이트에 자동으로 게시하지는 않습니다. |
| .env / dotenv | 실행 환경마다 다른 포트·저장 경로·서명 비밀값을 코드와 분리합니다. | 서버는 환경 변수를 읽습니다. `.env.example`은 설정 예시이고, 실제 `.env`에는 자신의 값을 넣습니다. Vite의 `VITE_` 값은 브라우저 코드에 포함될 수 있어 비밀값을 넣지 않습니다. |
| ESLint / Prettier | 코드 규칙 검사와 서식을 반복해서 수작업으로 확인하는 부담을 줄입니다. | `lint`는 설정한 코드 규칙을, `format:check`는 서식을 검사합니다. 기능이 올바른지는 테스트로 따로 확인합니다. |
| Vitest / supertest | 수정 뒤 기존 동작이 깨졌는지 자동으로 확인합니다. | Vitest가 테스트를 실행하고 supertest는 Express 앱에 요청해 응답을 검사합니다. Career Hub에는 실제 HTTP 흐름을 확인하는 API smoke 스크립트도 있습니다. |
| Docker / Compose | 앱 실행에 필요한 환경을 함께 준비하고 여러 서비스를 연결합니다. | Dockerfile로 이미지를 만들고, 그 이미지로 실행한 인스턴스를 컨테이너라고 합니다. Compose는 앱·DB·저장 볼륨 같은 구성을 한 파일에 적습니다. |
| Git / GitHub Actions | 변경 이력을 남기고 푸시·PR 때 검증을 반복합니다. | Git은 커밋으로 변경을 기록합니다. Actions는 저장소의 워크플로 설정에 따라 설치·검사·빌드를 실행합니다. |

실제 명령은 [Career Hub package.json](./08-fullstack-portfolio-project/package.json), 개발 연결은 [Vite 설정](./08-fullstack-portfolio-project/vite.config.js), 자동 검증은 [CI 설정](./.github/workflows/ci.yml)에서 확인합니다. 같은 이름의 `npm run verify`라도 루트는 문제집 구조를, 08 폴더는 앱의 lint·서식·빌드·테스트·제출 조건을 검사합니다.

## 7. 문제집 웹 화면은 어떻게 코드를 보여주고 저장하나요?

[scripts/serve-workbook.js](./scripts/serve-workbook.js)는 Node.js의 HTTP 서버와 파일 기능을 사용합니다. 이 서버 자체는 Express를 쓰지 않습니다. `marked`는 Markdown을 HTML로 바꾸고, `sanitize-html`은 생성된 HTML에서 허용되지 않은 태그·속성을 제거합니다. 문서 원문을 브라우저 화면에 표시하기 위해 두 역할을 나눴습니다.

```text
문서 링크 클릭 → GET 요청 → 파일 읽기 → Markdown 변환·정화 → HTML 응답
코드 링크 클릭 → 편집기 표시 → 입력 수정 → 파일 저장 버튼
  → workbook-editor.js가 PUT 요청
  → 서버가 편집 허용 경로·요청 출처·토큰·파일 버전을 확인
  → 로컬 파일 저장 → 저장 결과 표시
```

[scripts/workbook-editor.js](./scripts/workbook-editor.js)는 편집한 문자열과 파일 버전을 보냅니다. 버전 확인은 다른 편집기에서 바뀐 파일을 오래된 화면이 덮어쓰는 일을 줄입니다. [problem-work-files.js](./scripts/problem-work-files.js)는 웹에서 저장 가능한 실습 파일 목록을 정합니다.

루트에서 `npm run serve:workbook`을 실행한 뒤 `http://127.0.0.1:4187/`로 접속하면 됩니다. 서버가 현재 저장소 폴더 이름을 포함한 주소로 이동시킵니다. 서버를 종료하면 웹 저장도 멈춥니다.

## 8. 다음 기술은 필요할 때 연결해 읽습니다

| 배우고 싶은 이유 | 이어서 볼 단계 |
| --- | --- |
| 값의 모양을 잘못 사용한 오류를 실행 전에 찾고 싶습니다. | [09 TypeScript](./09-typescript/README.md): 정적 타입 검사 |
| 테이블 여러 개에서 필요한 데이터를 모으고 싶습니다. | [10 SQL](./10-sql-oracle/README.md): 조회·관계·트랜잭션 |
| Java로 같은 API를 만들고 역할별로 나누고 싶습니다. | [11 Java/Spring](./11-java-spring/README.md): Controller·Service·Repository |
| 매번 클릭하지 않고 수정 결과를 확인하고 싶습니다. | [12 테스트](./12-testing/README.md): 입력·실행·결과 비교 |
| 다른 사람의 변경과 내 변경을 함께 관리하고 싶습니다. | [13 Git 협업](./13-git-collab/README.md): 브랜치·PR·충돌 해결 |
| 다른 환경에서도 같은 방식으로 실행하고 싶습니다. | [14 Docker](./14-docker-deploy/README.md): 이미지·컨테이너·CI |
| 느려짐이나 동시 처리의 이유를 설명하고 싶습니다. | [15 CS](./15-cs-fundamentals/README.md): 네트워크·운영체제·DB·자료구조 |
| 예상하지 못한 입력이 왜 문제가 되는지 확인하고 싶습니다. | [16 보안](./16-security/README.md): 공격 입력과 방어 코드 비교 |
| 내가 사용한 기술의 이유를 자기 말로 설명하고 싶습니다. | [17 설명 연습](./17-interview-prep/README.md): 코드와 관찰 결과로 답변 구성 |

추가 앱인 [Note Hub](./monorepo-mini-app/README.md)는 `packages/web`, `packages/api`, `packages/shared`를 npm workspaces로 함께 관리합니다. 공통 타입은 개발 중 코드의 모양을 검사하는 데 쓰고, API 경로 상수와 태그 정리 함수는 실행 중에도 사용합니다. 타입은 외부 HTTP 입력을 자동 검증하지 않으므로 서버의 입력 검사도 필요합니다.

## 9. 읽은 뒤 확인할 세 가지

1. 지금 보는 코드가 브라우저·서버·저장소·개발 도구 중 어디에 속하는지 말해 봅니다.
2. 버튼 하나를 골라 입력 → 함수 → 요청 → 저장 → 화면 순서에서 해당하는 부분을 찾아봅니다. 서버가 없는 단계라면 브라우저 안의 흐름만 설명합니다.
3. “이 기술은 어떤 문제 때문에 필요했고, 이 파일에서 이렇게 동작하며, 실행 후 이 결과를 봤다”를 한 문장씩 적습니다.

막히면 해당 단계 README → `hints.md`의 1~3단계 → 마지막에 `answers.md` 순서로 확인합니다. 기술의 공식 설명을 더 읽고 싶으면 [단계별 참고 자료](./references.md)로 이어갑니다.
