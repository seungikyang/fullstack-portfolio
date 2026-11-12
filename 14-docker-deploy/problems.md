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

`starter/` 폴더의 빈칸을 채우며 진행합니다. 막히면 먼저 `hints.md`의 1~3단계를 순서대로 보고, 마지막에만 `answers.md`와 비교하세요.

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

- 아래 4지선다 K01에서 멀티 스테이지 적용 전후의 비교 기준을 고르세요.
- 아래 4지선다 R14-04에서 작은 베이스 이미지의 장점과 호환성 확인 기준을 고르세요.

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS14-01. Dockerfile에 비밀번호·토큰을 넣지 않는 적절한 이유는?

Dockerfile에 비밀번호·토큰을 넣지 않는 적절한 이유는? — 알맞은 설명 또는 답변 방식을 고르세요.

1. Dockerfile에 넣으면 값이 자동 암호화되어 누구도 볼 수 없다.
2. 이미지 레지스트리가 모든 비밀번호를 자동 폐기한다.
3. 파일 이름이 Dockerfile이면 공개된 시크릿도 안전하다.
4. 소스·이미지·빌드 기록 등에 남을 수 있으므로 필요한 비밀을 실행 환경에서 안전하게 제공한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

이미지와 빌드 결과가 비밀의 노출 경로가 될 수 있습니다. 실행 시 필요한 값을 안전하게 주입하고 로그와 이미지에도 남기지 않도록 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W440)

### PS14-02. Docker 빌드의 재현성을 높이는 방법은?

Docker 빌드의 재현성을 높이는 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. lockfile·베이스 이미지 버전 또는 digest·빌드 입력을 관리하고 같은 조건으로 재빌드해 확인한다.
2. 항상 latest만 쓰면 어떤 날짜에도 완전히 같은 이미지가 보장된다.
3. package-lock.json을 삭제하면 의존성이 항상 동일하다.
4. 빌드에 외부 변경이 있어도 명령 문자열만 같으면 결과가 반드시 같다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

명령뿐 아니라 의존성·이미지·빌드 입력도 결과에 영향을 줍니다. 고정한 조건과 실제 재빌드 결과를 확인하며 버전 고정이 모든 외부 변수를 없애지는 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W441)

### PS14-03. Compose에서 짧은 depends_on만 설정한 경우 알맞은 설명은?

Compose에서 짧은 depends_on만 설정한 경우 알맞은 설명은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. DB의 모든 SQL 요청이 성공할 때까지 항상 자동 대기한다.
2. 의존 서비스의 시작 순서를 다루지만 DB 요청 처리 준비까지 보장하지 않아 healthcheck와 조건 등을 확인한다.
3. 모든 컨테이너를 항상 알파벳순으로 시작한다.
4. depends_on이 있으면 앱의 연결 실패 대응은 언제나 불필요하다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

컨테이너가 실행되는 것과 DB가 요청을 처리할 준비가 되는 것은 다릅니다. service_healthy 조건과 healthcheck, 앱의 연결 재시도 정책을 함께 검토합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W442)

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

이미지 비교 문제 · [웹에서 채점하기](../quiz/index.html?bank=written&category=docker)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### K01. 멀티 스테이지 적용 전후 비교

멀티 스테이지 적용 전후 비교 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 설정 이름이 멀티 스테이지면 크기를 측정할 필요가 없다.
2. 최종 이미지의 포함 파일과 실제 크기·실행 결과를 비교한다.
3. 이미지가 작으면 모든 취약점이 사라진 것이다.
4. 빌드 도구를 제거하면 앱 실행 검증은 필요 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

최종 단계에 필요한 산출물이 들어 있는지와 앱이 실제 동작하는지 확인합니다.

</details>

### R14-04. 이미지 크기를 줄이려면 어떤 베이스 이미지를 골라야 하나요?

이미지 크기를 줄이려면 어떤 베이스 이미지를 골라야 하나요? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 이름에 alpine이 있으면 모든 라이브러리가 반드시 호환된다.
2. 필요한 런타임이 있는 작은 이미지를 선택하고 네이티브 모듈·libc·실행 호환성과 실제 크기를 확인한다.
3. 베이스 이미지가 작으면 앱 실행 검증이 필요 없다.
4. 모든 빌드 도구를 운영 이미지에 넣어야 크기가 최소다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

작은 베이스는 포함 파일이 적어 크기를 줄일 수 있습니다. Alpine의 musl 차이 등 실행 조건을 확인하고 최종 이미지의 크기와 동작을 측정합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W234)

<!-- written-choice:end -->
