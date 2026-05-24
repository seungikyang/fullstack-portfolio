# 5단계 데이터베이스

## 목표

MongoDB와 Mongoose를 사용해 게시글 데이터를 실제 데이터베이스에 저장하고 CRUD를 구현합니다.

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
docker run --name fullstack-mongo -d -p 27017:27017 mongo:7
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
npm install
npm run dev
```

- 로컬(A/B/C)이면 `.env`의 `MONGODB_URI=mongodb://127.0.0.1:27017/fullstack_workbook` 를 그대로 둡니다.
- Atlas(D)이면 `MONGODB_URI` 값을 복사한 `mongodb+srv://...` 주소로 바꿉니다.
- 서버 실행 후 터미널에 `MongoDB에 연결되었습니다.` 가 보이면 성공입니다.
- 데이터를 눈으로 보고 싶으면 [MongoDB Compass](https://www.mongodb.com/products/tools/compass) 또는 [mongosh](https://www.mongodb.com/docs/mongodb-shell/)로 같은 주소에 접속하세요.

### 연결이 안 될 때

`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` 가 나오면 MongoDB가 실행되지 않은 것입니다. A는 `brew services list`, C는 `docker ps`로 실행 상태를 먼저 확인하세요. 이 에러를 읽는 연습이 곧 문제 5입니다.

막히면 `answers.md`를 보고 다시 직접 고칩니다.

## 완료 기준

- 서버 실행 시 MongoDB에 연결됩니다.
- 게시글을 추가하면 데이터베이스에 저장됩니다.
- 목록 조회, 단건 조회, 수정, 삭제가 모두 데이터베이스 기준으로 동작합니다.

## 취업 연결

실무에서는 데이터를 메모리에만 두지 않고 DB에 저장합니다. 신입에게는 복잡한 DB 튜닝보다 모델 정의, CRUD, 연결 오류 확인, 환경 변수 관리가 먼저입니다.

이 단계가 끝나면 “MongoDB와 Mongoose로 게시글을 저장하고 조회했다”고 설명할 수 있어야 합니다.

## 면접 연습

### 스키마를 정의하는 이유를 설명해보세요.

스키마는 데이터가 어떤 필드와 타입을 가져야 하는지 정하는 약속입니다. MongoDB는 유연한 문서 DB지만, 애플리케이션에서는 제목이 문자열인지, 작성일이 날짜인지 같은 규칙이 필요합니다. Mongoose 스키마를 쓰면 잘못된 데이터가 저장되는 것을 줄이고 코드에서 모델을 예측하기 쉬워집니다.

### `createdAt`, `updatedAt`이 자동으로 생기는 이유를 설명해보세요.

Mongoose 스키마에서 `timestamps: true` 옵션을 주면 문서 생성 시 `createdAt`, 수정 시 `updatedAt`을 자동으로 관리합니다. 이 값들은 게시글 정렬, 변경 이력 확인, 최근 수정 여부 판단에 자주 쓰입니다. 직접 날짜를 넣는 실수를 줄이고 모든 문서에 일관된 시간 정보를 남길 수 있습니다.

### 환경 변수에 DB 주소를 넣는 이유를 설명해보세요.

DB 주소는 로컬, 테스트, 운영 환경마다 다르고 비밀번호 같은 민감 정보가 포함될 수 있습니다. 코드에 박아두면 환경을 바꿀 때마다 코드를 수정해야 하고, GitHub에 노출될 위험도 있습니다. 환경 변수로 분리하면 같은 코드로 여러 환경을 실행하고 시크릿도 더 안전하게 관리할 수 있습니다.
