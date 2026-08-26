# 14단계 단계별 힌트

[단계 설명](./README.md) · [문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md)

한 번에 모두 읽지 말고, 막힌 문제의 1단계부터 차례로 확인하세요.

## 1번. Node 앱 Dockerfile

### 1단계. 개념 환기

- Dockerfile의 각 명령은 이미지 레이어를 만들며, 바뀌지 않은 이전 레이어는 다시 사용할 수 있습니다.
- 의존성 파일을 소스보다 먼저 복사하면 소스만 바뀔 때 설치 레이어를 재사용할 수 있습니다.

### 2단계. 접근 방향

- 런타임 베이스 이미지와 작업 디렉터리를 먼저 정하세요.
- package 파일 복사와 `npm ci`를 소스 전체 복사보다 앞에 두세요.
- 서버가 듣는 포트와 실행 파일 경로를 마지막에 연결하세요.

### 3단계. Dockerfile 명령 수준

```dockerfile
FROM <Node 24 Alpine 이미지>
WORKDIR /app
COPY <의존성 manifest 패턴> ./
RUN npm ci
COPY <build context의 소스> <컨테이너 대상>
EXPOSE <서버 포트>
CMD ["node", "<서버 진입 파일>"]
```

## 2번. .dockerignore 작성

### 1단계. 개념 환기

- `.dockerignore`는 build context에 보내지 않을 파일을 정합니다.
- 로컬 의존성, Git 이력, 시크릿은 이미지 빌드에 포함할 이유가 없습니다.

### 2단계. 접근 방향

- 항목을 한 줄에 하나씩 적으세요.
- Dockerfile이 실제로 복사해야 하는 package 파일과 src는 제외하지 마세요.
- 빌드 시작 로그의 context 크기를 수정 전후로 비교하세요.

### 3단계. 패턴 수준

```text
<로컬 의존성 폴더>
<버전 관리 메타데이터>
<환경 변수 파일>
<npm 오류 로그 패턴>
```

## 3번. 멀티 스테이지 빌드

### 1단계. 개념 환기

- build 단계에는 컴파일 도구가 필요하지만 runtime 단계에는 실행 파일과 JRE만 필요합니다.
- stage 이름을 붙이면 뒤 단계에서 앞 단계의 산출물만 복사할 수 있습니다.

### 2단계. 접근 방향

- 첫 단계는 JDK 이미지에서 Gradle wrapper로 jar를 만드세요.
- 두 번째 단계는 JRE 이미지에서 build stage의 jar만 가져오세요.
- 실행 포트와 `java -jar` 인자를 runtime 단계에 두세요.

### 3단계. Dockerfile 시그니처 수준

```dockerfile
FROM <JDK 25 이미지> AS build
RUN ./gradlew bootJar

FROM <JRE 25 Alpine 이미지>
COPY --from=build <빌드 jar 경로> app.jar
EXPOSE <Spring 포트>
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 4번. docker compose로 앱과 Postgres 실행하기

### 1단계. 개념 환기

- compose 서비스 이름은 같은 네트워크 안에서 호스트 이름으로 사용됩니다.
- `depends_on`은 시작 순서를 표현하지만 DB 준비 완료까지 항상 보장하는 것은 아닙니다.
- named volume은 컨테이너를 다시 만들어도 DB 데이터를 보존합니다.

### 2단계. 접근 방향

- app과 db 서비스를 분리하고 app의 DB 호스트를 localhost가 아닌 db로 두세요.
- Postgres 필수 환경 변수 세 개를 db에 넣으세요.
- 최상위 volume을 선언하고 db 데이터 디렉터리에 연결하세요.

### 3단계. compose 키 수준

```yaml
services:
  app:
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://<user>:<pass>@db:5432/<database>
  db:
    image: <Postgres 18 Alpine 이미지>
    volumes:
      - <볼륨 이름>:/var/lib/postgresql/data

volumes:
  <볼륨 이름>:
```

## 5번. 환경 변수와 시크릿

### 1단계. 개념 환기

- `.env.example`은 키와 예시 형식만 공유하고 실제 비밀값은 담지 않습니다.
- compose의 `${NAME}` 문법은 실행 환경이나 `.env`의 값을 참조합니다.

### 2단계. 접근 방향

- 필요한 키 목록을 example 파일에 만들고 실제 값은 별도 `.env`에 두세요.
- Git과 Docker build context 양쪽에서 `.env`를 제외하세요.
- compose의 고정값을 환경 변수 참조로 바꾼 뒤 누락 시 메시지를 기록하세요.

### 3단계. 변수 참조 수준

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

```text
POSTGRES_USER=<예시임을 알 수 있는 값>
POSTGRES_PASSWORD=<실제 비밀이 아닌 자리표시자>
JWT_SECRET=<실제 비밀이 아닌 자리표시자>
```

## 6번. GitHub Actions CI

### 1단계. 개념 환기

- workflow는 실행 조건과 하나 이상의 job으로 구성됩니다.
- Node와 Java 검증은 서로 다른 실행 환경과 설정 action을 사용할 수 있습니다.

### 2단계. 접근 방향

- main push와 pull request 이벤트를 먼저 선언하세요.
- 두 job 모두 checkout 뒤 각 언어 버전을 설정하세요.
- 프로젝트 경로에 맞는 working directory에서 의존성 설치와 테스트를 실행하세요.

### 3단계. workflow 키 수준

```yaml
on:
  push:
    branches: [main]
  pull_request:

jobs:
  node-test:
    steps:
      - uses: actions/checkout@<버전>
      - uses: actions/setup-node@<버전>
        with:
          node-version: <Node 버전>
      - run: npm ci
      - run: npm test
```

Java job도 같은 구조에서 JDK 설정 action과 Gradle 테스트 명령을 사용하세요.

## 7번. 이미지 크기 비교

### 1단계. 개념 환기

- 이미지 크기는 포함된 런타임, 빌드 도구, OS 패키지, 애플리케이션 레이어의 합입니다.
- 멀티 스테이지는 최종 이미지에서 build 도구를 제외합니다.

### 2단계. 접근 방향

- 비교할 이미지 이름과 태그를 고정하세요.
- 멀티 스테이지 적용 전후의 크기를 같은 명령 출력에서 기록하세요.
- 단순히 “작아졌다”가 아니라 빠진 구성 요소를 이유로 적으세요.

### 3단계. Docker 명령 수준

```bash
docker images <이미지-이름>
docker history <이미지-이름>:<태그>
```

3단계까지 확인한 뒤에도 막히면 마지막으로 [정답 예시와 비교하세요](./answers.md).
