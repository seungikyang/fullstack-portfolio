# Spring Boot 게시판을 멀티 스테이지로 빌드하는 Dockerfile

# 1단계 빌드. JDK가 필요합니다.
FROM ____ AS build
WORKDIR /workspace
COPY . .
RUN ./gradlew bootJar --no-daemon

# 2단계 런타임. JRE만 있으면 됩니다.
FROM ____
WORKDIR /app
# TODO: 1단계의 빌드 결과 jar를 복사하세요.
COPY --from=____ /workspace/build/libs/*.jar app.jar
EXPOSE ____
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
