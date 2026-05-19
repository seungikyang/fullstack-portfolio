# 작업 맥락 기록

## 2026-05-19

- 현재 작업 폴더 `/Users/seungik.yang/Documents/fullstack`는 비어 있다.
- `git status` 확인 결과 Git 저장소가 아니므로 자동 커밋은 진행할 수 없다.
- 사용자 요청은 “단계마다 폴더를 만들고 빈칸을 채울 수 있는 학습 코드”이므로, 완성형 앱보다 문제집형 starter code를 우선한다.
- 초급 학습자가 접근하기 쉽도록 1~2단계는 브라우저에서 바로 열 수 있는 HTML/CSS/JS 중심으로 만들고, 3단계부터 npm 프로젝트 형태를 사용한다.
- 새 source 파일에는 첫 줄에 해당 파일의 역할을 설명하는 한국어 주석을 둔다.
- npm 레지스트리에서 2026-05-19 기준 주요 패키지 버전을 확인했다.
- React는 19.2.6, Vite는 8.0.13, Express는 5.2.1, Mongoose는 9.6.2, dotenv는 17.4.2를 기준으로 package.json을 작성했다.
- 빈칸 실습 코드는 학습자가 직접 고치도록 일부 기능이 의도적으로 완성되지 않은 상태다.
- 루트 검증 스크립트는 앱 빌드가 아니라 필수 파일, 빈칸 표시, 새 source 파일의 한국어 첫 줄 주석을 확인한다.
- `npm run verify` 실행 결과 워크북 구조 검증이 통과했다.
- JSX가 아닌 JavaScript 파일은 `node --check`로 문법 검사를 통과했다.
- React 앱 빌드는 의존성을 설치하지 않았고, 학습용 빈칸을 유지하기 위해 이번 검증 범위에서 제외했다.
- 사용자의 재검토 요청에 따라 “구조가 있음”에서 “취업 준비 교재로 공부 가능함”으로 기준을 올렸다.
- NCS 공정채용 안내에서 직무능력 중심 평가를 확인했고, 루트에 `career-roadmap.md`를 추가했다.
- 각 단계에 `answers.md`를 추가해 학습자가 혼자 막혔을 때 정답 예시와 자기 점검 기준을 확인할 수 있게 했다.
- `npm run progress` 명령을 추가해 남은 빈칸 개수를 단계별로 확인할 수 있게 했다.
- `student-checklist.md`는 학습자가 직접 진행 상황을 체크하기 위한 파일이다.
- `portfolio-template.md`는 각 단계 결과를 GitHub 포트폴리오로 정리하기 위한 템플릿이다.
- `.gitignore`를 추가해 `node_modules`, `dist`, `.env`가 학습 원본과 섞이지 않게 했다.
- 3~7단계 의존성 설치를 확인했고, 생성된 `package-lock.json`은 재현 가능한 설치를 위해 남겼다.
- `03-react-todo`는 `npm run build`로 빌드 성공을 확인했다.
- `04-node-board-api`, `06-login-auth`, `07-project-deploy`는 서버를 실행하고 health API 응답을 확인했다.
- `05-database-mongodb` 서버 실행은 실제 MongoDB 연결 주소가 필요하므로 health 실행 검증에서는 제외했다.
- 검증 후 생성된 `node_modules`와 `03-react-todo/dist`는 원본 워크북을 깨끗하게 유지하기 위해 삭제했다.
- 사용자 재요청에 따라 `references.md`를 다시 확인하고 OWASP 비밀번호 저장 가이드와 Q-Net 정보처리기사 공식 정보를 추가했다.
- `review-report.md`를 추가해 7개 단계가 어떤 기준으로 검토되었는지 남겼다.
- 2026-05-19에 공식 문서 링크를 재확인했다. 확인 범위는 MDN, React, Node.js, Express, MongoDB, Mongoose, OWASP, Render, Vercel, Git, NCS, Q-Net이다.
- 재검증을 위해 3~7단계에서 `npm ci --ignore-scripts --no-audit --no-fund`를 실행했다.
- `03-react-todo`는 `npm run build` 재검증을 통과했다.
- `04-node-board-api`, `06-login-auth`, `07-project-deploy`는 health API 재검증을 통과했다.

