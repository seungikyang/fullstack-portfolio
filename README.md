# 풀스택 개발 학습 문제집

SI/SW 업체(특히 Java/Spring 중심 대형 SI) 취업을 목표로 풀스택 기초부터 실무 협업까지 단계별로 익히는 실습형 워크북입니다.

세 트랙으로 나뉩니다. 1~8번은 풀스택 기초·통합 트랙, 9~14번은 채용 공고에 맞춰 선택하는 실전 보강 트랙, 15~17번은 CS·보안·면접 정리 트랙입니다. 추가로 `monorepo-mini-app`은 가상환경(Dev Container)에서 동작하는 TypeScript 모노레포 데모입니다.

각 단계는 설명만 읽는 방식이 아니라, 코드 안의 `빈칸`, `TODO`, `____`를 직접 채우며 공부하도록 구성했습니다.

> 처음 왔다면 [HTML 학습 목차](./index.html)를 열어 남은 기간에 맞는 경로를 고르세요. 목표 직무와 첫 지원일은 [START-HERE.md](./START-HERE.md)에 적습니다.

## 사용 방법

1. [HTML 학습 목차](./index.html)에서 전체 흐름을 보고 [START-HERE.md](./START-HERE.md)에 목표를 적습니다.
2. 단계별 `README.md`와 `problems.md`를 보고 `starter` 또는 `src` 폴더의 빈칸을 채웁니다.
3. 브라우저 또는 npm 명령으로 실행해 결과를 확인합니다.
4. 막히면 `hints.md`의 1단계부터 한 단계씩 보고, 그래도 풀리지 않을 때만 `answers.md`와 비교합니다.
5. [student-checklist.md](./student-checklist.md)를 체크하고 실행 명령·관찰 결과·해결한 오류·코드 위치를 기록합니다.

## 폴더부터 실무까지 (공부 순서)

이 저장소는 폴더 번호 순서대로 따라가면 "기초 → 통합 → 취업 제출"로 이어지도록 설계했습니다. 한 번에 다 보지 말고 아래 순서로만 진행하세요.

| 순서 | 폴더                             | 여기서 손에 넣는 실무 능력                                                       |
| ---- | -------------------------------- | -------------------------------------------------------------------------------- |
| 1    | `01-html-css`                    | 화면을 시맨틱 태그와 반응형 CSS로 짜는 능력                                      |
| 2    | `02-javascript-basics`           | 입력·이벤트·배열을 다뤄 화면을 움직이는 능력                                     |
| 3    | `03-react-todo`                  | 컴포넌트·state·props로 화면을 구조화하는 능력                                    |
| 4    | `04-node-board-api`              | Express로 REST API와 HTTP 상태 코드를 다루는 능력                                |
| 5    | `05-database-mongodb`            | 데이터를 DB에 저장·조회·수정·삭제하는 능력                                       |
| 6    | `06-login-auth`                  | 비밀번호 해시와 JWT로 인증을 구현하는 능력                                       |
| 7    | `07-project-deploy`              | 프론트·백을 연결하고 배포를 준비하는 능력                                        |
| 8    | `08-fullstack-portfolio-project` | 1~7을 하나의 제출용 fullstack 앱으로 통합하는 능력                               |
| 9    | `09-typescript`                  | 코드에 정적 타입을 입혀 컴파일 시점에 오류를 잡는 능력                           |
| 10   | `10-sql-oracle`                  | Oracle/MySQL 기반 RDBMS에서 JOIN·집계·트랜잭션을 다루는 능력                     |
| 11   | `11-java-spring`                 | Spring Boot로 Controller·Service·Repository 계층을 분리한 REST API를 만드는 능력 |
| 12   | `12-testing`                     | Vitest와 JUnit으로 단위·통합 테스트를 작성하는 능력                              |
| 13   | `13-git-collab`                  | feature 브랜치·PR·충돌 해결로 팀 협업 흐름을 따르는 능력                         |
| 14   | `14-docker-deploy`               | Docker로 앱을 패키징하고 GitHub Actions로 CI 파이프라인을 구성하는 능력          |
| 15   | `15-cs-fundamentals`             | 네트워크·OS·DB이론·자료구조 기본기를 자기 말로 설명하는 능력                     |
| 16   | `16-security`                    | XSS·SQL Injection·CSRF·CORS·OWASP Top 10의 방어 코드를 작성하는 능력             |
| 17   | `17-interview-prep`              | 1~16단계 학습을 면접 답변으로 통합·연습하는 능력                                 |

