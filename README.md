# 풀스택 개발 학습 문제집

SI/SW 업체(특히 Java/Spring 중심 대형 SI) 취업을 목표로 풀스택 기초부터 실무 협업까지 단계별로 익히는 실습형 워크북입니다.

세 트랙으로 나뉘어 있습니다: 1~8번은 풀스택 기초·통합 트랙, 9~14번은 SI 채용 실전 보강 트랙, 15~17번은 채용 직전(CS·보안·면접) 마감 트랙입니다. 추가로 `monorepo-mini-app`은 가상환경(DevContainer) 위에서 동작하는 TypeScript 모노레포 데모입니다.

각 단계는 설명만 읽는 방식이 아니라, 코드 안의 `빈칸`, `TODO`, `____`를 직접 채우며 공부하도록 구성했습니다.

## 사용 방법

1. 단계별 `README.md`를 먼저 읽습니다.
2. `problems.md`의 문제를 보고 `starter` 또는 `src` 폴더의 빈칸을 채웁니다.
3. 브라우저 또는 npm 명령으로 실행해 결과를 확인합니다.
4. 막히면 `answers.md`를 보고 어느 부분을 놓쳤는지 비교합니다.
5. 다시 코드를 직접 고쳐보고 자기 말로 설명합니다.

## 폴더부터 실무까지 (공부 순서)

이 저장소는 폴더 번호 순서대로 따라가면 "기초 → 통합 → 취업 제출"로 이어지도록 설계했습니다. 한 번에 다 보지 말고 아래 순서로만 진행하세요.

| 순서 | 폴더 | 여기서 손에 넣는 실무 능력 |
| --- | --- | --- |
| 1 | `01-html-css` | 화면을 시맨틱 태그와 반응형 CSS로 짜는 능력 |
| 2 | `02-javascript-basics` | 입력·이벤트·배열을 다뤄 화면을 움직이는 능력 |
| 3 | `03-react-todo` | 컴포넌트·state·props로 화면을 구조화하는 능력 |
| 4 | `04-node-board-api` | Express로 REST API와 HTTP 상태 코드를 다루는 능력 |
| 5 | `05-database-mongodb` | 데이터를 DB에 저장·조회·수정·삭제하는 능력 |
| 6 | `06-login-auth` | 비밀번호 해시와 JWT로 인증을 구현하는 능력 |
| 7 | `07-project-deploy` | 프론트·백을 연결하고 배포를 준비하는 능력 |
| 8 | `08-fullstack-portfolio-project` | 1~7을 하나의 제출용 fullstack 앱으로 통합하는 능력 |
| 9 | `09-typescript` | 코드에 정적 타입을 입혀 컴파일 시점에 오류를 잡는 능력 |
| 10 | `10-sql-oracle` | Oracle/MySQL 기반 RDBMS에서 JOIN·집계·트랜잭션을 다루는 능력 |
| 11 | `11-java-spring` | Spring Boot로 Controller·Service·Repository 계층을 분리한 REST API를 만드는 능력 |
| 12 | `12-testing` | Vitest와 JUnit으로 단위·통합 테스트를 작성하는 능력 |
| 13 | `13-git-collab` | feature 브랜치·PR·충돌 해결로 팀 협업 흐름을 따르는 능력 |
| 14 | `14-docker-deploy` | Docker로 앱을 패키징하고 GitHub Actions로 CI 파이프라인을 구성하는 능력 |
| 15 | `15-cs-fundamentals` | 네트워크·OS·DB이론·자료구조 기본기를 자기 말로 설명하는 능력 |
| 16 | `16-security` | XSS·SQL Injection·CSRF·CORS·OWASP Top 10의 방어 코드를 작성하는 능력 |
| 17 | `17-interview-prep` | 1~16단계 학습을 면접 답변으로 통합·연습하는 능력 |

1~8번은 "풀스택 앱 한 개를 직접 만든다"는 기초 트랙입니다. 9~14번은 "실제 SI 현장에서 통할 수준으로 끌어올린다"는 SI 실전 보강 트랙입니다. 15~17번은 "기술 + CS + 면접까지 모두 통과한다"는 채용 직전 마감 트랙입니다. 1~8 → 9~14 → 15~17 순서로 진행하길 권장합니다.