## 2026-05-19 (재검토 및 학습 동선 수정)

- "쉽고 잘 공부할 수 있게" 기준으로 7개 단계를 전수 재검토했다.
- 패키지 버전을 npm 레지스트리에서 직접 재확인했고, 모든 버전이 실제 최신과 일치해 `npm install`에 문제없음을 확인했다 (수정 불필요).
- 모든 `answers.md` 정답 코드가 문법·로직상 올바름을 코드 정독으로 확인했다.
- 핵심 원칙을 "파일을 위→아래로 읽으면 빈칸 번호가 순서대로 올라가고, problems·answers가 같은 번호를 가리킨다"로 정했다.
- 1·2단계는 이미 번호 정렬이 맞아 수정하지 않았다 (불필요한 변경 회피).
- 3단계: App.jsx 빈칸을 물리적 순서대로 1~6 재번호, 번호 없던 두 빈칸(입력 저장·토글 연결)에 라벨 추가. problems/answers를 빈칸 순서로 재정렬.
- 5단계: problems.md 문제1이 모델 빈칸을 채우라고 지시하지 않던 누락을 보강.
- 6단계: problems.md에 누락돼 있던 빈칸 2(이름 기본값) 문제를 추가. 코드 번호는 인증 흐름 순서라 유지.
- 7단계: app.js가 1,2,3→7,8,9으로 건너뛰던 것을 app.js 1~6 / server.js 7~9로 재번호.
- 4단계: 코드 번호는 양호해 problems/answers에 빈칸 번호 표기만 통일.
- check-progress.js는 "빈칸 단어가 있고 ____ 없는 줄 +1, ____ 있는 줄 +개수" 규칙이라, 안내 주석을 별도 줄에 두면 한 빈칸이 두 번 세진다. 그래서 3단계 안내 주석에서 '빈칸' 단어를 빼고 번호 라벨을 ____ 줄에 인라인으로 두어 총합 61개를 유지했다.
- 최종 검증: `npm run verify` 통과, `npm run progress` 61개 유지, 일반 JS 전부 `node --check` 통과, 3단계는 실제 `vite build` 성공으로 JSX 문법 확인 후 산출물 삭제.

## 2026-05-19 (실행 검증 + 참고 자료)

- 사용자가 "진짜 완벽한지" 재확인을 요구해, 구조 검증을 넘어 7개 단계를 실제로 실행해 검증했다.
- 정답을 채운 사본을 `/tmp`에 만들어(원본은 빈칸 유지) 검증 후 삭제했다.
- 4단계: 서버 실행 후 health/목록/생성/단건/수정/404/204/삭제를 curl로 호출해 전부 정상 확인.
- 6단계: register(passwordHash 미노출, 기본이름 "학습자" 적용=지난번 보강한 빈칸2 실측 확인), 중복 409, 오답 401, 로그인 토큰, /me 401/200 전부 정상.
- 7단계: health/정적 index.html/app.js 정답반영/기본글/POST(author 기본값 "익명")/맨위 추가 전부 정상.
- 5단계: MongoDB 미설치라 라이브 불가 → 정답본 `node --check` 통과 확인 + 잘못된 URI로 실행 시 `MongooseServerSelectionError: connect ECONNREFUSED ... db.js:7` 에러를 실측해 문제5(오류 읽기)가 의도대로 동작함을 확인. 그 에러 문자열을 answers.md에 명시.
- 2단계: calculate 함수 정답 로직을 node로 단위 검증(사칙연산·0나누기·미지원 연산자) 전부 통과.
- 1단계: 7개 단계 중 유일하게 인라인 힌트가 없어, CSS `____` 줄에 같은 줄 힌트 주석을 추가(같은 줄이라 progress 집계 17개 불변)하고 HTML 이미지에 힌트 1줄 추가.
- `references.md` 신설: 단계별 공식 문서(한국어 우선) + 에러 읽는 법 표 + 공부 루틴. 23개 링크를 curl로 생존 확인(expressjs.com 심층 경로는 봇 차단으로 불안정 → MDN Express 한국어 튜토리얼로 대체). README와 verify-workbook requiredPaths에 연결.
- macOS에는 `timeout`이 없어 백그라운드 실행+sleep+pkill 방식으로 서버를 검증했다(다음에 참고).

