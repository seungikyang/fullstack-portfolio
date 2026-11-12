# 11단계 Spring Boot 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 프로젝트 바로 시작하기

이 단계는 완성된 starter 코드를 제공하지 않는 프로젝트 생성형 문제입니다. 먼저 안내에 따라 Spring Initializr 프로젝트를 만든 뒤 아래에 적힌 Java 파일을 직접 작성하세요.

- [Spring 프로젝트 생성·파일 배치 안내](./starter/README.md)

`starter/board-api/src/main/java/com/example/board/` 안에서 빈칸을 채웁니다. 막히면 먼저 `hints.md`의 1~3단계를 순서대로 보고, 마지막에만 `answers.md`와 비교하세요.

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

아래 4지선다 J01~J02에서 라우팅·요청 body·저장 방식의 차이를 고르세요. 4단계는 메모리 저장이고 Mongoose는 5단계에 사용됩니다.

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS11-01. ./gradlew bootRun으로 Spring 앱 실행을 확인하는 적절한 방법은?

./gradlew bootRun으로 Spring 앱 실행을 확인하는 적절한 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. Gradle 파일이 존재하면 서버 시작도 완료했다고 적는다.
2. 컴파일 에러가 있어도 브라우저 즐겨찾기가 있으면 정상 실행이다.
3. 프로젝트에서 명령을 실행해 시작 로그와 실제 HTTP 응답을 확인한다.
4. JAR 이름을 바꾸기만 하면 HTTP 검증이 끝난다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

프로세스 시작과 HTTP 응답을 실제로 확인합니다. 오류가 있다면 실패한 실행 단계와 원인 로그부터 읽습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W431)

### PS11-02. Spring 게시판의 GET·POST·PUT·DELETE 동작을 확인할 근거는?

Spring 게시판의 GET·POST·PUT·DELETE 동작을 확인할 근거는? — 알맞은 설명 또는 답변 방식을 고르세요.

1. Controller 파일이 있으면 모든 메서드가 구현 요구와 일치한다.
2. GET 하나의 성공이 생성·수정·삭제 성공을 모두 증명한다.
3. 모든 응답을 메서드와 관계없이 무조건 200으로 기대한다.
4. 실제 요청의 상태·본문을 비교하고 생성·수정·삭제 뒤 조회로 데이터 변화를 확인한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

메서드별 요청과 기대 결과를 확인합니다. 생성의 201·삭제의 204 등 이 실습의 계약과 오류 응답도 코드 및 실제 요청으로 대조합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W432)

### PS11-03. H2 콘솔에서 앱의 저장 결과를 확인하는 올바른 방법은?

H2 콘솔에서 앱의 저장 결과를 확인하는 올바른 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 앱과 같은 JDBC URL의 DB에 접속해 API로 생성한 행의 ID와 값을 조회한다.
2. 서로 다른 DB 이름에 접속해 빈 테이블이면 저장 성공이라고 결론낸다.
3. 메모리 H2는 앱 종료 뒤에도 어떤 설정에서나 데이터가 영구 유지된다.
4. 콘솔 페이지가 열리면 INSERT 결과도 확인한 것이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

같은 DB를 조회해야 앱의 저장 결과를 확인할 수 있습니다. 이 실습의 jdbc:h2:mem 설정은 앱 종료 후 영속 저장을 주장할 근거가 아닙니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W433)

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

Express·Spring 비교 문제 · [웹에서 채점하기](../quiz/index.html?bank=written&category=spring)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### J01. 라우팅과 요청 body 비교

라우팅과 요청 body 비교 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 둘 다 브라우저 CSS로만 라우팅한다.
2. Express는 라우트·파싱 미들웨어, Spring은 매핑 어노테이션·RequestBody 등으로 요청을 처리한다.
3. Express에서 JSON body는 어떤 설정에서도 자동으로 생긴다.
4. RequestBody는 DB 스키마를 삭제하는 명령이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

프레임워크마다 설정과 입력 경계가 다릅니다. 파싱과 검증·오류 응답을 구분합니다.

</details>

### J02. 4·5·11단계 데이터 저장 비교

4·5·11단계 데이터 저장 비교 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 4단계 Express 게시판이 이미 Mongoose를 사용한다.
2. 모든 단계가 동일한 Oracle 스키마를 사용한다.
3. 4단계는 메모리 배열, 5단계는 Mongoose·MongoDB, 11단계 예제는 JPA·H2를 비교한다.
4. JPA는 어떤 설정에서도 데이터베이스가 필요 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

비교할 실제 단계와 파일을 명시합니다. 프레임워크 이름만으로 저장 방식을 단정하지 않습니다.

</details>
<!-- written-choice:end -->
