# 11단계 단계별 힌트

[단계 설명](./README.md) · [문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md)

한 번에 모두 읽지 말고, 막힌 문제의 1단계부터 차례로 확인하세요.

## 1번. 엔티티 만들기

### 1단계. 개념 환기

- JPA 엔티티는 DB 테이블과 매핑되는 Java 클래스입니다.
- 기본 키와 자동 증가 전략은 필드 위 어노테이션으로 지정합니다.
- JPA는 기본 생성자를 필요로 합니다.

### 2단계. 접근 방향

- 클래스 수준의 엔티티·Lombok 어노테이션을 먼저 배치하세요.
- id 필드에 기본 키와 생성 전략을 연결하세요.
- title의 null 허용 여부를 컬럼 설정에 반영하세요.

### 3단계. 어노테이션 수준

```java
@Entity
@Getter
@Setter
@NoArgsConstructor
class Post {
    @Id
    @GeneratedValue(strategy = /* 자동 증가 전략 */)
    private Long id;

    @Column(nullable = /* null 허용 여부 */)
    private String title;
}
```

## 2번. Repository 만들기

### 1단계. 개념 환기

- Spring Data JPA는 Repository 인터페이스 상속만으로 기본 CRUD 구현을 제공합니다.
- 제네릭 두 자리는 엔티티 타입과 기본 키 타입입니다.

### 2단계. 접근 방향

- 클래스가 아니라 인터페이스로 선언하세요.
- 1번에서 만든 엔티티와 id 필드 타입을 상속 제네릭에 연결하세요.
- 기본 CRUD만 필요하다면 메서드 본문을 추가하지 마세요.

### 3단계. 인터페이스 시그니처 수준

```java
public interface PostRepository
        extends JpaRepository</* 엔티티 */, /* 기본 키 타입 */> {
}
```

## 3번. Service 만들기

### 1단계. 개념 환기

- Service는 업무 흐름과 조회 실패 같은 규칙을 담당합니다.
- 생성자 주입은 필요한 의존성을 객체 생성 시점에 확정합니다.
- 수정은 기존 엔티티를 조회한 뒤 값 변경과 저장 순서로 진행합니다.

### 2단계. 접근 방향

- Repository를 final 필드로 두고 생성자 주입 어노테이션과 연결하세요.
- 각 메서드에서 어떤 Repository 기본 메서드를 호출할지 먼저 적으세요.
- 단건 조회의 Optional은 값이 없을 때 예외를 만들도록 처리하세요.

### 3단계. 메서드 시그니처 수준

```java
public List<Post> findAll();
public Post findById(Long id);
public Post create(Post post);
public Post update(Long id, Post post);
public void delete(Long id);
```

`findById`, `save`, `deleteById` 호출을 위 메서드에 배치하되 전체 구현은 직접 작성하세요.

## 4번. Controller 만들기

### 1단계. 개념 환기

- Controller는 HTTP 요청을 Java 메서드 호출로 연결합니다.
- 경로 변수는 `@PathVariable`, JSON body는 `@RequestBody`로 받습니다.
- 생성과 삭제는 기본 200과 다른 상태 코드를 사용합니다.

### 2단계. 접근 방향

- 클래스 공통 경로를 먼저 선언하고 메서드에는 나머지 경로만 두세요.
- 각 HTTP 메서드를 같은 의미의 Service 메서드와 연결하세요.
- 생성은 body와 상태를 함께 반환하고 삭제는 body 없는 응답을 만드세요.

### 3단계. Spring MVC 시그니처 수준

```java
@GetMapping("/{id}")
public Post findById(@PathVariable Long id);

@PostMapping
public ResponseEntity<Post> create(@RequestBody Post post);

@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id);
```

## 5번. 요청 검증

### 1단계. 개념 환기

- DTO는 외부 요청 형태를 엔티티와 분리합니다.
- Bean Validation 어노테이션은 필드 규칙을 선언하고 `@Valid`가 실제 검증을 시작합니다.

### 2단계. 접근 방향

- 요청 DTO의 제목과 본문에 서로 다른 제약을 배치하세요.
- Controller의 생성 메서드 body 매개변수에 검증 시작 어노테이션을 붙이세요.
- 빈 제목, 공백 제목, 너무 긴 제목을 나눠 확인하세요.

### 3단계. 검증 시그니처 수준

```java
public class PostCreateRequest {
    @NotBlank
    @Size(max = /* 최대 길이 */)
    private String title;

    @NotBlank
    private String content;
}

public ResponseEntity<Post> create(
        @Valid @RequestBody PostCreateRequest request);
```

## 6번. 글로벌 예외 처리

### 1단계. 개념 환기

- 전역 예외 처리기는 여러 Controller의 오류 응답 규칙을 한곳에 모읍니다.
- 예외 타입별 메서드를 나누면 상태 코드와 응답 body를 일관되게 만들 수 있습니다.

### 2단계. 접근 방향

- 클래스에 REST Controller용 advice 어노테이션을 붙이세요.
- 조회 실패 예외와 검증 실패 예외를 서로 다른 핸들러로 작성하세요.
- 각 메서드가 요구하는 HTTP 상태를 반환하게 하세요.

### 3단계. 예외 핸들러 시그니처 수준

```java
@ExceptionHandler(IllegalArgumentException.class)
public ResponseEntity<?> handleNotFound(IllegalArgumentException exception);

@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<?> handleValidation(
        MethodArgumentNotValidException exception);
```

## 7번. application.yml 설정

### 1단계. 개념 환기

- YAML은 들여쓰기로 설정 계층을 표현합니다.
- 메모리 H2 DB는 애플리케이션 종료 시 데이터가 사라집니다.
- JPA DDL 옵션은 엔티티와 테이블 구조의 동기화 방식을 정합니다.

### 2단계. 접근 방향

- datasource, JPA, H2 console의 세 설정 묶음을 `spring` 아래에 배치하세요.
- JDBC URL과 H2 콘솔 로그인 URL이 같은 DB 이름을 가리키는지 확인하세요.
- 비어 있는 비밀번호도 키 자체는 유지하세요.

### 3단계. 설정 키 수준

```yaml
spring:
  datasource:
    url: /* H2 메모리 JDBC URL */
    username: /* 사용자 */
    password:
  jpa:
    hibernate:
      ddl-auto: /* 학습용 갱신 전략 */
  h2:
    console:
      enabled: true
```

## 8번. Express 게시판과 1:1 비교

### 1단계. 개념 환기

- 두 스택은 같은 HTTP 요청을 처리하지만 책임을 나누는 방식과 DB 추상화가 다릅니다.
- 비교는 “어느 것이 더 좋다”보다 같은 책임이 어디에 위치하는지 찾는 작업입니다.

### 2단계. 접근 방향

- 라우팅, body 변환, 오류 처리, 저장소의 네 행으로 표를 만드세요.
- Express와 Spring에서 같은 GET·POST 요청이 시작되는 파일을 각각 찾으세요.
- 각 차이마다 자신의 4단계 코드와 11단계 코드 위치를 한 곳씩 적으세요.

### 3단계. 비교표 틀

```text
책임 | Express의 위치/API | Spring의 위치/어노테이션 | 관찰한 차이
라우팅 | ... | ... | ...
요청 body | ... | ... | ...
오류 응답 | ... | ... | ...
DB 저장 | ... | ... | ...
```

3단계까지 확인한 뒤에도 막히면 마지막으로 [정답 예시와 비교하세요](./answers.md).