## 2026-05-19 (로컬 MongoDB 사용법 + 5단계 실제 DB 실측)

- 사용자 요청으로 5단계 README에 로컬 MongoDB 설치·실행법을 추가했다. 방법 A(macOS Homebrew), B(Windows 설치 프로그램), C(Docker 한 줄), D(Atlas 클라우드)와 실행/확인/연결 실패 대처를 모두 포함했다.
- references.md 5단계 항목에 MongoDB 설치(mac/Win), Atlas, mongosh, Compass 링크를 추가하고 전부 curl 200 확인했다.
- 지난번 "5단계만 라이브 미실측" 공백을 닫았다. 시스템에 MongoDB를 영구 설치하지 않기 위해 Docker(데몬 꺼져 있어 불가) 대신 `mongodb-memory-server`를 임시 폴더(`MONGOMS_DOWNLOAD_DIR`)에 받아 인메모리 mongod로 검증했다.
- 5단계 실측 결과: 연결, 생성(작성자 미입력 시 기본값 "익명"), 목록, id 단건 조회, timestamps(createdAt/updatedAt 자동 생성), 수정(PUT), 삭제(204), 없는 id 404, **서버 재시작 후 데이터 영속** 전부 통과.
- 검증 후 임시 폴더·프로세스·다운로드 바이너리를 모두 삭제했다. 홈 캐시·27017 포트·시스템 MongoDB 무영향 확인. 원본 워크북에 잔여물 없음.
- 주의: 05 package.json이 `"type":"module"`이라 검증용 러너 스크립트는 `.cjs` 확장자로 만들어야 했다(node v26).

## 2026-05-19 (취업용 포트폴리오 미니 프로젝트)

