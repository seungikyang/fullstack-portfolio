# 14단계 Docker와 배포 자동화

## 목표

Docker로 애플리케이션을 컨테이너로 패키징하고, docker compose로 앱 + DB를 함께 실행하는 흐름을 익힙니다. SI/SW 실무에서는 "개발 환경에서는 됐는데 운영에서는 안 된다" 문제를 줄이기 위해 컨테이너화가 사실상 표준이 됐습니다.

GitHub Actions로 push 시 자동 빌드를 실행하는 간단한 CI 파이프라인도 함께 만듭니다.

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

### 컨테이너와 가상 머신의 차이를 한 문장으로 설명해보세요.

가상 머신은 OS 전체를 가상화하고, 컨테이너는 호스트 OS 커널을 공유하면서 애플리케이션 실행 환경만 격리합니다.

### 멀티 스테이지 빌드를 쓰는 이유는 무엇인가요?

빌드 단계에는 컴파일 도구와 devDependencies가 필요하지만 운영 실행 단계에는 최종 산출물만 필요합니다. 멀티 스테이지 빌드는 빌드용 이미지와 실행용 이미지를 분리해 최종 이미지 크기와 공격 표면을 줄입니다. Node나 Spring 앱에서 빌드 결과물만 runtime stage에 복사하는 방식이 대표적입니다.

### `.dockerignore`가 없으면 어떤 일이 일어나나요?

Docker build context에 `node_modules`, `.git`, 로그, 로컬 환경 파일까지 전송될 수 있습니다. 그 결과 빌드가 느려지고 이미지가 커지며, 민감 정보가 이미지 레이어에 포함될 위험도 있습니다. `.dockerignore`는 빌드에 필요 없는 파일을 제외해 속도와 보안을 모두 개선합니다.

### 이미지 크기를 줄이려면 어떤 베이스 이미지를 골라야 하나요?

운영용 이미지는 `node:alpine`, `node:slim`, `eclipse-temurin:*-jre`처럼 필요한 런타임만 포함한 작은 이미지를 선택합니다. 단, Alpine은 musl libc 차이로 일부 네이티브 패키지 호환 문제가 있을 수 있어 테스트가 필요합니다. 안정성이 중요하면 slim 계열, 크기 최소화가 중요하면 alpine 계열을 검토합니다.

### 컨테이너 안에서 환경 변수를 어떻게 주입하나요?

`docker run -e KEY=value`로 직접 넣거나 `--env-file .env`를 사용할 수 있습니다. docker compose에서는 `environment` 또는 `env_file` 항목으로 주입합니다. 운영 환경에서는 플랫폼의 시크릿 관리 기능이나 CI/CD 시크릿을 통해 주입하는 것이 좋습니다.

### 운영 환경에서 SECRET 값을 Dockerfile에 박으면 왜 위험한가요?

Dockerfile에 시크릿을 넣으면 이미지 레이어와 빌드 기록에 남을 수 있습니다. 이미지를 레지스트리에 올리거나 다른 사람이 pull하면 시크릿이 함께 노출될 위험이 있습니다. 시크릿은 이미지에 포함하지 않고 실행 시점의 환경 변수나 시크릿 매니저로 주입해야 합니다.