진행 방식은 단계마다 똑같습니다.

1. **공부**. 폴더의 `README.md`를 읽고 `problems.md`의 `빈칸`을 직접 채웁니다. 막히면 `references.md`의 "에러 읽는 법"을 먼저 보고, 그래도 막히면 `answers.md`와 비교합니다.
2. **통합**. 1~7을 끝내면 `08-fullstack-portfolio-project`를 실행해 배운 것이 실제 앱의 어디에 쓰였는지 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)로 확인합니다.
3. **제출**. 8번을 GitHub에 올리고 [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md)의 문장으로 이력서·자기소개서를 작성합니다. 올리기 전 [submission-checklist.md](./08-fullstack-portfolio-project/submission-checklist.md)로 점검합니다.
4. **설명**. 면접에서 "내가 직접 고친 코드 한 줄"과 "1~7이 8에 어떻게 연결됐는지"를 자기 말로 설명합니다.

> 막히는 게 정상입니다. 추측으로 고치지 말고 에러 메시지를 먼저 읽으세요. 그 습관 자체가 SI/SW 면접에서 평가받는 실무 능력입니다.

## 부가 프로그램

- [monorepo-mini-app/](./monorepo-mini-app/) — DevContainer 가상환경에서 동작하는 npm workspaces + TypeScript 풀스택 모노레포 데모(Note Hub). 8번 Career Hub와 독립적인 별도 프로그램으로, "프론트엔드와 백엔드가 같은 타입을 공유한다"는 모노레포의 핵심 가치를 시연합니다.

## 먼저 읽을 파일

- [folder-to-practice-guide.md](./folder-to-practice-guide.md)는 1~8번 폴더를 실무 능력, Career Hub, 이력서 제출까지 연결하는 핵심 안내서입니다.
- [feature-implementation-workbook.md](./feature-implementation-workbook.md)는 모든 기능 구현을 개념 빈칸, 구현 TODO, 검증 명령, 면접 설명으로 다시 채우는 종합 워크북입니다.
- [career-roadmap.md](./career-roadmap.md)는 SI/SW 취업 준비 관점의 전체 로드맵입니다.
- [references.md](./references.md)는 단계별 공식 문서, 에러 읽는 법, 공부 루틴을 모은 자료입니다.
- [student-checklist.md](./student-checklist.md)는 학습자가 직접 체크하는 진행표입니다.
- [portfolio-template.md](./portfolio-template.md)는 GitHub README 작성 템플릿입니다.

## 단계 구성

| 단계 | 폴더 | 목표 |
| --- | --- | --- |
| 1단계 | `01-html-css` | 자기소개 페이지 만들기 |
| 2단계 | `02-javascript-basics` | 버튼 이벤트와 계산기 만들기 |
| 3단계 | `03-react-todo` | React Todo 앱 만들기 |
| 4단계 | `04-node-board-api` | Express 게시판 API 만들기 |
| 5단계 | `05-database-mongodb` | MongoDB CRUD 연결하기 |
| 6단계 | `06-login-auth` | 회원가입과 로그인 구현하기 |
| 7단계 | `07-project-deploy` | 미니 프로젝트 완성 후 배포 준비하기 |
| 포트폴리오 | `08-fullstack-portfolio-project` | 취업 제출용 fullstack 미니 프로젝트 |
| 9단계 | `09-typescript` | React/Express에 TypeScript 적용하기 |
| 10단계 | `10-sql-oracle` | Oracle SQL로 JOIN·집계·트랜잭션 실습 |
| 11단계 | `11-java-spring` | Spring Boot로 4단계 게시판 API 다시 만들기 |
| 12단계 | `12-testing` | Vitest와 JUnit으로 자동화 테스트 작성 |
| 13단계 | `13-git-collab` | 브랜치 전략, PR 리뷰, 충돌 해결 |
| 14단계 | `14-docker-deploy` | Docker 컨테이너화와 GitHub Actions CI |
| 15단계 | `15-cs-fundamentals` | CS 기초 21문제 자기 답안 작성 |
| 16단계 | `16-security` | OWASP Top 10과 XSS·SQLi·CSRF 방어 코드 |
| 17단계 | `17-interview-prep` | 1~16단계 면접 카드 통합과 자기소개·STAR 답안 |

