# 11단계 starter 안내

이 폴더는 Spring Initializr로 받은 zip을 풀어 넣는 자리입니다. 빈 상태로 시작합니다.

## 시작 절차

1. https://start.spring.io 에 접속.
2. 다음 옵션으로 설정.
   - Project. Gradle - Groovy.
   - Language. Java.
   - Spring Boot. 3.3 이상.
   - Group. `com.example`.
   - Artifact. `board-api`.
   - Packaging. Jar.
   - Java. 21.
3. Dependencies. 다음 5개를 추가.
   - Spring Web.
   - Spring Data JPA.
   - H2 Database.
   - Lombok.
   - Validation.
4. Generate 버튼으로 zip 다운로드.
5. 압축을 풀어 이 `starter/` 폴더 안에 `board-api/` 폴더가 생기도록 옮깁니다.
6. `cd board-api && ./gradlew bootRun`로 동작을 확인합니다.

## 채워야 할 파일

문제 순서에 맞춰 아래 파일을 `src/main/java/com/example/board/` 안에 만듭니다.

- `Post.java`.
- `PostRepository.java`.
- `PostService.java`.
- `PostController.java`.
- `PostCreateRequest.java`.
- `GlobalExceptionHandler.java`.

`src/main/resources/application.yml`도 함께 작성합니다.

문제는 [`../problems.md`](../problems.md), 정답 예시는 [`../answers.md`](../answers.md)를 참고하세요.

## 빌드 결과 검증

```bash
cd board-api
./gradlew bootRun

# 다른 터미널에서
curl http://localhost:8080/api/posts
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"첫 글","content":"내용"}'
```

H2 콘솔에서 `SELECT * FROM POST;` 결과를 직접 확인하세요.
