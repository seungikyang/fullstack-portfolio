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
      04-node-board-api/src \
      14-docker-deploy/starter/node-board/

cd 14-docker-deploy/starter/node-board
docker build -t board-api .
docker run --rm -p 4000:4000 board-api
```

자세한 절차는 [starter/node-board/README.md](./starter/node-board/README.md)를 보세요.

### Spring Boot API를 컨테이너로

```bash
cd 14-docker-deploy/starter/spring-board
./gradlew bootJar
docker build -t spring-board .
docker run -p 8080:8080 spring-board
```

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

- Node.js 또는 Spring Boot 앱을 Dockerfile로 패키징했습니다.
- docker compose로 앱과 Postgres(또는 MySQL)를 함께 실행했습니다.
- `.dockerignore`로 `node_modules`와 `.git`을 제외했습니다.
- GitHub Actions로 push 시 자동 빌드/테스트가 실행되도록 설정했습니다.
- 이미지 크기를 한 번 이상 줄여봤습니다 (멀티 스테이지 빌드).

## 취업 연결

SI/SW 실무에서 Docker는 다음과 같은 가치를 가집니다.

- "내 노트북에서는 됐는데"를 막아줍니다.
- 운영 서버에 같은 이미지를 배포하므로 환경 차이가 적습니다.
- Kubernetes를 쓰는 회사라면 Docker는 사실상 전제 조건입니다.

이 단계가 끝나면 "Node와 Spring Boot 앱을 각각 Dockerfile로 컨테이너화하고 compose로 DB와 함께 실행했으며, GitHub Actions로 push 시 자동 테스트가 돌도록 설정했다"고 설명할 수 있어야 합니다.

## 핵심 개념

- 이미지(image) vs 컨테이너(container).
- 레이어 캐시. 같은 라인이 위에 있으면 캐시 재사용이 잘됩니다.
- 멀티 스테이지 빌드. 빌드 도구는 최종 이미지에서 빠집니다.
- 환경 변수와 시크릿. Dockerfile에 시크릿을 박지 않습니다.
- docker compose. 여러 서비스를 한 번에 정의.
- CI 파이프라인의 단계. checkout → install → test → build → push image.

## 면접 연습

- 컨테이너와 가상 머신의 차이를 한 문장으로 설명해보세요.
- 멀티 스테이지 빌드를 쓰는 이유는 무엇인가요?
- `.dockerignore`가 없으면 어떤 일이 일어나나요?
- 이미지 크기를 줄이려면 어떤 베이스 이미지를 골라야 하나요?
- 컨테이너 안에서 환경 변수를 어떻게 주입하나요?
- 운영 환경에서 SECRET 값을 Dockerfile에 박으면 왜 위험한가요?
