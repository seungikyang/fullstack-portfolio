# 14단계 Docker와 배포 자동화

[HTML 목차](../index.html) · 학습 흐름. [문제 풀기](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 목표

Docker로 애플리케이션을 컨테이너로 패키징하고, docker compose로 앱 + DB를 함께 실행하는 흐름을 익힙니다. SI/SW 실무에서는 "개발 환경에서는 됐는데 운영에서는 안 된다" 문제를 줄이기 위해 컨테이너화가 사실상 표준이 됐습니다.

GitHub Actions로 push 시 자동 빌드를 실행하는 간단한 CI 파이프라인도 함께 만듭니다.

## 기술을 쓰는 이유와 동작 흐름

처음 보는 용어는 [전체 기술 안내서](../technology-guide.md)와 함께 읽으세요. 아래 흐름은 실습을 이해하기 위한 안내이며, 빈칸과 완료 체크는 직접 진행합니다.

| 기술 | 무엇이고, 왜 필요한가요? | 이 실습에서는 어떻게 쓰나요? |
| --- | --- | --- |
| Docker·이미지·컨테이너 | 이미지는 실행 파일과 환경을 묶은 틀이고, 컨테이너는 그 틀로 실행한 프로그램 환경입니다. 컴퓨터마다 설치 상태가 다른 문제를 줄입니다. | [Node Dockerfile](./starter/node-board/Dockerfile)에서 앱 실행 환경을 만드는 순서를 작성합니다. |
| Docker Compose | 여러 컨테이너의 실행 설정을 한 파일로 관리하는 도구입니다. 앱과 DB를 함께 준비할 때 반복 명령을 줄입니다. | [docker-compose.yml](./starter/compose-postgres/docker-compose.yml)이 앱·PostgreSQL DB와 시작 조건을 선언합니다. |
| 볼륨·상태 검사 | 볼륨은 컨테이너와 별도로 관리하는 저장 공간이고, 상태 검사는 서비스 준비 여부를 확인하는 명령입니다. 데이터 보관과 실행 순서를 다룹니다. | Compose의 DB 저장 영역과 `healthcheck` 설정을 읽습니다. |
| GitHub Actions·CI | GitHub Actions는 저장소 이벤트로 작업을 실행하는 도구이며, CI는 변경을 합칠 때 자동으로 검증하는 흐름입니다. 같은 확인을 빠뜨리지 않게 합니다. | [워크플로우 예제](./starter/.github/workflows/ci.yml)를 실습합니다. 예제 폴더에 있는 것만으로 자동 실행되지는 않습니다. |

**컨테이너 요청의 처리 순서:** Dockerfile로 이미지 생성 → 이미지로 컨테이너 시작 → 공개한 포트로 요청 → 컨테이너 안의 앱 처리 → 응답 반환. 설정 파일을 완성했다는 것과 컨테이너가 실제 요청에 응답했다는 것은 구분해 기록합니다.

**직접 관찰하기:** 앱 응답과 DB 준비 상태를 각각 확인하세요. 이 예제의 4단계 Node 앱은 메모리 저장소를 쓰므로 Compose가 `DATABASE_URL`을 전달해도 자동으로 DB에 저장하지 않습니다. 실제 DB 연결 코드를 추가하고 저장 결과를 확인해야 DB 연동 경험이 됩니다. Career Hub의 Docker 설정을 읽을 때도 이미지·실행·저장의 역할을 구분합니다.

## 실행 방법

### 사전 준비

- Docker Desktop 설치 (macOS, Windows). https://www.docker.com/products/docker-desktop
- Linux는 Docker Engine + Docker Compose plugin 설치(`sudo apt install docker.io docker-compose-plugin`).
- 설치 후 다음 명령이 모두 출력을 내야 합니다.
  ```bash
  docker --version          # Docker version 24.x 이상
  docker compose version    # Docker Compose version v2.x 이상
  docker run hello-world    # 이미지 풀과 컨테이너 실행이 정상 동작
  ```
- macOS Apple Silicon(M1~M4)에서 AMD64 이미지를 배포할 계획이면 빌드 시 `--platform=linux/amd64`를 명시하세요.

### 4단계 게시판 API를 컨테이너로

```bash
# 4단계 코드를 starter 폴더로 가져옵니다.
cp -R 04-node-board-api/package.json \
      04-node-board-api/package-lock.json \
      04-node-board-api/src \
      14-docker-deploy/starter/node-board/

cd 14-docker-deploy/starter/node-board
docker build -t board-api .
docker run --rm -p 4000:4000 board-api
```

자세한 절차는 [starter/node-board/README.md](./starter/node-board/README.md)를 보세요.

### Spring Boot API를 컨테이너로

`starter/spring-board`에는 학습용 Dockerfile만 있습니다. 먼저 11단계에서 `11-java-spring/starter/board-api`를 직접 만들고 `./gradlew bootRun`까지 확인해야 합니다. 그 프로젝트 루트로 Dockerfile을 복사해야 `gradlew`, `build.gradle`, `src`가 같은 Docker build context에 들어갑니다.

```bash
# 워크북 루트에서 실행
test -f 11-java-spring/starter/board-api/gradlew
cp 14-docker-deploy/starter/spring-board/Dockerfile \
   11-java-spring/starter/board-api/Dockerfile

cd 11-java-spring/starter/board-api
./gradlew bootJar     # Docker 전에 원본 프로젝트 빌드가 되는지 먼저 확인
docker build -t spring-board .
docker run --rm -p 8080:8080 spring-board
```

`test -f`가 실패하면 11단계 Spring 프로젝트가 아직 없는 상태입니다. 이때는 완료형 이력서 문장을 쓰지 말고 11단계를 먼저 진행합니다.

### docker compose로 앱 + Postgres 함께

```bash
cd 14-docker-deploy/starter/compose-postgres
cp .env.example .env   # 실제 값으로 한 번 채운 뒤 진행
docker compose up -d
docker compose ps        # 두 서비스가 healthy 상태인지 확인
docker compose logs -f app
```

### 종료와 정리

```bash
# 컨테이너만 중지 (볼륨 유지)
docker compose down

# 볼륨까지 삭제 (DB 데이터 초기화)
docker compose down -v
```

## 완료 기준

아래 항목은 해당 명령을 직접 실행하고 결과를 확인한 경우에만 체크합니다. Node 또는 Spring 한 가지만 수행했다면 수행한 대상만 설명합니다.

- [ ] Node.js 또는 Spring Boot 앱을 Dockerfile로 빌드하고 컨테이너를 실행했습니다.
- [ ] docker compose로 앱과 Postgres(또는 MySQL)를 함께 실행했습니다.
- [ ] `.dockerignore`로 `node_modules`와 `.git`을 제외했습니다.
- [ ] GitHub Actions에서 실제 push 또는 PR의 빌드·테스트 통과를 확인했습니다.
- [ ] `docker images` 결과로 멀티 스테이지 적용 전후 이미지 크기를 기록했습니다.

완료로 표시하기 전 [학습 근거 4종](../student-checklist.md#단계마다-남길-4종-근거)에 Docker 명령, 컨테이너·CI 결과, 해결한 빌드 오류, 바꾼 Dockerfile·workflow 위치를 기록합니다.

## 취업 연결

SI/SW 실무에서 Docker는 다음과 같은 가치를 가집니다.

- "내 노트북에서는 됐는데"를 막아줍니다.
- 운영 서버에 같은 이미지를 배포하므로 환경 차이가 적습니다.
- 컨테이너 기반 배포를 사용하는 조직에서는 Docker 이미지와 실행 환경을 이해하는 데 도움이 됩니다.

Node와 Spring Boot 양쪽의 이미지 실행, compose DB 연결, GitHub Actions 통과 로그를 모두 확보한 경우에만 "두 앱을 각각 컨테이너화하고 CI에서 검증했다"고 설명합니다. 일부만 완료했다면 실제로 실행한 대상과 명령만 말합니다.

## 핵심 개념

- 이미지(image) vs 컨테이너(container).
- 레이어 캐시. 같은 라인이 위에 있으면 캐시 재사용이 잘됩니다.
- 멀티 스테이지 빌드. 빌드 도구는 최종 이미지에서 빠집니다.
- 환경 변수와 시크릿. Dockerfile에 시크릿을 박지 않습니다.
- docker compose. 여러 서비스를 한 번에 정의.
- CI 파이프라인의 단계. checkout → install → test → build → push image.

## 면접 연습

<!-- written-choice:start -->
4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### R14-01. 컨테이너와 가상 머신의 차이를 한 문장으로 설명해보세요.

컨테이너와 가상 머신의 차이를 한 문장으로 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 컨테이너마다 항상 별도 하드웨어가 필요하다.
2. VM은 OS를 가질 수 없다.
3. 컨테이너는 보통 호스트 커널을 공유하고 VM은 게스트 OS와 커널을 가진다.
4. 컨테이너 이미지는 실행 중인 프로세스 그 자체이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

격리 방식과 실행 단위를 구분합니다. 이미지와 실행된 컨테이너도 다른 개념입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W231)

### R14-02. 멀티 스테이지 빌드를 쓰는 이유는 무엇인가요?

멀티 스테이지 빌드를 쓰는 이유는 무엇인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 모든 중간 이미지의 파일을 최종 이미지에 반드시 합친다.
2. 멀티 스테이지는 npm의 모든 취약점을 자동 수정한다.
3. 빌드를 여러 단계로 나누면 소스를 검사할 수 없다.
4. 빌드 도구와 실행에 필요한 산출물을 분리해 최종 이미지에 필요한 파일만 포함한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

최종 단계에 실행 산출물과 필요한 런타임을 복사합니다. 크기와 포함 파일을 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W232)

