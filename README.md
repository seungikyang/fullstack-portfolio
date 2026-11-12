# 프로그램 실행 방법 · SW 기술 4지선다 문제집 실행 방법

이 파일은 **저장소 루트 폴더의 `README.md`**입니다. 프로그램을 실행하려면 **Career Hub** 또는 **Note Hub** 절차를, 문제를 풀려면 **SW 기술 4지선다 문제집** 절차를 따라 하세요. 각 항목에 설치할 폴더, 실행 명령, 브라우저 주소와 정상 동작 확인 방법을 정리했습니다.

| 하고 싶은 일 | 바로 가기 |
| --- | --- |
| 취업 준비 기록 프로그램 실행 | [Career Hub 실행](#career-hub-실행) |
| 노트 작성 프로그램 실행 | [Note Hub 실행](#note-hub-실행) |
| SW 기술 기본기 3,000문항 풀기 | [4지선다 기본기 문제집 실행](#sw-기술-4지선다-문제집-실행) |
| CS·면접·자가 점검 455문항 풀기 | [서술형 전환 4지선다 실행](#기존-서술형-문항을-4지선다로-풀기) |
| 학습 문서에서 보기를 선택하고 해설 보기 | [문서 안에서 직접 풀기](#학습-문서-안에서-직접-풀기) |

**[웹 문제집 학습 홈](./quiz/)**에서 과목별 진도를 확인하고 문제를 고를 수 있습니다. 보기 선택 → 정오답·해설 확인 → 기존 학습 문서 읽기 → 오답노트 복습을 한 화면 흐름으로 연결했습니다. 풀던 문제·선택·목록 순서는 브라우저에 자동 저장하며, **학습 기록**에서 과목별 현황과 기록 파일 내보내기·불러오기를 사용할 수 있습니다. 기기 간 자동 동기화는 없으며 자세한 저장 범위는 [문제집 이용 방법](./quiz/README.md)에 있습니다.

처음 실행할 때는 아래의 **공통 준비 → 실행할 대상 선택 → 브라우저 확인** 순서로 진행합니다. 실행 명령을 입력한 터미널은 사용 중에 열어두세요.

## 바로 실행하기

터미널을 열고 다음 명령으로 Node.js와 npm이 설치되어 있는지 확인합니다.

```bash
node -v
npm -v
```

이 저장소의 기준 버전은 Node.js **24.19 이상**입니다(`.nvmrc`: `24.19.0`). 두 명령에서 버전 숫자가 나오면 아래에서 사용할 대상 하나를 골라 명령을 **한 줄씩 순서대로** 실행하세요. 경로는 현재 저장소 위치이며, 다른 폴더에 내려받았다면 `cd` 뒤의 경로를 바꿉니다.

### SW 기술 4지선다 웹 문제집

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio
npm install
npm run serve:workbook
```

터미널에 `문제집 주소:`가 표시되면 서버가 실행된 상태입니다. **터미널은 그대로 두고 브라우저 주소창에** 아래 주소 중 하나를 입력합니다.

| 열 화면 | 브라우저 주소 |
| --- | --- |
| **SW 기술 기본기 4지선다 3,000문항** | <http://127.0.0.1:4187/fullstack-portfolio/quiz/> |
| **기존 워크북 4지선다 455문항** | <http://127.0.0.1:4187/fullstack-portfolio/quiz/?bank=written> |
| 01~17단계 학습 목차 | <http://127.0.0.1:4187/fullstack-portfolio/index.html> |

<http://127.0.0.1:4187/>를 열면 폴더 이름에 맞는 웹 문제집으로 바로 이동합니다. 기존 학습 목차는 문제집의 **17단계 실습 목차**에서 열 수 있습니다. 기본기와 기존 워크북 문제집은 같은 서버를 사용하므로 실행 명령을 두 번 입력하지 않습니다. `quiz/index.html`을 더블 클릭하는 대신 위 서버 주소로 접속하세요.

- **기본기 3,000문항:** 학습 홈에서 과목을 고르고 **학습 시작**을 누릅니다.
- **기존 워크북 455문항:** 화면 위의 **기존 워크북 455문항** 탭을 누릅니다.
- **풀이:** 보기 하나 선택 → **정답 확인** → 정오답·해설 확인 → 다음 문제.
- **복습·저장:** **오답노트**로 다시 풀고, **학습 기록**에서 과목별 진도와 기록 내보내기·불러오기를 사용합니다. 풀던 위치와 선택은 현재 브라우저에 자동 저장됩니다.

**정상 실행 확인:** 과목 카드와 전체 문항 수가 표시되고, **학습 시작 → 보기 선택 → 정답 확인**을 눌렀을 때 정오답과 해설이 보이면 됩니다. 문제 데이터는 저장소에 포함되어 있으므로 처음 실행할 때 별도로 생성할 필요가 없습니다.

문제집만 이용할 때는 아래 두 프로그램이나 DB·Java·Docker를 실행할 필요가 없습니다.

### Career Hub 프로그램

취업 준비의 목표·주간 계획·지원 현황·포트폴리오를 기록하는 앱입니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio/08-fullstack-portfolio-project
npm install
# 처음 실행할 때 환경 파일을 준비합니다. 기존 .env는 유지합니다.
if [ ! -f .env ]; then
  cp .env.example .env
fi
npm run dev
```

브라우저에서 **<http://localhost:3000>**을 열고 회원가입 후 로그인합니다. 위 환경 파일 명령은 macOS·Linux·Git Bash 기준입니다. Windows 명령은 [Career Hub 상세 실행 절차](#career-hub-실행)를 참고하세요.

### Note Hub 프로그램

제목·본문·태그로 노트를 작성하는 앱입니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio/monorepo-mini-app
npm install
npm run dev
```

브라우저에서 **<http://localhost:5174>**를 엽니다. 기본 설정은 메모리 저장 방식이므로 API 서버를 종료하면 노트가 사라집니다. DB에 보관하려면 [Note Hub 상세 실행 절차](#note-hub-실행)를 참고하세요.

**종료:** 실행한 터미널에서 `Ctrl+C`를 누릅니다. 브라우저 탭만 닫으면 서버는 계속 실행됩니다.

**다음에 다시 실행할 때:** 아래 폴더로 이동한 뒤 실행 명령을 입력합니다. 의존성이 바뀌지 않았다면 `npm install`과 환경 파일 복사를 반복할 필요는 없습니다.

| 실행 대상 | 이동할 폴더 | 다시 실행할 명령 |
| --- | --- | --- |
| SW 기술 4지선다 문제집·학습 목차 | `/Users/seoowoo/Documents/fullstack-portfolio` | `npm run serve:workbook` |
| Career Hub | `/Users/seoowoo/Documents/fullstack-portfolio/08-fullstack-portfolio-project` | `npm run dev` |
| Note Hub | `/Users/seoowoo/Documents/fullstack-portfolio/monorepo-mini-app` | `npm run dev` |

여러 프로그램을 동시에 쓰려면 대상마다 새 터미널을 엽니다. 아래에서 처음 설치와 환경 설정을 포함한 상세 실행 방법을 확인할 수 있습니다.

## 저장소 소개

SI/SW 업체(특히 Java/Spring 중심 대형 SI) 취업을 목표로 풀스택 기초부터 실무 협업까지 단계별로 익히는 실습형 워크북입니다.

세 트랙으로 나뉩니다. 1~8번은 풀스택 기초·통합 트랙, 9~14번은 채용 공고에 맞춰 선택하는 실전 보강 트랙, 15~17번은 CS·보안·면접 정리 트랙입니다. 추가로 `monorepo-mini-app`은 가상환경(Dev Container)에서 동작하는 TypeScript 모노레포 데모입니다.

각 단계는 설명만 읽는 방식이 아니라, 코드 안의 `빈칸`, `TODO`, `____`를 직접 채우며 공부하도록 구성했습니다.

> 처음 왔다면 [HTML 학습 목차](./index.html)를 열어 남은 기간에 맞는 경로를 고르세요. 목표 직무와 첫 지원일은 [START-HERE.md](./START-HERE.md)에 적습니다.

기술 이름이 낯설다면 [처음 읽는 기술 안내서](./technology-guide.md)에서 화면·서버·저장소의 차이와 기술을 쓰는 이유를 먼저 확인하세요. 각 단계 README에는 해당 기술의 동작 순서, 실제 코드 위치, 실행 후 관찰할 내용이 있습니다.

실행 안내 목차:

- [공통 준비와 실행 대상 선택](#프로그램-빠른-실행)
- [Career Hub 프로그램 실행](#career-hub-실행)
- [Note Hub 프로그램 실행](#note-hub-실행)
- [SW 기술 4지선다 기본기 3,000문항 실행](#sw-기술-4지선다-문제집-실행)
- [서술형 전환 4지선다 455문항 실행](#기존-서술형-문항을-4지선다로-풀기)
- [학습 문서 안에서 직접 선택·채점·해설 보기](#학습-문서-안에서-직접-풀기)
- [01~17단계 실습 실행](#단계별-실습-실행-방법)
- [종료·재실행·오류 확인](#실행-문제-확인과-검증)

## 프로그램 빠른 실행

터미널에서 이 `README.md`와 `package.json`이 있는 **저장소 루트 폴더**를 엽니다. 현재 macOS 작업 경로에서는 다음처럼 이동합니다. 다른 위치에 내려받았다면 본인의 경로를 사용하세요.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio
node -v
npm -v
```

저장소 기준 환경은 Node.js **24.19 이상**과 npm입니다(`.nvmrc`: `24.19.0`). 두 명령이 버전 숫자를 출력하면 다음으로 진행합니다. 아래 명령의 절대 경로는 현재 macOS 작업 폴더 기준이며 다른 위치에 내려받았다면 자신의 경로로 바꿉니다.

다음 표에서 실행할 대상을 고르고 해당 항목의 상세 절차를 따르세요. 설치 명령 `npm install`은 **실행할 프로그램의 폴더에서 처음 한 번** 수행합니다. 의존성이 바뀌면 다시 실행합니다. Career Hub는 처음 실행할 때 [환경 파일 준비](#career-hub-실행)도 필요합니다.

| 실행 대상 | 명령을 실행할 폴더 | 실행 명령 | 브라우저 접속 주소 |
| --------- | ------------------ | --------- | ------------------ |
| [Career Hub — 취업 준비 기록 앱](#career-hub-실행) | `08-fullstack-portfolio-project` | `npm run dev` | <http://localhost:3000> |
| [Note Hub — TypeScript 노트 앱](#note-hub-실행) | `monorepo-mini-app` | `npm run dev` | <http://localhost:5174> |
| [SW 기술 기본기 4지선다 — 3,000문항](#sw-기술-4지선다-문제집-실행) | 저장소 루트 | `npm run serve:workbook` | <http://127.0.0.1:4187/fullstack-portfolio/quiz/> |
| [서술형 전환 4지선다 — 455문항](#기존-서술형-문항을-4지선다로-풀기) | 저장소 루트 | `npm run serve:workbook` | <http://127.0.0.1:4187/fullstack-portfolio/quiz/index.html?bank=written> |
| 학습 목차·웹 문서·실습 편집기 | 저장소 루트 | `npm run serve:workbook` | <http://127.0.0.1:4187/fullstack-portfolio/index.html> |

여러 프로그램을 함께 사용하려면 **프로그램마다 터미널을 하나씩** 엽니다. Career Hub와 Note Hub의 `npm run dev`는 각각 해당 앱의 화면·API를 함께 실행합니다. 학습 목차와 두 문제집은 `npm run serve:workbook` 서버 하나를 공유합니다.

실행 중인 터미널은 열어두고 브라우저로 접속합니다. 종료는 해당 터미널에서 `Ctrl+C`를 누릅니다. 폴더 이름이 바뀌어도 <http://127.0.0.1:4187/>에서 웹 문제집을 열고 **17단계 실습 목차**로 이동할 수 있습니다.

## 프로그램 실행 방법

두 프로그램 중 사용할 앱의 절차를 선택합니다. 각 앱의 폴더에서 의존성을 설치하고 실행해야 합니다. 아래 명령은 현재 macOS 저장소 경로 기준입니다.

### Career Hub 실행

**1. 설치:** 새 터미널에서 Career Hub 폴더로 이동해 의존성을 설치합니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio/08-fullstack-portfolio-project
npm install
```

**2. 환경 파일 준비:** 처음 실행할 때 `.env.example`을 `.env`로 복사합니다. 이미 `.env`가 있으면 이 복사 단계를 건너뛰고 기존 설정을 사용하세요.

```bash
# macOS / Linux / Git Bash
cp .env.example .env
# Windows cmd:        copy .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
```

**3. 실행:** 같은 터미널에서 다음 명령을 실행합니다.

```bash
npm run dev
```

**4. 정상 확인:** <http://localhost:3000>에 접속해 **회원가입**으로 계정을 만든 뒤 로그인합니다. 목표·주간 계획, 지원 현황, 포트폴리오 프로젝트를 기록할 수 있습니다. API는 <http://localhost:5100/api/health>에서 상태를 확인합니다. 기본 설정은 데모 계정을 생성하지 않습니다.

개발 서버는 화면과 API를 함께 실행합니다. 데이터는 기본적으로 `08-fullstack-portfolio-project/data/career-hub.json`에 저장됩니다. 배포용 빌드·환경 변수·Docker 실행은 [Career Hub 실행 안내](./08-fullstack-portfolio-project/README.md)에 있습니다.

정상 실행은 **3000번 화면과 5100번 API가 모두 응답하는지** 확인합니다. 시작 시 3000번 포트의 기존 수신 프로세스는 실행 스크립트가 자동 종료하며, 3001번으로 바꾸어 실행하지 않습니다.

### Note Hub 실행

**1. 설치·실행:** 새 터미널에서 다음 명령을 순서대로 실행합니다. 기본 메모리 저장 방식은 별도의 DB 설치나 환경 파일 복사 없이 시작할 수 있습니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio/monorepo-mini-app
npm install
npm run dev
```

**2. 정상 확인:** <http://localhost:5174>에 접속해 제목·본문·태그를 입력하고 노트를 만들어보세요. API 상태는 <http://localhost:5200/api/health>에서 확인합니다. 개발 실행 전에 shared 패키지는 자동으로 빌드됩니다.

별도의 DB 설정이 없으면 메모리 저장소를 사용하므로 DB 설치 없이 시작할 수 있고, API 서버를 종료하면 노트가 사라집니다. PostgreSQL에 데이터를 보존하는 방법과 운영용 접근 토큰 설정은 [Note Hub 실행 안내](./monorepo-mini-app/README.md)에 있습니다. 무토큰 개발 모드는 로컬 학습용입니다.

정상 실행은 **화면에서 노트 생성·조회가 되고 5200번 API가 응답하는지** 확인합니다. 5174번 포트가 이미 사용 중이면 Vite가 다른 포트를 선택할 수 있으므로 터미널에 출력된 화면 주소를 확인합니다.

## SW 기술 4지선다 문제집 실행 방법

문제집은 **저장소 루트에서 서버 하나만 실행**하면 됩니다. 이 서버에서 기본기 3,000제, 전환 455문항, 문서 안 풀이를 모두 이용합니다. Career Hub나 Note Hub를 실행하지 않아도 문제집을 사용할 수 있습니다.

### SW 기술 4지선다 문제집 실행

[기본기 3000제](./quiz/index.html)를 바로 사용할 수 있습니다. **20분야·3,000문항**이며 문항마다 보기 네 개, 정답 한 개, 한국어 해설, 관련 학습 문서 링크를 제공합니다. 개념·상황 문제 400개와 코드·계산 반복 연습 2,600개로 구성됩니다. 기존 2,000문항과 풀이 기록을 유지하면서 기반 기술 50가지 유형의 연습 1,000문항을 추가했습니다.

다루는 분야는 HTML, CSS, JavaScript, DOM·이벤트, React, HTTP·API, Node·Express, DB·MongoDB, 로그인·인증, 실행·배포, Career Hub, TypeScript, SQL, Java·Spring, 테스트, Git 협업, Docker·CI, CS 기초, 보안, Note Hub입니다.

**1. 설치·실행:** 저장소 루트에서 다음 명령을 순서대로 실행합니다. 문제집 실행에는 Node.js와 npm을 사용하며 DB·Java·Docker 설치는 필요하지 않습니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio
npm install
npm run serve:workbook
```

**2. 정상 확인:** 터미널에 `문제집 주소: http://127.0.0.1:4187/fullstack-portfolio/quiz/`가 표시됩니다. 이 터미널은 열어두고 아래 주소로 접속합니다. 웹 문제집의 **풀이한 문제 0 / 3,000**과 과목 카드가 보이면 문제 데이터까지 정상적으로 불러온 것입니다. 기존 기록이 있으면 푼 문항 수가 표시됩니다.

1. 브라우저에서 <http://127.0.0.1:4187/>를 엽니다. 웹 문제집이 바로 표시됩니다.
2. 기존 설명·실습 자료가 필요하면 **17단계 실습 목차**로 이동합니다. 현재 폴더명에서는 <http://127.0.0.1:4187/fullstack-portfolio/quiz/>로 바로 접속할 수도 있습니다.
3. **학습 홈**에서 과목 카드의 **학습 시작**을 누릅니다. **문제 풀기**에서는 과목·학습 범위·검색을 바꾸고 **적용**할 수 있습니다.
4. 보기 하나를 고른 뒤 **정답 확인**으로 채점과 해설을 확인합니다.
5. **오답노트**에서 정답을 가리고 다시 풀고, **최신 오답으로 갱신**하면 맞힌 문제는 빠집니다. **학습 기록**에서 과목별 진도와 기록 파일 내보내기·불러오기를 사용할 수 있습니다.

문제 파일은 포함되어 있어 처음 실행할 때 생성 명령이 필요하지 않습니다. HTML 파일을 더블 클릭하면 문제 데이터를 불러오지 못할 수 있으므로 서버 주소로 접속하세요. 답과 풀던 위치·선택·목록 순서는 현재 브라우저에 자동 저장합니다. 브라우저나 주소를 바꾸거나 사이트 데이터를 지우기 전 **기록 내보내기**로 파일을 보관하세요.

자세한 분야별 문항 수와 기록 저장 방식은 [문제집 이용 안내](./quiz/README.md)에 있습니다. 문제 원본을 수정했을 때만 루트에서 `npm run build:quiz`로 배포용 문제 데이터를 다시 생성합니다.

[이번에 추가한 기반 기술 50유형](./quiz/technology-topics.md)에서 대표 문항과 현재 프로그램의 관련 코드 위치를 확인할 수 있습니다.

### 기존 서술형 문항을 4지선다로 풀기

CS·기술 면접·인성·자기소개·프로젝트 설명과 단계별 설명·자가 점검 문제 **455문항을 모두 4지선다**로 제공합니다. 각 문항에는 보기 네 개·정답 한 개·한국어 해설이 있습니다. 단계별 README·문제 문서, 종합 워크북의 면접 꼬리질문 84개, 기술 안내서·취업 로드맵과 SQL 소스의 관찰 질문도 같은 선택형 문항으로 연결합니다. 기존 455문항의 내용·번호·풀이 기록은 유지합니다. 실습 코드의 빈칸은 직접 구현하고 실행 결과는 기록합니다.

기본기 문제집과 **같은 서버**를 사용합니다. 앞의 서버가 이미 실행 중이면 새 서버를 켜지 않고 아래 접속 주소만 엽니다. 아직 실행하지 않았다면 다음 명령을 실행합니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio
npm install
npm run serve:workbook
```

목차의 **서술형 전환 4지선다** 또는 웹 문제집 상단의 **기존 워크북 455문항**을 선택합니다. 학습 홈에서 과목을 골라 보기 네 개가 보이면 정상입니다. 현재 경로의 직접 주소는 <http://127.0.0.1:4187/fullstack-portfolio/quiz/index.html?bank=written>입니다. [CS 21문제](./quiz/index.html?bank=written&category=cs)와 [기술·통합 면접 77문제](./quiz/index.html?bank=written&category=technical)를 따로 선택할 수도 있습니다.

보기 하나를 고르고 **정답 확인**을 누르면 채점과 해설을 확인합니다. **틀린 문제**로 오답을 복습하고, 새로고침하면 마지막 채점 기록을 복구합니다. 기본기 3,000제와 전환 문제집은 풀이 기록을 따로 저장합니다. 문제집 서버에서 연 학습 문서에서도 **보기 선택·채점·해설·다시 풀기**를 바로 사용할 수 있으며, 전환 문제집과 기록을 공유합니다. GitHub 원문에서는 접힌 **정답·해설 확인**을 펼칩니다. 제작 원본을 수정했다면 루트에서 `npm run build:written` 후 `npm run verify`로 데이터·문서 일치를 검사합니다.

### 학습 문서 안에서 직접 풀기

별도 퀴즈 화면으로 이동하지 않고 학습 문서의 문제에서 보기를 선택할 수 있습니다. **위의 `npm run serve:workbook` 서버를 실행한 상태**에서 아래 주소를 브라우저로 엽니다. 서버가 이미 켜져 있으면 새로 실행할 필요가 없습니다.

| 학습 문서 | 브라우저 접속 주소 |
| --- | --- |
| CS 기초 21문제 | <http://127.0.0.1:4187/fullstack-portfolio/15-cs-fundamentals/problems.md> |
| 기술·통합 면접 77문제 | <http://127.0.0.1:4187/fullstack-portfolio/17-interview-prep/interview-cards.md> |
| HTML·CSS 단계 설명과 면접 연습 | <http://127.0.0.1:4187/fullstack-portfolio/01-html-css/README.md> |
| 전체 학습 목차 | <http://127.0.0.1:4187/fullstack-portfolio/index.html> |

1. 문제 카드의 보기 네 개 중 하나를 누릅니다. 휴대폰에서도 보기 전체를 눌러 선택할 수 있습니다.
2. **정답 확인**을 누릅니다. 내 답과 정답을 글자·색으로 구분하고, 아래에 정답과 해설을 표시합니다.
3. **다시 풀기**를 누르면 정답과 해설을 숨기고 새 답을 선택할 수 있습니다. 새 답을 제출하면 기록이 갱신됩니다.
4. 페이지 상단의 **풀이 현황**으로 정답·오답 수를 확인하고, **다음 미풀이로 이동**으로 아직 풀지 않은 문제로 이동합니다.
5. 한 문제씩 풀려면 해설 아래의 **이 문제 집중해서 풀기**를 누릅니다. 전환 문제집에서 이어서 풀거나 **틀린 문제**를 모아 복습할 수 있습니다.

문서와 전환 문제집의 기록은 **같은 브라우저·같은 접속 주소**에서 공유됩니다. 새로고침하면 마지막 채점 결과가 복구됩니다. `localhost`와 `127.0.0.1`은 다른 주소로 취급되므로 문제집은 안내된 `127.0.0.1:4187` 주소로 일관되게 접속하세요.

GitHub에서 Markdown 원문을 보거나 파일을 직접 열면 웹 풀이 기능이 실행되지 않습니다. 위의 서버 주소로 열어 주세요. 브라우저에서 JavaScript를 끈 경우에는 카드 안의 접힌 정답·해설을 확인할 수 있습니다.

## 실행 문제 확인과 검증

- **종료:** 실행한 터미널에서 `Ctrl+C`를 누릅니다. Career Hub와 Note Hub의 `npm run dev`는 화면·API를 함께 실행하므로 실행을 종료한 뒤 두 서버의 로그가 멈췄는지 확인합니다.
- **다시 실행:** 해당 프로그램 폴더에서 같은 실행 명령을 다시 실행합니다. 의존성이 이미 설치되어 있고 변경되지 않았다면 `npm install`을 매번 반복할 필요는 없습니다.
- `npm` 명령을 찾지 못하면 Node.js를 설치한 뒤 터미널을 다시 열어 `node -v`와 `npm -v`를 확인합니다.
- `package.json`을 찾지 못하면 실행 대상 폴더로 이동했는지 확인합니다. 루트에 설치하는 것만으로 하위 앱의 의존성이 설치되지는 않습니다.
- `Cannot find module`, `ERR_MODULE_NOT_FOUND`, `vite: command not found`가 나오면 실행 대상 폴더에서 `npm install`을 완료한 뒤 다시 실행합니다.
- `EBADENGINE`이 나오면 `node -v`로 버전을 확인합니다. Career Hub와 Note Hub는 `package.json`에 Node.js `>=24.19`를 요구하므로 저장소 기준 버전을 사용합니다.
- `EADDRINUSE`가 나오면 같은 포트로 실행 중인 기존 서버를 해당 터미널에서 `Ctrl+C`로 종료하고 다시 실행합니다.
- 브라우저에 **연결할 수 없음**이 표시되면 문제집을 실행한 터미널이 열려 있는지 확인합니다. 종료했다면 루트에서 `npm run serve:workbook`을 다시 실행합니다.
- 퀴즈가 로드되지 않으면 주소가 `file://`로 시작하는지 확인합니다. 파일을 직접 열었다면 <http://127.0.0.1:4187/>로 접속하세요. 서버 주소에서도 실패하면 문제집의 **다시 불러오기**를 누릅니다.
- 코드를 업데이트한 뒤에도 이전 동작이 보이면 실행 중인 터미널에서 `Ctrl+C`로 서버를 종료하고 같은 실행 명령으로 다시 시작한 뒤 브라우저를 새로고침합니다.

학습 목차·문제 데이터·채점 규칙·문서 링크는 **저장소 루트에서** 다음 명령으로 검증합니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio
npm run verify
```

Career Hub는 해당 폴더에서 `npm run verify`를, Note Hub는 해당 폴더에서 `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`를 실행합니다. 단계별 학습 빈칸과 체크리스트 진행은 루트의 `npm run progress`로 별도 확인합니다.

## 사용 방법

기본 개념을 문제로 확인하려면 [4지선다 기본기 3000제](./quiz/)를 여세요. 개념·상황 400문항과 입력·조건을 바꾼 코드·계산 반복 2,600문항을 분야별로 풀고, 정답 해설과 오답 복습을 볼 수 있습니다. [3000제 이용 안내](./quiz/README.md)에 실행 방법과 구성을 정리했습니다.

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

1. **공부**. 폴더의 `README.md`를 읽고 `problems.md`에서 문제를 확인한 뒤 강조된 실습 파일 링크로 실제 `starter`·`src` 코드를 열어 빈칸을 직접 채웁니다. 막히면 문제 화면의 `1~3단계 힌트 확인`을 순서대로 펼치고, 그래도 풀리지 않을 때만 `정답 비교 열기`로 답을 비교합니다.
2. **통합**. 1~7을 끝내면 `08-fullstack-portfolio-project`를 실행해 배운 것이 실제 앱의 어디에 쓰였는지 [learning-map.md](./08-fullstack-portfolio-project/learning-map.md)로 확인합니다.
3. **제출**. 8번을 GitHub에 올리고 [resume-assets.md](./08-fullstack-portfolio-project/resume-assets.md)의 문장으로 이력서·자기소개서를 작성합니다. 올리기 전 [submission-checklist.md](./08-fullstack-portfolio-project/submission-checklist.md)로 점검합니다.
4. **설명**. 실행 명령, 관찰 결과, 해결한 오류, 코드 위치를 근거로 "내가 직접 고친 코드 한 줄"과 "1~7이 8에 어떻게 연결됐는지"를 자기 말로 설명합니다.

> 막히는 게 정상입니다. 추측으로 고치지 말고 에러 메시지를 먼저 읽으세요. 그 습관 자체가 SI/SW 면접에서 평가받는 실무 능력입니다.

## 부가 프로그램

- [monorepo-mini-app/](./monorepo-mini-app/) — DevContainer 가상환경에서 동작하는 npm workspaces + TypeScript 풀스택 모노레포 데모(Note Hub). 8번 Career Hub와 독립적인 별도 프로그램으로, "프론트엔드와 백엔드가 같은 타입을 공유한다"는 모노레포의 핵심 가치를 시연합니다.

## 먼저 읽을 파일

- [index.html](./index.html)은 추천 경로, 17단계 학습 자료, 폴더별 실행·검증 지도, 취업 준비 문서를 클릭해서 이동하는 단일 HTML 목차입니다.
- [START-HERE.md](./START-HERE.md)는 목표 직무와 지원 시기에 따라 첫 학습 경로를 정하는 단일 시작점입니다.
- [technology-guide.md](./technology-guide.md)는 기술의 역할, 선택 이유, 저장 버튼의 처리 과정, 실행·검증 도구를 초보자 눈높이로 설명합니다.
- [history.html](./history.html)은 취업 워크북 개선의 배경, 구현 내용, 검증 결과를 정리한 변경 이력입니다.
- [folder-to-practice-guide.md](./folder-to-practice-guide.md)는 1~17번 폴더를 실행 근거, Career Hub, 이력서 제출까지 연결하는 핵심 안내서입니다.
- [feature-implementation-workbook.md](./feature-implementation-workbook.md)는 개념·설명 4지선다, 구현 TODO, 검증 명령·관찰 기록으로 기능을 점검하는 종합 워크북입니다.
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
| 15단계     | `15-cs-fundamentals`             | CS 기초 21문제 4지선다 채점                |
| 16단계     | `16-security`                    | OWASP Top 10과 XSS·SQLi·CSRF 방어 코드       |
| 17단계     | `17-interview-prep`              | 1~16단계 면접 카드 통합과 자기소개·STAR 답안 |

모든 단계에는 목표와 실행 방법을 설명하는 `README.md`가 있습니다. 표준 실습 단계는 `problems.md` → `hints.md` → `answers.md`와 `starter` 또는 `src`를 함께 제공하지만 단계 성격에 따라 구성이 다릅니다.

- 8단계는 실행 가능한 Career Hub와 `learning-map.md`, `resume-assets.md`, `submission-checklist.md`를 중심으로 구성됩니다.
- 15단계는 CS 21문제 4지선다, 17단계는 기술·인성·자기소개·프로젝트 설명 4지선다가 중심입니다.
- 11단계 Spring과 14단계 Docker는 README에 적힌 원본 프로젝트 준비 조건을 먼저 충족해야 합니다.

## 실행 안내

### 문제집 목차와 웹 편집기 열기

저장소 루트에서 다음 서버를 실행하면 폴더 이름을 포함한 고정 주소로 문제집 목차를 열 수 있습니다.

```bash
npm run serve:workbook
# http://127.0.0.1:4187/
```

서버를 실행한 터미널은 학습하는 동안 그대로 둡니다. 루트 주소 `http://127.0.0.1:4187/`로 접속하면 실제 저장소 폴더 이름을 포함한 주소로 이동합니다. 현재 폴더에서는 `http://127.0.0.1:4187/fullstack-portfolio/`이며, 폴더 이름을 바꾸면 주소도 바뀝니다. 터미널에 출력된 `문제집 주소`로 확인할 수 있고, 서버는 이 저장소 내부 파일만 제공합니다.

목차의 `README.md`, `problems.md`, `hints.md`, `answers.md` 링크는 같은 서버에서 읽기 쉬운 HTML 문서로 표시됩니다. 표·코드·체크리스트와 문서 안 상대 링크·제목 앵커를 유지하며, 원문 HTML은 정화하고 Content Security Policy를 적용합니다. 15개 표준 `problems.md`는 데스크톱에서 문제와 도움말을 나란히 보여주고 모바일에서는 한 열로 정리합니다.

코드형 문제의 `problems.md`에는 파란색으로 강조된 실제 실습 파일 링크가 있습니다. `?view=source`가 붙은 링크에서는 문제에 연결된 실습 파일 50개를 웹에서 직접 수정하고 `파일 저장` 또는 `Ctrl/Command + S`로 같은 로컬 파일에 저장할 수 있습니다. 저장하지 않은 변경은 상태 문구와 페이지 이탈 경고로 알려줍니다.

문제 화면의 오른쪽 도움말 패널에는 기존 `hints.md`와 `answers.md`가 각각 접힌 상태로 함께 표시됩니다. 먼저 코드를 수정하고 `1~3단계 힌트 확인`을 순서대로 본 뒤 마지막에 `정답 비교 열기`를 사용하세요. 같은 접힌 도움말은 코드 편집 화면 아래에도 유지되며, 11·13·15단계처럼 직접 편집할 코드가 없는 트랙도 문제와 도움말을 한 화면에서 볼 수 있습니다.

웹 저장은 문제에 연결된 50개 파일만 허용합니다. 편집 중 다른 프로그램이 같은 파일을 바꾸면 이전 내용을 덮어쓰지 않고 충돌을 알리므로 `저장 내용 다시 불러오기`로 최신 파일을 확인한 뒤 다시 수정하세요. 저장 요청이 진행되는 동안 계속 입력한 내용은 저장 완료로 잘못 표시하지 않고 남은 변경으로 유지하므로, 첫 저장이 끝난 뒤 한 번 더 저장할 수 있습니다. 웹에서 저장한 내용은 Git이 추적하는 실제 학습 파일에 반영됩니다. 11단계는 Spring 프로젝트 생성 안내로 연결하고, 13단계와 15단계는 각각 명령·협업형과 4지선다 문제로 구분합니다.

Orca 앱 번들의 공식 CLI로 새 탭을 만들 때는 루트에서 다음 명령을 실행합니다.

```bash
/Applications/Orca.app/Contents/Resources/bin/orca tab create --url http://127.0.0.1:4187/
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

### 단계별 실습 실행 방법

아래 폴더 경로는 저장소 루트 기준입니다. `npm install`은 표에 적힌 폴더에서 먼저 실행합니다. 실습 파일의 `TODO`·`____`를 직접 채운 뒤 기능을 확인하며, 필요한 DB나 생성형 프로젝트는 각 단계 README의 준비 절차를 따릅니다.

| 단계·프로그램 | 실행할 폴더 | 실행 방법 | 접속·확인 방법 |
| --- | --- | --- | --- |
| 01 HTML/CSS | `01-html-css` | `starter/index.html`을 브라우저로 열기 | [자기소개 페이지](./01-html-css/starter/index.html) |
| 02 JavaScript | `02-javascript-basics` | `starter/index.html`을 브라우저로 열기 | [계산기·Todo 화면](./02-javascript-basics/starter/index.html) |
| 03 React Todo | `03-react-todo` | `npm install`, `npm run dev` | 터미널의 Vite 주소로 접속 |
| 04 게시판 API | `04-node-board-api` | `npm install`, `npm run dev` | <http://localhost:4000/health>, [API 요청 모음](./04-node-board-api/requests.http) |
| 05 MongoDB API | `05-database-mongodb` | MongoDB·`.env` 준비 → `npm install`, `npm run dev` | <http://localhost:4100/health>, [DB 준비 안내](./05-database-mongodb/README.md#준비) |
| 06 로그인 API | `06-login-auth` | `.env.example`을 `.env`로 복사 → `npm install`, `npm run dev` | <http://localhost:4200/health>, [인증 요청 모음](./06-login-auth/requests.http) |
| 07 미니 블로그 | `07-project-deploy` | `npm install`, `npm run dev` | <http://localhost:4300> |
| 08 Career Hub | `08-fullstack-portfolio-project` | [위의 Career Hub 실행 절차](#career-hub-실행) | <http://localhost:3000> |
| 09 TypeScript | `09-typescript` | `npm install`, `npm run typecheck` 또는 `npm run dev` | 터미널의 타입 검사 결과 확인; 웹 서버를 열지 않음 |
| 10 SQL | `10-sql-oracle` | 준비한 Oracle/MySQL에서 `starter/*.sql` 실행 | [DB 준비·실행 안내](./10-sql-oracle/README.md#실행-방법) |
| 11 Java/Spring | `11-java-spring/starter/board-api` | [프로젝트 생성](./11-java-spring/starter/README.md) 후 `./gradlew bootRun` | <http://localhost:8080/api/posts> |
| 12 테스트 | `12-testing/starter/js` | `npm install`, `npm test` | 터미널의 테스트 결과 확인; Java 실습은 [별도 안내](./12-testing/README.md#실행-방법) |
| 13 Git 협업 | `13-git-collab` | [문제](./13-git-collab/problems.md)에 따라 브랜치·PR·충돌 실습 | Git 명령 출력과 변경 기록 확인 |
| 14 Docker | 준비한 Node/Spring 프로젝트 | [원본 코드 준비·빌드·Compose 안내](./14-docker-deploy/README.md#실행-방법)에 따라 실행 | 컨테이너 상태와 앱 응답 확인 |
| 15 CS 기초 | 저장소 루트 | `npm run serve:workbook` | [CS 21문항 채점](./quiz/index.html?bank=written&category=cs) |
| 16 보안 | `16-security` | `npm install`, `npm run check` 후 [실습별 실행 명령](./16-security/README.md#실행-방법) 사용 | 실습별 3000/4000번 주소와 요청·응답 확인 |
| 17 면접 대비 | 저장소 루트 | `npm run serve:workbook` | [기술·통합 면접 77문항 채점](./quiz/index.html?bank=written&category=technical); 다른 분야는 문제집에서 선택 |

예를 들어 03 React Todo는 새 터미널에서 다음과 같이 실행합니다.

```bash
cd /Users/seoowoo/Documents/fullstack-portfolio/03-react-todo
npm install
npm run dev
```

15·17단계는 앞의 문제집 서버가 실행 중이면 접속 링크만 열면 됩니다. 16단계의 3000번 실습은 Career Hub와 같은 포트를 쓰므로 사용 중인 앱을 종료한 뒤 실행합니다. 전체 실행 지도는 [HTML 목차의 실행 지도](./index.html#run-map)에서도 확인할 수 있습니다.

취업 제출용 Career Hub와 모노레포 Note Hub는 앞의 **프로그램 빠른 실행** 순서로 실행합니다. 자세한 배포 설정은 [Career Hub README](./08-fullstack-portfolio-project/README.md)와 [Note Hub README](./monorepo-mini-app/README.md)에 있습니다.

루트 명령은 구조 검증과 학습 진행 확인을 구분합니다.

```bash
npm run verify:structure # 저장소 구조와 필수 파일 검사. npm run verify와 동일
npm run verify:programs  # 미완성 빈칸과 무관한 03 build, 02·04~07·16 문법 검사
npm run progress         # starter 소스의 전용 ____ 토큰과 체크리스트 진행률 보고
npm run verify:learning  # 전용 ____ 토큰과 체크리스트를 모두 완료했는지 검사
```

`npm run verify`는 `verify:structure`의 별칭이며 학습 완료를 뜻하지 않습니다. `verify:programs`도 학습 답안을 채우기 전 통과할 수 있는 빌드·문법 검사만 실행합니다. `progress`는 지정된 starter 소스의 전용 `____` 토큰과 체크리스트 전체를 함께 집계합니다. `verify:learning`은 토큰이 0개이고 체크리스트가 전부 완료됐을 때만 통과합니다. 일반 `TODO`의 구현 품질과 실제 경험의 근거는 자동 판정할 수 없으므로 단계별 실행 결과와 답안은 체크리스트의 취업 증거 표에 직접 기록합니다.

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
- 15번 CS 기초 단계는 CS 21문제의 네 보기 중 하나를 선택하고 채점·오답 복습하는 흐름입니다.
- 16번 보안 단계는 별도 npm 실습입니다. `16-security`에서 `npm install`과 `npm run check`를 먼저 실행하며, SQL Injection 실습에만 로컬 MySQL 또는 Docker MySQL이 추가로 필요합니다.
- 17번 면접 대비 단계는 기술·인성·자기소개·프로젝트 설명을 4지선다로 확인하는 흐름입니다.
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