- 사용자가 fullstack 취업용 포트폴리오 미니 프로젝트 생성을 요청했다.
- 학습용 빈칸 프로젝트와 구분하기 위해 새 폴더를 `08-fullstack-portfolio-project`로 만든다.
- 주제는 SI/SW 취업 준비자에게 설명하기 쉬운 Career Hub로 정했다. 지원 현황과 포트폴리오 프로젝트를 관리하는 앱이다.
- 외부 DB 설치 없이 바로 실행 가능하도록 JSON 파일 저장소를 사용한다. 대신 저장소 계층을 따로 두어 나중에 MongoDB나 PostgreSQL로 바꾸기 쉽게 만든다.
- 포트폴리오 평가 포인트는 React 컴포넌트, Express REST API, JWT 인증, CRUD, 데이터 영속성, README, 검증 스크립트로 둔다.
- 2026-05-19 기준 npm 레지스트리에서 React 19.2.6, Vite 8.0.13, Express 5.2.1, lucide-react 1.16.0, concurrently 9.2.1, bcryptjs 3.0.3, jsonwebtoken 9.0.3, dotenv 17.4.2, cors 2.8.6을 확인했다.
- `08-fullstack-portfolio-project`에 Career Hub 앱을 구현했다.
- 구현 범위는 회원가입, 로그인, JWT 인증, 지원 현황 CRUD, 포트폴리오 프로젝트 CRUD, 대시보드 지표, JSON 파일 저장소, API smoke test다.
- `npm install --ignore-scripts --no-audit --no-fund`로 새 프로젝트 의존성 설치를 확인했다.
- `npm run build`, `npm run test:api`, `npm run verify`를 새 프로젝트에서 통과했다.
- 루트 `npm run verify`도 8번째 프로젝트 필수 파일을 포함하도록 보강하고 통과시켰다.
- 빌드된 Express 서버에서 `/api/health`, `/`, 데모 로그인 API를 curl로 확인했다.
- Browser 플러그인 안내는 읽었지만 현재 세션에는 전용 브라우저 제어 도구가 노출되어 있지 않아, Vite build와 서버 curl 검증으로 대체했다.
- 개발 서버를 `npm run dev`로 시작했다. 프론트엔드는 `http://127.0.0.1:5173/`, API는 `http://localhost:5100`에서 실행 중이다.
- 사용자가 기존 1~7단계 프로그램이 포트폴리오 프로젝트에 어떻게 사용되는지 연결해달라고 요청했다.
- Career Hub 앱에 `학습 연결` 탭을 추가해 1~7단계가 UI, 이벤트, React, API, 저장소, 인증, 배포 준비에 어떻게 쓰였는지 화면에서 확인할 수 있게 했다.
- `08-fullstack-portfolio-project/learning-map.md`를 추가해 GitHub README와 면접 답변에 쓸 수 있는 연결표를 만들었다.
- `08-fullstack-portfolio-project/README.md`와 루트 `README.md`에도 learning-map 링크를 연결했다.
- 학습 연결 반영 후 `npm run build`, `npm run test:api`, `npm run verify`, 루트 `npm run verify`가 모두 통과했다.
- 개발 서버에서 `/src/App.jsx`에 `학습 연결` 탭 코드가 제공되고 `/api/health`가 정상 응답함을 확인했다.

## 2026-05-19 (08 포트폴리오 프로젝트 재검토 + CORS 함정 제거)

- 사용자가 08 프로젝트를 "쉽고 잘 공부, 완벽히 수정" 기준으로 재검토 요청.
- 실측으로 치명 버그 확인: README/`dev:web`은 프론트를 `http://127.0.0.1:5173`로 띄우는데 서버 CORS는 `http://localhost:5173`만 허용 → 브라우저가 `127.0.0.1`에서 접속하면 데모 로그인부터 CORS 차단. curl preflight로 `Access-Control-Allow-Origin: http://localhost:5173` 가 127.0.0.1 페이지와 불일치함을 직접 확인.
- 7단계에서 가르친 같은-출처 원리로 해결: vite.config.js에 `/api` → 5100 프록시 추가, App.jsx `API_BASE` 기본값을 `""`(상대 경로)로 변경. 브라우저는 항상 자기 출처만 호출 → CORS 문제 자체가 사라짐. 배포 시에도 Express가 같은 출처로 /api 처리라 일관.
- 방어적으로 서버 CORS를 함수형으로 바꿔 localhost·127.0.0.1 양쪽과 Origin 없는 요청(curl/smoke) 허용.
- 빌드 전에 `npm start` 하면 raw 500 대신 503 + 한국어 안내가 나오도록 dist 존재 가드 추가(초보자 막힘 제거).
- `dev:web`을 `vite --host 127.0.0.1` → `vite`로 단순화. README/.env.example을 프록시 구조에 맞게 일관 정리(기본 주소 localhost:5173 명시).
- 실측 검증: `npm run build`·`npm run test:api`·`npm run verify`(프로젝트), 루트 `npm run verify` 모두 통과. `npm run dev` 실행 후 브라우저와 동일 경로 `http://localhost:5173/api/...`로 health·데모 로그인(토큰 발급, passwordHash 미노출)·보호 API(dashboard)·무토큰 401 전부 정상. 빌드 전/후 `npm start` 가드(503)와 정상(200 html) 동작 확인.
- 08은 사용자가 실제 개발 중인 프로젝트라 node_modules를 삭제하지 않았다(1~7 검증 사본과 다름). career-hub.json 시드 데이터 원형 유지 확인. /tmp 검증 파일 정리.
