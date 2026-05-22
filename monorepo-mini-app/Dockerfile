# Note Hub 멀티 스테이지 Dockerfile.
# build  : workspaces 전체를 한 번에 빌드 (shared TS → api TS → web Vite)
# runtime: 빌드 산출물과 manifest만 가져온 뒤 prod 의존성을 새로 설치한다.
#          (npm workspaces가 만드는 심볼릭링크는 COPY --from에서 깨지므로, 런타임에서 다시
#           install하는 게 가장 단순하고 안정적이다.)

FROM node:22.12-alpine AS build
WORKDIR /repo

# package.json들만 먼저 복사해 의존성 변화가 없으면 도커 캐시 레이어를 재사용.
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/

RUN npm install --workspaces --include-workspace-root

# 소스 복사 후 전체 빌드 (shared 먼저 → 다른 패키지의 의존)
COPY packages ./packages
RUN npm run build -w @note-hub/shared \
 && npm run build -w @note-hub/api \
 && npm run build -w @note-hub/web

FROM node:22.12-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5200

# Manifest와 lockfile.
COPY --from=build /repo/package.json /repo/package-lock.json* ./

# 각 workspace의 package.json + 빌드 산출물만 가져온다 (소스/test/devDeps 산출물 제외).
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=build /repo/packages/api/package.json ./packages/api/package.json
COPY --from=build /repo/packages/api/openapi.json ./packages/api/openapi.json
COPY --from=build /repo/packages/api/dist ./packages/api/dist
COPY --from=build /repo/packages/web/package.json ./packages/web/package.json
COPY --from=build /repo/packages/web/dist ./packages/web/dist

# 런타임에서 prod 의존성만 다시 설치한다. npm workspaces가 깨끗한 심볼릭링크를 새로 만든다
# (node_modules/@note-hub/shared → packages/shared 등).
RUN npm install --omit=dev --workspaces --include-workspace-root \
 && npm cache clean --force

# 비루트 사용자로 실행해 컨테이너 권한을 최소화한다.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 5200

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:5200/api/health || exit 1

CMD ["node", "packages/api/dist/server.js"]
