# 11단계 Spring Boot 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

`starter/board-api/src/main/java/com/example/board/` 안에서 빈칸을 채웁니다. 막히면 `answers.md`와 비교하세요.

Spring Initializr로 받은 프로젝트 위에서 진행한다는 전제로 문제를 구성했습니다. 패키지 이름은 자유롭게 바꿔도 됩니다.

## 1번. 엔티티 만들기

`Post.java`를 작성하세요.

- `@Entity`로 표시.
- 필드. `id`(Long, PK, IDENTITY 자동 증가), `title`(String, NOT NULL), `content`(String).
- Lombok의 `@Getter`, `@Setter`, `@NoArgsConstructor`를 사용.

## 2번. Repository 만들기

`PostRepository.java`를 작성하세요.

- `JpaRepository<Post, Long>`을 상속.
- 별도 메서드를 정의하지 않아도 `findAll`, `findById`, `save`, `deleteById`가 자동 제공됩니다.

## 3번. Service 만들기

`PostService.java`를 작성하세요.

- `@Service` 어노테이션.
- 생성자 주입으로 `PostRepository`를 받습니다 (`@RequiredArgsConstructor`).
- 다음 메서드를 정의.
  - `List<Post> findAll()`.
  - `Post findById(Long id)`. 없으면 `IllegalArgumentException` 또는 커스텀 예외.
  - `Post create(Post post)`.
  - `Post update(Long id, Post post)`.
  - `void delete(Long id)`.

## 4번. Controller 만들기

`PostController.java`를 작성하세요.

- `@RestController`, `@RequestMapping("/api/posts")`.
- 다음 엔드포인트를 정의.
  - `GET /api/posts` → `List<Post>`.
  - `GET /api/posts/{id}` → 단건 조회.
  - `POST /api/posts` → 생성. 201 반환.
  - `PUT /api/posts/{id}` → 수정.
  - `DELETE /api/posts/{id}` → 삭제. 204 반환.

## 5번. 요청 검증

`PostCreateRequest.java`를 작성하세요.

- `title`에 `@NotBlank`, `@Size(max = 100)`.
- `content`에 `@NotBlank`.
- Controller의 POST 메서드에 `@Valid` 적용.

검증. 빈 title로 POST 호출하면 400이 떨어지는지 확인하세요.

## 6번. 글로벌 예외 처리

`GlobalExceptionHandler.java`를 작성하세요.

- `@RestControllerAdvice`로 표시.
- `@ExceptionHandler(IllegalArgumentException.class)`로 잡아 404 반환.
- `@ExceptionHandler(MethodArgumentNotValidException.class)`로 잡아 400 반환.

## 7번. application.yml 설정

`src/main/resources/application.yml`에 다음을 작성하세요.

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:boarddb
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  h2:
    console:
      enabled: true
```

검증. `http://localhost:8080/h2-console`에 접속해 `JDBC URL`을 `jdbc:h2:mem:boarddb`로 입력하고 `POST` 테이블을 조회할 수 있어야 합니다.

## 8번. Express 게시판과 1:1 비교

같은 화면을 그리기 위해 4단계 Express 게시판과 다음을 비교해 메모하세요.

- 라우터 정의 방식.
- 요청 body 파싱 방식.
- 에러 응답 형태.
- DB 저장 방식. (Mongoose 모델 대 JPA 엔티티)

면접에서 "왜 SI 현장은 Spring을 더 많이 쓰는가"를 물으면 이 비교가 답이 됩니다.

## 자가 점검

- `./gradlew bootRun`이 오류 없이 실행됐나요?
- `requests.http` 또는 Postman으로 4개 메서드를 모두 호출했나요?
- H2 콘솔에서 INSERT 결과를 직접 확인했나요?
