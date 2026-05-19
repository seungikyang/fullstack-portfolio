# 풀스택 개발 학습 문제집

SI/SW 업체 취업을 목표로 12주 동안 HTML/CSS, JavaScript, React, Node.js, 데이터베이스, 로그인, 배포까지 순서대로 익히는 실습형 워크북입니다.

각 단계는 설명만 읽는 방식이 아니라, 코드 안의 `빈칸`, `TODO`, `____`를 직접 채우며 공부하도록 구성했습니다.

## 사용 방법

1. 단계별 `README.md`를 먼저 읽습니다.
2. `problems.md`의 문제를 보고 `starter` 또는 `src` 폴더의 빈칸을 채웁니다.
3. 브라우저 또는 npm 명령으로 실행해 결과를 확인합니다.
4. 막히면 `answers.md`를 보고 어느 부분을 놓쳤는지 비교합니다.
5. 다시 코드를 직접 고쳐보고 자기 말로 설명합니다.

## 먼저 읽을 파일

- [career-roadmap.md](./career-roadmap.md)는 SI/SW 취업 준비 관점의 전체 로드맵입니다.
- [references.md](./references.md)는 단계별 공식 문서, 에러 읽는 법, 공부 루틴을 모은 자료입니다.
- [review-report.md](./review-report.md)는 최종 검토 기준과 결과를 정리한 보고서입니다.
- [student-checklist.md](./student-checklist.md)는 학습자가 직접 체크하는 진행표입니다.
- [portfolio-template.md](./portfolio-template.md)는 GitHub README 작성 템플릿입니다.
- [plan.md](./plan.md)는 이 문제집의 제작 의도와 완료 기준입니다.
- [context-notes.md](./context-notes.md)는 작업 중 결정한 이유를 기록한 파일입니다.

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

각 단계에는 다음 파일이 있습니다.

- `README.md`는 공부 목표와 실행 방법입니다.
- `problems.md`는 직접 풀 문제입니다.
- `answers.md`는 막혔을 때 확인하는 정답 예시입니다.
- `starter` 또는 `src`는 빈칸을 채우는 실습 코드입니다.

## 실행 안내

1단계와 2단계는 HTML 파일을 브라우저로 열면 됩니다.

```bash
open 01-html-css/starter/index.html
open 02-javascript-basics/starter/index.html
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
cp .env.example .env
npm run dev
```

워크북 구조 검증은 루트 폴더에서 실행합니다.

```bash
npm run verify
```

남은 빈칸 개수는 루트 폴더에서 확인합니다.

```bash
npm run progress
```

## 학습 팁

- 처음에는 정답을 외우기보다 화면과 데이터가 어떻게 연결되는지 말로 설명해보세요.
- 빈칸을 채운 뒤에는 일부러 값을 바꿔보며 결과가 어떻게 달라지는지 확인하세요.
- SI/SW 실무에서는 “작게 만들고 실행해 확인하는 습관”이 중요합니다.
- 각 단계가 끝날 때마다 GitHub에 올릴 README 문장 3개를 적어보세요.
- 면접에서는 완벽한 암기보다 직접 만든 기능을 정확히 설명하는 힘이 중요합니다.
- 막히면 추측하지 말고 [references.md](./references.md)의 "에러 읽는 법"을 먼저 보세요.

## 권장 개발 환경

- Node.js 22 이상을 권장합니다.
- VS Code와 REST Client 확장을 쓰면 `requests.http` 파일로 API를 쉽게 테스트할 수 있습니다.
- MongoDB 단계는 로컬 MongoDB 또는 MongoDB Atlas 중 하나가 필요합니다.
- 실제 제출용 프로젝트는 `08-fullstack-portfolio-project`부터 먼저 완성해 GitHub에 올려도 좋습니다.
- 포트폴리오 프로젝트의 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)를 보면 1~7단계 코드가 실제 프로젝트 기능으로 어떻게 연결됐는지 확인할 수 있습니다.
