# 5단계 데이터베이스

[HTML 목차](../index.html) · 학습 흐름. [문제 풀기](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 목표

MongoDB와 Mongoose를 사용해 게시글 데이터를 실제 데이터베이스에 저장하고 CRUD를 구현합니다.

## 기술을 쓰는 이유와 동작 흐름

처음 보는 용어는 [전체 기술 안내서](../technology-guide.md)와 함께 읽으세요. 아래 흐름은 실습을 이해하기 위한 안내이며, 빈칸과 완료 체크는 직접 진행합니다.

| 기술 | 무엇이고, 왜 필요한가요? | 이 실습에서는 어떻게 쓰나요? |
| --- | --- | --- |
| MongoDB | 게시글 같은 데이터를 문서 단위로 보관하는 데이터베이스(DB)입니다. Node 서버를 다시 시작해도 데이터를 남기기 위해 도입합니다. | [db.js](./src/db.js)가 실행 중인 MongoDB에 연결합니다. |
| Mongoose | JavaScript 객체와 MongoDB 작업을 연결하는 도구입니다. 필드 규칙과 저장·조회 방법을 한곳에서 관리합니다. | [Post.js](./src/models/Post.js)의 스키마(필드와 자료형의 규칙)와 모델(실제 DB 작업 도구)을 사용합니다. |
| async·await | 시간이 걸리는 작업의 결과를 기다리며 처리 순서를 표현하는 JavaScript 문법입니다. DB 작업 전에 성공 응답을 보내는 실수를 줄입니다. | [server.js](./src/server.js)가 연결과 저장 결과를 기다린 뒤 다음 처리를 진행합니다. |
| dotenv·환경 변수 | 환경 변수는 실행할 때 외부에서 주는 설정이고, dotenv는 `.env` 파일의 값을 읽는 도구입니다. 환경별 DB 주소를 코드에서 분리합니다. | [.env.example](./.env.example)의 이름과 `db.js`가 읽는 설정 이름을 연결해 봅니다. |

**새 문서를 저장하는 순서:** 요청 본문 수신 → `Post` 모델에 저장 요청 → 스키마 규칙 확인 → MongoDB 저장 → 저장 결과를 JSON 응답으로 전달. 실패하면 공통 오류 처리로 넘어갑니다. 현재 starter는 이 오류들을 공통 500 응답으로 처리하므로 모든 오류가 입력 문제인지 자동 구분해 주지는 않습니다.

**직접 관찰하기:** 같은 DB 주소를 유지한 채 Node 서버만 재시작하고 게시글이 남는지 확인하세요. Career Hub의 기본 저장소는 JSON 파일이므로 이 단계의 MongoDB와 구분해서 설명합니다. 10단계에서는 표 사이의 관계를 다루는 SQL 저장소를 학습합니다.

## 준비

이 단계는 **MongoDB가 실제로 실행 중**이어야 동작합니다. 아래 4가지 방법 중 **하나만** 고르세요. 처음이라면 macOS는 Homebrew, Windows는 설치 프로그램, 설치가 부담되면 Atlas(클라우드)를 추천합니다.

### 방법 A. macOS - Homebrew로 로컬 설치 (추천)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community   # 백그라운드로 MongoDB 실행 시작
```

- 실행 확인. `brew services list` 에서 `mongodb-community` 가 `started` 면 됩니다.
- 끄고 싶을 때. `brew services stop mongodb-community`
- 기본 주소는 `mongodb://127.0.0.1:27017` 입니다. `.env`를 그대로 써도 됩니다.

### 방법 B. Windows - 설치 프로그램

1. [MongoDB Community 설치 안내(Windows)](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)에서 MSI 설치 파일을 받습니다.
2. 설치 중 "Install MongoDB as a Service"를 체크하면 컴퓨터를 켤 때 자동 실행됩니다.
3. 기본 주소는 `mongodb://127.0.0.1:27017` 입니다.

### 방법 C. Docker (도커가 이미 있다면 가장 간단)

```bash
docker run --name fullstack-mongo -d -p 27017:27017 mongo:8.3
```

- 끄기. `docker stop fullstack-mongo` / 다시 켜기. `docker start fullstack-mongo`
- 완전히 지우기. `docker rm -f fullstack-mongo`
- 주소는 `mongodb://127.0.0.1:27017` 입니다.

### 방법 D. MongoDB Atlas (설치 없이 클라우드 사용)

1. [Atlas 시작하기(한국어)](https://www.mongodb.com/ko-kr/docs/atlas/getting-started/)에서 무료 클러스터를 만듭니다.
2. Database Access에서 사용자/비밀번호를 만들고, Network Access에서 본인 IP를 허용합니다.
3. "Connect → Drivers"에서 나오는 `mongodb+srv://...` 주소를 복사합니다.
4. 이 주소를 `.env`의 `MONGODB_URI`에 넣습니다.

### 실행하기

```bash
cd 05-database-mongodb
cp .env.example .env        # MONGODB_URI, PORT가 들어 있는 .env 생성
# Windows cmd:        copy .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

- 로컬(A/B/C)이면 `.env`의 `MONGODB_URI=mongodb://127.0.0.1:27017/fullstack_workbook` 를 그대로 둡니다.
- Atlas(D)이면 `MONGODB_URI` 값을 복사한 `mongodb+srv://...` 주소로 바꿉니다.
- 서버 실행 후 터미널에 `MongoDB에 연결되었습니다.` 가 보이면 성공입니다.
- 데이터를 눈으로 보고 싶으면 [MongoDB Compass](https://www.mongodb.com/products/tools/compass) 또는 [mongosh](https://www.mongodb.com/docs/mongodb-shell/)로 같은 주소에 접속하세요.

[DB 요청 모음](./requests.http)을 VS Code REST Client로 위에서 아래 순서대로 실행하거나, 같은 요청을 Postman·curl로 보내 생성·조회·수정·삭제 후 DB 값이 바뀌는지 확인하세요.

### 연결이 안 될 때

`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` 가 나오면 MongoDB가 실행되지 않은 것입니다. A는 `brew services list`, C는 `docker ps`로 실행 상태를 먼저 확인하세요. 이 에러를 읽는 연습이 곧 문제 5입니다.

## 학습 순서

1. 위 준비 방법 중 하나로 MongoDB를 실행하고 `.env`의 연결 주소를 확인합니다.
2. `src/db.js`에서 서버 시작 전에 DB 연결을 기다리는 이유를 읽습니다.
3. `src/models/Post.js`의 문제 1에서 게시글 스키마와 모델을 완성합니다.
4. `src/server.js`의 문제 2~4에서 생성 → 수정 → 삭제 흐름을 완성합니다.
5. 서버와 `requests.http`를 실행하고, 문제 5에서는 실제 연결 오류의 첫 줄을 읽습니다.
6. 막히면 `hints.md`의 1단계부터 3단계까지 필요한 만큼만 봅니다.
7. 그래도 해결되지 않을 때만 `answers.md`와 비교하고 다시 직접 고칩니다.

## 완료 기준

- 서버 실행 시 MongoDB에 연결됩니다.
- 게시글을 추가하면 데이터베이스에 저장됩니다.
- 목록 조회, 단건 조회, 수정, 삭제가 모두 데이터베이스 기준으로 동작합니다.

완료로 표시하기 전 [학습 근거 4종](../student-checklist.md#단계마다-남길-4종-근거)에 실행 명령, DB 관찰 결과, 연결 오류와 해결, 바꾼 모델·라우터 위치를 기록합니다.

## 취업 연결

실무에서는 데이터를 메모리에만 두지 않고 DB에 저장합니다. 신입에게는 복잡한 DB 튜닝보다 모델 정의, CRUD, 연결 오류 확인, 환경 변수 관리가 먼저입니다.

이 단계가 끝나면 “MongoDB와 Mongoose로 게시글을 저장하고 조회했다”고 설명할 수 있어야 합니다.

## 면접 연습

<!-- written-choice:start -->
4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### R05-01. 스키마를 정의하는 이유를 설명해보세요.

스키마를 정의하는 이유를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 스키마는 모든 비밀번호를 자동으로 암호화한다.
2. 스키마가 있으면 모든 외부 입력 검증은 불필요하다.
3. 데이터 구조와 필수값·제약을 명확히 하여 잘못된 저장을 줄인다.
4. 스키마는 오직 화면 색을 정한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

DB와 애플리케이션의 검증은 각 경계에서 필요합니다. 스키마는 저장 구조와 제약의 근거입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W187)

### R05-02. `createdAt`, `updatedAt`이 자동으로 생기는 이유를 설명해보세요.

`createdAt`, `updatedAt`이 자동으로 생기는 이유를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 비밀번호 원문을 두 개 복제한다.
2. 모든 테이블에 외래 키를 생성한다.
3. 브라우저의 화면 크기를 저장한다.
4. createdAt과 updatedAt을 관리한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

timestamps 옵션은 생성·갱신 시각을 관리합니다. 실제 응답 필드와 모델 설정을 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W188)

### R05-03. 환경 변수에 DB 주소를 넣는 이유를 설명해보세요.

환경 변수에 DB 주소를 넣는 이유를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 환경별 DB 연결 주소와 비밀 값을 코드에서 분리해 주입한다.
2. 환경 변수에 넣으면 노출된 비밀번호를 바꿀 필요가 없다.
3. 환경 변수는 DB 연결 오류를 자동으로 없앤다.
4. DB 주소는 모든 실행 환경에서 반드시 같아야 한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

환경마다 연결 정보가 다를 수 있습니다. 환경 변수도 노출될 수 있으므로 실제 시크릿을 저장소에 커밋하지 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W189)

<!-- written-choice:end -->
