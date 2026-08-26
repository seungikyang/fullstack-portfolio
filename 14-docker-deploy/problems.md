# 14단계 Docker 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

Dockerfile부터 compose와 CI까지 실제 파일을 문제 번호 순서대로 수정하세요.

- [Node Dockerfile 코드 보기](./starter/node-board/Dockerfile?view=source)
- [Node .dockerignore 보기](./starter/node-board/.dockerignore?view=source)
- [Spring Dockerfile 코드 보기](./starter/spring-board/Dockerfile?view=source)
- [Postgres compose 코드 보기](./starter/compose-postgres/docker-compose.yml?view=source)
- [compose 환경 변수 예시 보기](./starter/compose-postgres/.env.example?view=source)
- [GitHub Actions CI 코드 보기](./starter/.github/workflows/ci.yml?view=source)

`starter/` 폴더의 빈칸을 채우며 진행합니다. 막히면 `answers.md`와 비교하세요.

## 1번. Node 앱 Dockerfile

`starter/node-board/Dockerfile`의 빈칸을 채우세요.

먼저 워크북 루트에서 완성한 4단계의 `package.json`, `package-lock.json`, `src`를 `starter/node-board`로 복사합니다. Dockerfile이 `npm ci`를 실행하므로 lockfile이 반드시 같은 build context에 있어야 합니다.

- 베이스 이미지는 `node:24-alpine`.
- `package*.json`을 먼저 복사해 `npm ci`를 실행 (캐시 최대화).
- 그 다음 소스 코드 복사.
- 포트 4000 노출.
- 실행 명령은 `node src/server.js`.

검증.

```bash
docker build -t board-api .
docker run --rm -p 4000:4000 board-api
curl http://localhost:4000/health
```

## 2번. .dockerignore 작성

`starter/node-board/.dockerignore`에 다음을 추가하세요.

- `node_modules`.
- `.git`.
- `.env`.
- `npm-debug.log`.

검증. 빌드 로그에서 컨텍스트 크기가 줄어드는지 확인하세요.

## 3번. 멀티 스테이지 빌드 (Spring)

`starter/spring-board/Dockerfile`의 빈칸을 채우세요.

이 폴더에는 Spring 프로젝트가 없습니다. 11단계에서 직접 만든 `11-java-spring/starter/board-api`가 `./gradlew bootRun`으로 실행되는지 먼저 확인한 뒤, 완성한 Dockerfile을 그 프로젝트 루트에 복사합니다.

- 1단계. `eclipse-temurin:25-jdk`로 `./gradlew bootJar` 실행.
- 2단계. `eclipse-temurin:25-jre-alpine`에 빌드 결과 jar만 복사.
- 포트 8080 노출.
- 실행 명령은 `java -jar app.jar`.

검증.

```bash
cp 14-docker-deploy/starter/spring-board/Dockerfile \
   11-java-spring/starter/board-api/Dockerfile
cd 11-java-spring/starter/board-api
./gradlew bootJar
docker build -t spring-board .
docker images spring-board
# JDK 단일 스테이지보다 이미지가 작아야 합니다.
```

## 4번. docker compose로 앱 + Postgres

`starter/compose-postgres/docker-compose.yml`의 빈칸을 채우세요.

- `app` 서비스. 4번 게시판 API. `db`에 의존(`depends_on`).
- `db` 서비스. `postgres:18-alpine`. 환경 변수로 `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` 설정. 볼륨 `pgdata`로 데이터 영속화.
- `app`에 `DATABASE_URL` 환경 변수를 `postgresql://user:pass@db:5432/board`로 주입.

검증.

```bash
docker compose up -d
docker compose ps
docker compose exec db psql -U user -d board -c "\dt"
```

## 5번. 환경 변수와 시크릿

`starter/compose-postgres/.env.example`을 만들고 실제 값은 `.env`에 두세요.

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`.
- `.gitignore`와 `.dockerignore`에 `.env`를 추가.
- compose 파일은 `${POSTGRES_USER}` 식으로 변수 참조.

검증. `.env`를 삭제하면 compose가 어떤 에러를 내는지 확인하세요.

## 6번. GitHub Actions CI

`starter/.github/workflows/ci.yml`의 빈칸을 채우세요.

- main 브랜치 push 또는 PR 시 실행.
- Node 24 LTS로 `npm ci`, `npm test` 실행.
- Java 25 LTS로 `./gradlew test` 실행 (job 분리).

검증. 실제 GitHub에 push 한 뒤 Actions 탭에서 초록 체크가 뜨는지 확인하세요.

## 7번. 이미지 크기 비교

다음 명령으로 1번과 3번 이미지 크기를 비교하세요.

```bash
docker images | grep -E "board-api|spring-board"
```

- 멀티 스테이지 적용 전후 차이를 한 줄로 기록하세요.
- Alpine 베이스를 쓰면 왜 작아지는지 한 문장으로 정리하세요.

## 자가 점검

- Dockerfile에 비밀번호나 토큰이 들어 있지 않나요?
- 빌드가 같은 명령으로 매번 재현되나요? (의존성 버전 고정)
- compose가 어떤 순서로 컨테이너를 시작하는지 확인했나요?