### R14-03. `.dockerignore`가 없으면 어떤 일이 일어나나요?

`.dockerignore`가 없으면 어떤 일이 일어나나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 빌드 컨텍스트에서 불필요한 파일과 비밀값 등을 제외한다.
2. .dockerignore는 이미 Git에 올라간 비밀값을 무효화한다.
3. .dockerignore는 컨테이너 CPU 수를 고정한다.
4. .dockerignore가 있으면 Dockerfile이 필요 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

빌드 전송 범위와 이미지에 들어갈 파일을 관리합니다. Git의 추적 규칙과는 별개입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W233)

### R14-04. 이미지 크기를 줄이려면 어떤 베이스 이미지를 골라야 하나요?

이미지 크기를 줄이려면 어떤 베이스 이미지를 골라야 하나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

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

### R14-05. 컨테이너 안에서 환경 변수를 어떻게 주입하나요?

컨테이너 안에서 환경 변수를 어떻게 주입하나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 컨테이너의 환경 변수는 Dockerfile에만 고정할 수 있다.
2. -p 옵션이 모든 환경 변수를 자동 주입한다.
3. docker run의 -e/--env-file 또는 compose의 environment/env_file 등으로 실행 설정을 주입한다.
4. 환경 변수를 쓰면 컨테이너 접근 권한과 로그 보안이 필요 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

실행 환경에 맞게 변수를 주입합니다. 비밀 값에는 플랫폼의 시크릿 관리 기능을 고려하며 이미지·로그에 노출되지 않게 합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W235)

### R14-06. 운영 환경에서 SECRET 값을 Dockerfile에 박으면 왜 위험한가요?

운영 환경에서 SECRET 값을 Dockerfile에 박으면 왜 위험한가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 최종 파일에서 지우면 과거 레이어의 비밀 값도 항상 제거된다.
2. 레지스트리에 올린 이미지 안의 비밀 값은 아무도 읽을 수 없다.
3. SECRET이라는 이름을 쓰면 값이 자동으로 암호화된다.
4. Dockerfile·이미지 레이어·빌드 이력에 비밀 값이 남아 이미지 공유 시 노출될 수 있다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

비밀 값은 이미지에 고정하지 않습니다. 실행 시점 주입과 시크릿 관리 기능을 사용하고 이미 노출된 값은 폐기·교체합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W236)

<!-- written-choice:end -->
