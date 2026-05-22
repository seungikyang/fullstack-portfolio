# Career Hub 멀티 스테이지 Dockerfile.
# 1단계(build): 의존성 설치 + Vite 프론트엔드 빌드
# 2단계(runtime): production 의존성과 빌드 산출물만 담아 이미지 크기를 줄인다.

FROM node:22.12-alpine AS build
WORKDIR /app

# package*.json만 먼저 복사해 의존성 변화가 없을 때 도커 캐시 레이어를 재사용한다.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22.12-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5100

# production 의존성만 다시 설치한다(devDependencies 제거).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 빌드 산출물과 서버 코드만 복사한다.
COPY --from=build /app/dist ./dist
COPY server ./server
COPY scripts ./scripts
COPY data ./data

# 비루트 사용자로 실행해 컨테이너 권한을 최소화한다.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 5100

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:5100/api/health || exit 1

CMD ["node", "server/index.js"]