1~8번은 풀스택 앱 한 개를 직접 실행하는 기초 트랙입니다. 9~14번은 목표 공고에서 요구하는 TypeScript·SQL·Spring·테스트·협업·Docker 근거를 보강하는 트랙입니다. 15~17번은 학습 결과를 CS·보안·면접 답변으로 정리하는 트랙입니다. 모든 단계를 끝냈다는 사실만으로 채용 결과가 보장되지는 않으므로, 지원 일정과 공고에 맞춰 우선순위를 조정합니다.

진행 방식은 단계마다 똑같습니다.

1. **공부**. 폴더의 `README.md`를 읽고 `problems.md`에서 문제를 확인한 뒤 상단의 실습 파일 링크로 실제 `starter`·`src` 코드를 열어 빈칸을 직접 채웁니다. 막히면 `references.md`의 "에러 읽는 법"과 `hints.md`의 1~3단계를 순서대로 보고, 그래도 풀리지 않을 때만 `answers.md`와 비교합니다.
2. **통합**. 1~7을 끝내면 `08-fullstack-portfolio-project`를 실행해 배운 것이 실제 앱의 어디에 쓰였는지 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)로 확인합니다.
3. **제출**. 8번을 GitHub에 올리고 [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md)의 문장으로 이력서·자기소개서를 작성합니다. 올리기 전 [submission-checklist.md](./08-fullstack-portfolio-project/submission-checklist.md)로 점검합니다.
4. **설명**. 실행 명령, 관찰 결과, 해결한 오류, 코드 위치를 근거로 "내가 직접 고친 코드 한 줄"과 "1~7이 8에 어떻게 연결됐는지"를 자기 말로 설명합니다.

> 막히는 게 정상입니다. 추측으로 고치지 말고 에러 메시지를 먼저 읽으세요. 그 습관 자체가 SI/SW 면접에서 평가받는 실무 능력입니다.

## 부가 프로그램

- [monorepo-mini-app/](./monorepo-mini-app/) — DevContainer 가상환경에서 동작하는 npm workspaces + TypeScript 풀스택 모노레포 데모(Note Hub). 8번 Career Hub와 독립적인 별도 프로그램으로, "프론트엔드와 백엔드가 같은 타입을 공유한다"는 모노레포의 핵심 가치를 시연합니다.

## 먼저 읽을 파일

- [index.html](./index.html)은 추천 경로, 17단계 학습 자료, 폴더별 실행·검증 지도, 취업 준비 문서를 클릭해서 이동하는 단일 HTML 목차입니다.
- [START-HERE.md](./START-HERE.md)는 목표 직무와 지원 시기에 따라 첫 학습 경로를 정하는 단일 시작점입니다.
- [history.html](./history.html)은 취업 워크북 개선의 배경, 구현 내용, 검증 결과를 정리한 변경 이력입니다.
- [folder-to-practice-guide.md](./folder-to-practice-guide.md)는 1~17번 폴더를 실행 근거, Career Hub, 이력서 제출까지 연결하는 핵심 안내서입니다.
- [feature-implementation-workbook.md](./feature-implementation-workbook.md)는 모든 기능 구현을 개념 빈칸, 구현 TODO, 검증 명령, 면접 설명으로 다시 채우는 종합 워크북입니다.
- [career-roadmap.md](./career-roadmap.md)는 SI/SW 취업 준비 관점의 전체 로드맵입니다.
- [references.md](./references.md)는 단계별 공식 문서, 에러 읽는 법, 공부 루틴을 모은 자료입니다.
- [student-checklist.md](./student-checklist.md)는 학습자가 직접 체크하는 진행표입니다.
- [portfolio-template.md](./portfolio-template.md)는 GitHub README 작성 템플릿입니다.

## 단계 구성

| 단계       | 폴더                             | 목표                                         |
| ---------- | -------------------------------- | -------------------------------------------- |
| 1단계      | `01-html-css`                    | 자기소개 페이지 만들기                       |
| 2단계      | `02-javascript-basics`           | 버튼 이벤트와 계산기 만들기                  |
| 3단계      | `03-react-todo`                  | React Todo 앱 만들기                         |
| 4단계      | `04-node-board-api`              | Express 게시판 API 만들기                    |
| 5단계      | `05-database-mongodb`            | MongoDB CRUD 연결하기                        |
| 6단계      | `06-login-auth`                  | 회원가입과 로그인 구현하기                   |
| 7단계      | `07-project-deploy`              | 미니 프로젝트 완성 후 배포 준비하기          |
| 포트폴리오 | `08-fullstack-portfolio-project` | 취업 제출용 fullstack 미니 프로젝트          |
| 9단계      | `09-typescript`                  | React/Express에 TypeScript 적용하기          |
| 10단계     | `10-sql-oracle`                  | Oracle SQL로 JOIN·집계·트랜잭션 실습         |
| 11단계     | `11-java-spring`                 | Spring Boot로 4단계 게시판 API 다시 만들기   |
| 12단계     | `12-testing`                     | Vitest와 JUnit으로 자동화 테스트 작성        |
| 13단계     | `13-git-collab`                  | 브랜치 전략, PR 리뷰, 충돌 해결              |
| 14단계     | `14-docker-deploy`               | Docker 컨테이너화와 GitHub Actions CI        |
| 15단계     | `15-cs-fundamentals`             | CS 기초 21문제 자기 답안 작성                |
| 16단계     | `16-security`                    | OWASP Top 10과 XSS·SQLi·CSRF 방어 코드       |
| 17단계     | `17-interview-prep`              | 1~16단계 면접 카드 통합과 자기소개·STAR 답안 |

