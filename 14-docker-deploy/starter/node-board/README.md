# node-board starter 안내

이 폴더의 `Dockerfile`은 4단계 게시판 API 코드를 컨테이너로 패키징합니다. 따라서 빌드 전에 4단계 코드를 이 폴더로 복사해야 합니다.

## 시작 절차

```bash
# 워크북 루트에서
cp -R 04-node-board-api/package.json \
      04-node-board-api/package-lock.json \
      04-node-board-api/src \
      14-docker-deploy/starter/node-board/

# 그 다음 Dockerfile 빈칸을 채우세요.
cd 14-docker-deploy/starter/node-board
docker build -t board-api .
docker run --rm -p 4000:4000 board-api
```

## 빌드 검증

```bash
# 다른 터미널에서
curl http://localhost:4000/health
# 응답 예시: {"status":"ok"}
```

## 주의

- `node_modules`는 복사하지 않습니다. `package-lock.json`은 반드시 복사해야 하며, Dockerfile의 `npm ci`는 `package.json`과 lockfile이 함께 있어야 실행됩니다.
- 이 폴더의 `.dockerignore`가 컨텍스트에서 `node_modules`와 `.git`을 제외합니다.
- 4단계 코드의 빈칸이 채워져 있어야 컨테이너가 정상 실행됩니다.

## 운영에서 더 안전하게

```dockerfile
# non-root 사용자로 실행 (보안 권장)
USER node
```

```dockerfile
# health check 추가
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1
```

운영 배포라면 위 두 줄을 Dockerfile 끝에 추가합니다. 학습용으로는 생략해도 됩니다.