각 단계에는 다음 파일이 있습니다.

- `README.md`는 공부 목표와 실행 방법입니다.
- `problems.md`는 직접 풀 문제입니다.
- `answers.md`는 막혔을 때 확인하는 정답 예시입니다.
- `starter` 또는 `src`는 빈칸을 채우는 실습 코드입니다.

## 실행 안내

1단계와 2단계는 HTML 파일을 브라우저로 열면 됩니다. OS별로 명령이 다릅니다.

```bash
# macOS
open 01-html-css/starter/index.html

# Linux
xdg-open 01-html-css/starter/index.html

# Windows (cmd / PowerShell / Git Bash 공통)
start 01-html-css/starter/index.html
```

3단계부터는 각 폴더에서 의존성을 설치한 뒤 실행합니다.

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
npm run build -w @note-hub/shared
npm run dev
# API: http://localhost:5200, Web: http://localhost:5174
```

워크북 구조 검증은 루트 폴더에서 실행합니다.

```bash
npm run verify
```

`.github/workflows/ci.yml`로 main 푸시·PR마다 GitHub Actions가 위 검증과 8번 포트폴리오의 lint, 단위/통합 테스트, 빌드, Docker 이미지 빌드를 자동 실행합니다.

남은 빈칸 개수는 루트 폴더에서 확인합니다.

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
3. 컨테이너가 빌드되면 자동으로 Node 22.12 + JDK 21 + Gradle + Docker-in-Docker가 준비됩니다.
4. 9번 TypeScript, 11번 Spring Boot, 14번 Docker, 8번 포트폴리오까지 추가 설치 없이 바로 실행됩니다.

### 옵션 B. GitHub Codespaces

저장소를 GitHub에 올린 뒤 "Code → Codespaces → Create"를 누르면 같은 Dev Container가 클라우드에서 뜹니다. 브라우저만 있으면 됩니다.

### 옵션 C. mise (도구 버전만 관리)

로컬에 설치된 환경을 쓰되 도구 버전만 통일하려면 [mise](https://mise.jdx.dev)를 설치한 뒤 저장소 루트에서 `mise install`을 실행합니다. `mise.toml`에 정의된 Node·Java·Gradle 버전이 자동으로 설치됩니다.

### 옵션 D. 직접 설치 (가장 전통적)

- Node.js 22.12 이상(또는 20.19 이상)을 권장합니다. 8번 포트폴리오 프로젝트의 Vite 8이 요구하는 버전입니다.
- 9번 TypeScript 단계는 같은 Node 버전이면 됩니다.
- 10번 SQL 단계는 Oracle Live SQL(브라우저 사용) 또는 Oracle XE/MySQL 로컬 설치 중 하나가 필요합니다.
- 11번 Spring Boot 단계는 JDK 21과 Gradle wrapper가 필요합니다(`brew install openjdk@21`).
- 12번 테스트 단계는 추가 설치가 거의 없습니다. Vitest와 JUnit은 각 프로젝트 의존성으로 들어갑니다.
- 13번 Git 협업 단계는 GitHub 계정과 두 개의 로컬 클론으로 진행합니다.
- 14번 Docker 단계는 Docker Desktop 설치가 필요합니다.
- 15번 CS 기초 단계는 별도 설치 없이 질문에 자기 답안을 작성하는 흐름입니다.
- 16번 보안 단계는 4단계 Express 환경에서 작은 스크립트를 실행합니다. 추가 설치는 없습니다.
- 17번 면접 대비 단계는 마크다운 카드를 채우는 흐름입니다.
- VS Code와 REST Client 확장을 쓰면 `requests.http` 파일로 API를 쉽게 테스트할 수 있습니다.
- MongoDB 단계는 로컬 MongoDB 또는 MongoDB Atlas 중 하나가 필요합니다.
- 실제 제출용 프로젝트는 `08-fullstack-portfolio-project`부터 먼저 완성해 GitHub에 올려도 좋습니다.
- 포트폴리오 프로젝트의 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)를 보면 1~7단계 코드가 실제 프로젝트 기능으로 어떻게 연결됐는지 확인할 수 있습니다.
- 이력서·지원서용 문장은 [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md)에 정리했습니다.
