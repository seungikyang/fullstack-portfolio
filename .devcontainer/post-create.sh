#!/usr/bin/env bash
# DevContainer가 처음 빌드된 뒤 한 번 실행되는 셋업 스크립트.
# 8번 포트폴리오 프로젝트와 monorepo-mini-app의 npm 의존성을 미리 설치한다.
set -euo pipefail

WORKSPACE_ROOT="$(pwd)"

install_project() {
  local rel="$1"
  local label="$2"
  if [ -d "$WORKSPACE_ROOT/$rel" ]; then
    echo "[post-create] ${label} 의존성 설치"
    (cd "$WORKSPACE_ROOT/$rel" && (npm ci || npm install))
  fi
}

install_project "08-fullstack-portfolio-project" "8번 포트폴리오"

if [ -d "$WORKSPACE_ROOT/08-fullstack-portfolio-project" ]; then
  echo "[post-create] husky 활성화 시도 (실패해도 무시)"
  (cd "$WORKSPACE_ROOT/08-fullstack-portfolio-project" && (npm run prepare || true))
fi

install_project "monorepo-mini-app" "monorepo-mini-app"

if [ -d "$WORKSPACE_ROOT/monorepo-mini-app" ]; then
  echo "[post-create] monorepo-mini-app 공유 패키지 1회 빌드"
  (cd "$WORKSPACE_ROOT/monorepo-mini-app" && npm run build -w @note-hub/shared || true)
fi

echo "[post-create] 완료."
echo "  - Career Hub:           cd 08-fullstack-portfolio-project && npm run dev"
echo "  - Note Hub (인메모리):  cd monorepo-mini-app && npm run dev"
echo "  - Note Hub (Postgres):  cd monorepo-mini-app && docker compose -f docker-compose.dev.yml up -d && DATABASE_URL=postgres://notehub:notehub@localhost:5432/notehub npm run dev"