모든 단계에는 목표와 실행 방법을 설명하는 `README.md`가 있습니다. 표준 실습 단계는 `problems.md` → `hints.md` → `answers.md`와 `starter` 또는 `src`를 함께 제공하지만 단계 성격에 따라 구성이 다릅니다.

- 8단계는 실행 가능한 Career Hub와 `learning-map.md`, `resume-assets.md`, `submission-checklist.md`를 중심으로 구성됩니다.
- 15단계는 CS 질문·답안 문서, 17단계는 면접 카드·자기소개·STAR·프로젝트 설명 템플릿이 중심입니다.
- 11단계 Spring과 14단계 Docker는 README에 적힌 원본 프로젝트 준비 조건을 먼저 충족해야 합니다.

## 실행 안내

### Orca에서 문제집 목차 열기

저장소 루트에서 다음 서버를 실행하면 폴더 이름을 포함한 고정 주소로 문제집 목차를 열 수 있습니다.

```bash
npm run serve:workbook
# http://127.0.0.1:4187/fullstack/
```

서버를 실행한 터미널은 학습하는 동안 그대로 둡니다. 저장소 폴더 이름이 `fullstack`이므로 문제집 주소는 항상 `http://127.0.0.1:4187/fullstack/`입니다. 루트 주소 `http://127.0.0.1:4187/`로 접속해도 같은 주소로 이동하며, 서버는 상위 폴더가 아니라 이 저장소 내부 파일만 제공합니다.

목차의 `README.md`, `problems.md`, `hints.md`, `answers.md` 링크는 같은 서버에서 읽기 쉬운 HTML 문서로 표시됩니다. 표·코드·체크리스트와 문서 안 상대 링크·제목 앵커를 유지하며, 원문 HTML은 정화하고 Content Security Policy를 적용합니다.

코드형 문제의 `problems.md` 상단에는 실제 실습 파일 링크가 있습니다. `?view=source`가 붙은 링크에서는 문제에 연결된 실습 파일 50개를 웹에서 직접 수정하고 `파일 저장` 또는 `Ctrl/Command + S`로 같은 로컬 파일에 저장할 수 있습니다. 저장하지 않은 변경은 상태 문구와 페이지 이탈 경고로 알려주며, 편집 화면 아래의 접힌 패널에서 `hints.md`의 1~3단계 힌트와 `answers.md`의 정답 예시를 순서대로 확인할 수 있습니다.

웹 저장은 문제에 연결된 50개 파일만 허용합니다. 편집 중 다른 프로그램이 같은 파일을 바꾸면 이전 내용을 덮어쓰지 않고 충돌을 알리므로 `저장 내용 다시 불러오기`로 최신 파일을 확인한 뒤 다시 수정하세요. 저장 요청이 진행되는 동안 계속 입력한 내용은 저장 완료로 잘못 표시하지 않고 남은 변경으로 유지하므로, 첫 저장이 끝난 뒤 한 번 더 저장할 수 있습니다. 웹에서 저장한 내용은 Git이 추적하는 실제 학습 파일에 반영됩니다. 11단계는 Spring 프로젝트 생성 안내로 연결하고, 13단계와 15단계는 각각 명령·협업형과 서술형 문제로 구분합니다.

Orca 앱 번들의 공식 CLI로 새 탭을 만들 때는 루트에서 다음 명령을 실행합니다.

```bash
/Applications/Orca.app/Contents/Resources/bin/orca tab create --url http://127.0.0.1:4187/fullstack/
```

1단계와 2단계는 HTML 파일을 브라우저로 열면 됩니다. OS별로 명령이 다릅니다.

