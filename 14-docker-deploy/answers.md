# 14단계 Docker 정답 예시

[문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md) · [다음 단계](../15-cs-fundamentals/README.md)

## 1번 정답 예시

```dockerfile
# starter/node-board/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]
```

설명. `package*.json`을 먼저 복사해 의존성 설치 레이어를 캐시합니다. 소스 코드만 바뀌면 `npm ci` 단계는 캐시가 재사용돼 빌드가 빠릅니다.

## 2번 정답 예시

```
# .dockerignore
node_modules
.git
.env
.env.*
npm-debug.log
dist
coverage
.DS_Store
```

설명. `.dockerignore`가 없으면 `COPY . .` 단계에서 `node_modules`까지 통째로 복사돼 빌드가 느려지고 이미지가 커집니다.

## 3번 정답 예시

```dockerfile
# starter/spring-board/Dockerfile
# 1단계: build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY . .
RUN ./gradlew bootJar --no-daemon

# 2단계: runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

설명. 빌드 도구는 1단계에만 남고 최종 이미지에는 JRE와 jar만 들어갑니다. 보통 절반 이하 크기가 됩니다.

## 4번 정답 예시

```yaml
# starter/compose-postgres/docker-compose.yml
services:
  app:
    build: ../node-board
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

설명. `depends_on` 단독은 "DB 컨테이너가 떴다"만 보장합니다. 실제로 DB가 받을 준비가 됐는지는 `healthcheck`로 확인해야 안전합니다.

## 5번 정답 예시

```
# .env.example
POSTGRES_USER=user
POSTGRES_PASSWORD=changeme
POSTGRES_DB=board
JWT_SECRET=changeme
```

`.env`는 같은 형식으로 만들되 실제 값을 넣고 git에서 제외합니다. 컴포즈가 자동으로 `.env`를 읽어 변수에 주입합니다.

## 6번 정답 예시

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  node:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
        working-directory: 14-docker-deploy/starter/node-board
      - run: npm test
        working-directory: 14-docker-deploy/starter/node-board

  java:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: "temurin"
          java-version: "21"
      - run: ./gradlew test --no-daemon
        working-directory: 11-java-spring/starter/board-api
```

설명. 두 job을 분리하면 한쪽이 실패해도 다른 쪽 결과를 별도로 확인할 수 있습니다.

## 7번 이미지 크기 비교 예시

```bash
$ docker images | grep -E "board-api|spring-board"
spring-board   latest   abc...   2 minutes ago   220MB
board-api      latest   def...   3 minutes ago   180MB
```

설명. JDK 단일 스테이지로 빌드하면 같은 jar라도 600MB 이상이 됩니다. JRE-alpine으로 옮기면 200MB대까지 줄어듭니다.

## 자주 막히는 부분

- `permission denied` (gradlew 실행). `chmod +x gradlew` 또는 Dockerfile에서 `RUN chmod +x gradlew`.
- `EADDRINUSE`. 호스트의 같은 포트에서 다른 프로세스가 떠 있는 경우. `-p 4001:4000`처럼 다른 호스트 포트를 매핑.
- compose가 `.env`를 못 읽음. 파일이 compose.yml과 같은 디렉토리에 있어야 합니다.
- 멀티 스테이지에서 `COPY --from=build` 경로 오타. `build` 단계의 `WORKDIR`와 `bootJar` 출력 경로를 확인하세요.
- M1/M2 Mac에서 이미지가 다른 아키텍처로 빌드되어 EC2에서 안 뜸. `--platform=linux/amd64` 옵션을 명시하세요.

## 운영에서 주의할 점

- Dockerfile에 비밀번호, API 키를 절대 박지 않습니다. 빌드 secret은 BuildKit secret을 사용하세요.
- 베이스 이미지는 정기 갱신해야 합니다. CVE 패치가 빠진 이미지를 그대로 운영에 두지 않습니다.
- `latest` 태그를 운영 배포에 쓰지 않습니다. 명시적 버전이나 커밋 SHA를 태그로 씁니다.
