# Node.js 게시판 API를 컨테이너로 패키징하는 Dockerfile

FROM ____

WORKDIR /app

# TODO: 의존성 캐시 레이어를 만들기 위해 package*.json만 먼저 복사하세요.
COPY ____ ./
RUN npm ci --omit=dev

# TODO: 그 다음 소스 코드 전체를 복사하세요.
COPY ____ ____

EXPOSE ____
CMD ["node", "____"]