```bash
# macOS
open 01-html-css/starter/index.html

# Linux
xdg-open 01-html-css/starter/index.html

# Windows (cmd / PowerShell / Git Bash 공통)
start 01-html-css/starter/index.html
```

03~09의 npm 기반 코드 단계와 16단계 보안 실습은 각 폴더에서 의존성을 설치한 뒤 실행합니다. 10~17단계에는 SQL 실행, 사용자가 직접 만드는 Spring 프로젝트, 테스트, Git 협업, Docker, 답안·면접 녹음처럼 서로 다른 검증 방식이 있으므로 [HTML 실행 지도](./index.html#run-map)의 단계별 조건을 먼저 확인합니다.

```bash
cd 03-react-todo
npm install
npm run dev
```

취업 제출용 포트폴리오 프로젝트는 다음처럼 실행합니다.

```bash
cd 08-fullstack-portfolio-project
npm install
# macOS / Linux / Git Bash
cp .env.example .env
# Windows cmd:        copy .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

모노레포 데모(Note Hub)는 별도 폴더에서 실행합니다. 자세한 옵션(인메모리/Postgres/운영 컨테이너)은 [monorepo-mini-app/README.md](./monorepo-mini-app/README.md)에 있습니다.

```bash
cd monorepo-mini-app
npm install
npm run dev # predev가 shared 패키지를 먼저 빌드
# API: http://localhost:5200, Web: http://localhost:5174
```

Note Hub의 무토큰 개발 모드는 로컬 학습 전용입니다. 공개 운영에서는 32자 이상의 `NOTE_HUB_ACCESS_TOKEN`이 없으면 시작을 거부하고 노트 API에 Bearer 인증을 요구합니다.

루트 명령은 구조 검증과 학습 진행 확인을 구분합니다.

```bash
npm run verify:structure # 저장소 구조와 필수 파일 검사. npm run verify와 동일
npm run verify:programs  # 미완성 빈칸과 무관한 03 build, 02·04~07·16 문법 검사
npm run progress         # starter 소스의 전용 ____ 토큰과 체크리스트 진행률 보고
npm run verify:learning  # 전용 ____ 토큰과 체크리스트를 모두 완료했는지 검사
```

`npm run verify`는 `verify:structure`의 별칭이며 학습 완료를 뜻하지 않습니다. `verify:programs`도 학습 답안을 채우기 전 통과할 수 있는 빌드·문법 검사만 실행합니다. `progress`는 지정된 starter 소스의 전용 `____` 토큰과 체크리스트 전체를 함께 집계합니다. `verify:learning`은 토큰이 0개이고 체크리스트가 전부 완료됐을 때만 통과합니다. 일반 `TODO`나 서술형 답안의 내용 자체는 자동 판정할 수 없으므로 단계별 실행 결과와 답안은 체크리스트의 취업 증거 표에 직접 기록합니다.

`.github/workflows/ci.yml`로 main 푸시·PR마다 GitHub Actions가 루트 구조·학습자 안전 프로그램 검사, Career Hub의 포맷·lint·테스트·빌드·제출 감사와 Docker health, Note Hub의 포맷·lint·typecheck·테스트·빌드와 인증된 Postgres Docker smoke를 자동 확인합니다. CI 통과는 현재 자동화 범위의 통과를 뜻하며 모든 학습 빈칸이나 실제 외부 배포 품질을 보증하지 않습니다.

지정된 starter 소스의 남은 전용 `____` 토큰과 체크리스트 진행률은 루트 폴더에서 확인합니다.

```bash
npm run progress
```

## 학습 팁

- 처음에는 정답을 외우기보다 화면과 데이터가 어떻게 연결되는지 말로 설명해보세요. 예시 답변: 사용자가 입력하고 버튼을 누르면 이벤트 핸들러가 값을 읽고, state를 바꾸거나 API 요청을 보내며, 서버 응답을 받은 뒤 화면을 다시 렌더링합니다.
- 빈칸을 채운 뒤에는 일부러 값을 바꿔보며 결과가 어떻게 달라지는지 확인하세요.
- SI/SW 실무에서는 “작게 만들고 실행해 확인하는 습관”이 중요합니다.
- 각 단계가 끝날 때마다 GitHub에 올릴 README 문장 3개를 적어보세요.
- 면접에서는 완벽한 암기보다 직접 만든 기능을 정확히 설명하는 힘이 중요합니다.
- 막히면 추측하지 말고 [references.md](./references.md)의 "에러 읽는 법"을 먼저 보세요.

## 권장 개발 환경

가장 빠른 방법은 **가상 개발환경(Dev Container)** 입니다. 학습자마다 OS·Node 버전·Java 버전이 달라서 막히는 일을 없애려고 추가했습니다.

### 옵션 A. VS Code Dev Container (권장, 가장 최신)

1. [Docker Desktop](https://www.docker.com/products/docker-desktop)과 VS Code의 "Dev Containers" 확장을 설치합니다.
2. 이 폴더를 VS Code에서 연 뒤 명령 팔레트 → "Dev Containers: Reopen in Container".
3. 컨테이너가 빌드되면 자동으로 Node 24.19 LTS + JDK 25 LTS + Gradle + Docker-in-Docker가 준비됩니다.
4. 9번 TypeScript, 11번 Spring Boot, 14번 Docker, 8번 포트폴리오까지 추가 설치 없이 바로 실행됩니다.

### 옵션 B. GitHub Codespaces

저장소를 GitHub에 올린 뒤 "Code → Codespaces → Create"를 누르면 같은 Dev Container가 클라우드에서 뜹니다. 브라우저만 있으면 됩니다.

### 옵션 C. mise (도구 버전만 관리)

로컬에 설치된 환경을 쓰되 도구 버전만 통일하려면 [mise](https://mise.jdx.dev)를 설치한 뒤 저장소 루트에서 `mise install`을 실행합니다. `mise.toml`에 정의된 Node·Java·Gradle 버전이 자동으로 설치됩니다.

### 옵션 D. 직접 설치 (가장 전통적)

Node.js가 아직 없다면 아래 순서로 먼저 설치합니다.

1. [nodejs.org](https://nodejs.org/ko)에 접속해 **LTS** 버튼으로 내려받은 설치 파일(24.x)을 실행합니다. Windows·macOS 모두 설치 프로그램의 기본 선택 그대로 다음만 눌러도 됩니다.
2. 터미널(macOS는 Terminal, Windows는 PowerShell)을 열어 두 명령이 버전 숫자를 출력하는지 확인합니다. 숫자가 보이면 준비 완료입니다.

   ```bash
   node -v # v24.19.0처럼 보이면 성공
   npm -v
   ```

설치 후 프로젝트 폴더에서 실습을 진행합니다.

- Node.js 24.19 LTS 이상을 권장합니다. 8번 포트폴리오 프로젝트의 Vite 8 요구 사항도 충족합니다.
- 9번 TypeScript 단계는 같은 Node 버전이면 됩니다.
- 10번 SQL 단계는 Oracle Live SQL(브라우저 사용) 또는 Oracle XE/MySQL 로컬 설치 중 하나가 필요합니다.
- 11번 Spring Boot 단계는 JDK 25 LTS와 Gradle wrapper가 필요합니다(`brew install openjdk@25`).
- 12번 테스트 단계는 추가 설치가 거의 없습니다. Vitest와 JUnit은 각 프로젝트 의존성으로 들어갑니다.
- 13번 Git 협업 단계는 GitHub 계정과 두 개의 로컬 클론으로 진행합니다.
- 14번 Docker 단계는 Docker Desktop과 컨테이너화할 원본 코드가 필요합니다. Node 실습은 완성한 4단계의 `package.json`, `package-lock.json`, `src`를 복사하고, Spring 실습은 11단계에서 직접 만든 `starter/board-api`를 사용합니다.
- 15번 CS 기초 단계는 별도 설치 없이 질문에 자기 답안을 작성하는 흐름입니다.
- 16번 보안 단계는 별도 npm 실습입니다. `16-security`에서 `npm install`과 `npm run check`를 먼저 실행하며, SQL Injection 실습에만 로컬 MySQL 또는 Docker MySQL이 추가로 필요합니다.
- 17번 면접 대비 단계는 마크다운 카드를 채우는 흐름입니다.
- VS Code와 REST Client 확장을 쓰면 `requests.http` 파일로 API를 쉽게 테스트할 수 있습니다.
- MongoDB 단계는 로컬 MongoDB 또는 MongoDB Atlas 중 하나가 필요합니다.
- 실제 제출용 프로젝트는 `08-fullstack-portfolio-project`부터 먼저 완성해 GitHub에 올려도 좋습니다.
- 포트폴리오 프로젝트의 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)를 보면 1~7단계 코드가 실제 프로젝트 기능으로 어떻게 연결됐는지 확인할 수 있습니다.
- 이력서·지원서용 문장은 [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md)에 정리했습니다.

14번과 16번의 자세한 실행 전제는 각 단계 README에서 확인합니다.

```bash
# 14번은 완성한 4번/11번 소스를 준비한 뒤 진행
open 14-docker-deploy/README.md

# 16번 공통 준비
cd 16-security
npm install
npm run check
```
