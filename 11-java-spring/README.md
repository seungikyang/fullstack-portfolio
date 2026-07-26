# 11단계 Java와 Spring Boot

[HTML 목차](../index.html) · 학습 흐름. [문제 풀기](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 목표

Java + Spring을 요구하는 SI/SW 공고가 많습니다. 4단계 Express 게시판 API를 Spring Boot로 다시 작성하면서, 같은 REST API가 두 스택에서 어떻게 표현되는지 비교합니다.

Spring 전문가가 되는 것이 목표가 아닙니다. "신입으로서 Spring Boot 프로젝트를 클론해 빌드하고, Controller와 Service의 역할을 설명할 수 있다"는 수준이 목표입니다.

## 실행 방법

### 사전 준비

- **JDK 21** 설치.
  - macOS. `brew install openjdk@21` 후 PATH 등록 안내를 따릅니다.
  - Windows. https://adoptium.net 에서 Temurin 21 installer로 설치.
  - Linux. `sudo apt install openjdk-21-jdk` 또는 SDKMAN(`sdk install java 21-tem`).
- **Maven** 또는 **Gradle**. Spring Initializr가 만든 프로젝트에 wrapper가 포함되므로 별도 설치 없이 `./mvnw` 또는 `./gradlew`로 실행할 수 있습니다.

### 설치 확인 (반드시 먼저)

```bash
java -version
# 출력 예시. openjdk 21.0.x 또는 더 높은 버전이 나와야 합니다.

./gradlew --version
# starter/board-api/를 만든 뒤 그 안에서 실행하세요.
# 출력 예시. Gradle 8.x, JVM 21.
```

JDK 21이 아니라 17이나 8이 잡히면 PATH나 `JAVA_HOME`을 확인하세요. 버전이 안 맞으면 Spring Boot 3.3+ 빌드가 실패합니다.

### 새 프로젝트 만들기

1. https://start.spring.io 접속.
2. 다음으로 설정.
   - Project. Gradle - Groovy.
   - Language. Java.
   - Spring Boot. 3.3 이상.
   - Dependencies. Spring Web, Spring Data JPA, H2 Database, Lombok, Validation.
   - Group/Artifact는 자유.
3. Generate 버튼으로 zip을 받아 `starter/board-api` 폴더로 풉니다.
4. `starter/`의 가이드 파일과 비교하며 빈칸을 채웁니다.

저장소에는 완성된 `starter/board-api`가 포함되어 있지 않습니다. 아래 실행·완료 문장은 사용자가 직접 프로젝트를 만든 뒤에만 해당합니다.

### 빌드와 실행

```bash
cd starter/board-api
./gradlew bootRun
```

브라우저에서 `http://localhost:8080/api/posts`를 열어 동작을 확인하세요.

### 동작 확인 체크리스트

성공한 빌드라면 다음이 모두 통과해야 합니다.

```bash
# 1) 헬스 확인
curl http://localhost:8080/api/posts
# 응답 예시. []

# 2) 생성
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"첫 글","content":"내용"}'
# 응답 예시. {"id":1,"title":"첫 글","content":"내용"}

# 3) 단건 조회
curl http://localhost:8080/api/posts/1
# 응답 예시. {"id":1,"title":"첫 글","content":"내용"}

# 4) 검증 실패 (400)
curl -i -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"","content":""}'
# HTTP/1.1 400 Bad Request 가 떨어져야 합니다.

# 5) 없는 id (404)
curl -i http://localhost:8080/api/posts/9999
# HTTP/1.1 404 Not Found 가 떨어져야 합니다.

# 6) H2 콘솔에서 DB 확인
# 브라우저로 http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:boarddb
# User: sa, Password: 빈칸
# 접속 후 SELECT * FROM POST; 실행해 1행이 보이면 성공.
```

위 6개와 아래 완료 기준을 직접 확인한 뒤에만 11단계 구현 경험으로 기록합니다.

## 완료 기준

- [ ] `starter/board-api/gradlew`와 직접 작성한 Spring 소스가 존재합니다.
- [ ] `./gradlew bootRun` 후 `GET`, `POST`, `PUT`, `DELETE /api/posts` 흐름을 직접 호출했습니다.
- [ ] Controller, Service, Repository 세 계층의 실제 코드 위치를 설명할 수 있습니다.
- [ ] H2 인메모리 DB에서 JPA로 저장한 게시글을 직접 조회했습니다.
- [ ] `@Valid` 요청의 400 응답과 없는 id의 404 응답을 확인했습니다.

완료로 표시하기 전 [학습 근거 4종](../student-checklist.md#단계마다-남길-4종-근거)에 Gradle·curl 명령, API·H2 관찰 결과, 해결한 오류, 직접 만든 클래스 위치를 기록합니다.

## 취업 연결

SI/SW 실무에서 Spring은 다음과 같이 쓰입니다.

- Java/Spring을 사용하는 공고에서 자주 요구되는 백엔드 스택입니다.
- 계층 분리(Controller / Service / Repository)와 의존성 주입은 Spring 면접에서 설명할 수 있어야 할 기본 개념입니다.
- JPA(Hibernate)와 MyBatis 두 ORM 진영을 모두 알아두면 좋지만, 신입은 JPA를 먼저 익히는 편이 학습 효율이 높습니다.

위 체크 항목과 실행 로그가 있을 때만 "Express 게시판 API를 Spring Boot로 다시 작성해 계층 분리와 JPA 영속성 흐름을 확인했다"고 설명합니다. 아직 `starter/board-api`가 없다면 Spring 구조를 학습 중이라고 구분합니다.

## 핵심 개념

- 어노테이션. `@SpringBootApplication`, `@RestController`, `@RequestMapping`, `@Service`, `@Repository`, `@Entity`, `@Autowired`.
- 의존성 주입(DI)과 IoC 컨테이너의 개념.
- Spring Data JPA. `JpaRepository`가 제공하는 메서드.
- Bean Validation. `@NotBlank`, `@Size`, `@Valid`.
- Lombok. `@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`.
- 글로벌 예외 처리. `@RestControllerAdvice`, `@ExceptionHandler`.

## Express와 Spring 같은 기능 비교

| 기능         | Express                      | Spring Boot                                |
| ------------ | ---------------------------- | ------------------------------------------ |
| 라우터       | `app.get('/posts', handler)` | `@GetMapping("/posts")`                    |
| 요청 body    | `req.body.title`             | `@RequestBody PostDto dto`                 |
| URL 파라미터 | `req.params.id`              | `@PathVariable Long id`                    |
| 상태 코드    | `res.status(201).json(...)`  | `ResponseEntity.status(201).body(...)`     |
| 미들웨어     | `app.use(fn)`                | `@Component`로 등록되는 Filter/Interceptor |
| DB 연결      | `mongoose.connect(...)`      | `application.yml`의 datasource 설정        |
| ORM          | Mongoose                     | Spring Data JPA / Hibernate                |

## 면접 연습

### `@Controller`와 `@RestController`의 차이를 설명해보세요.

`@Controller`는 주로 뷰 이름을 반환해 서버 사이드 렌더링 화면과 연결할 때 사용합니다. JSON을 반환하려면 메서드마다 `@ResponseBody`가 필요합니다. `@RestController`는 `@Controller`와 `@ResponseBody`를 합친 형태라 REST API에서 객체를 바로 JSON 응답으로 보낼 때 사용합니다.

### 의존성 주입은 무엇이고 왜 필요한가요?

의존성 주입은 객체가 필요한 의존 객체를 직접 생성하지 않고 외부, 보통 Spring 컨테이너에서 받아 사용하는 방식입니다. 이렇게 하면 구현체 교체, 테스트용 mock 주입, 계층 간 결합도 감소가 쉬워집니다. 예를 들어 Controller가 Service 구현체를 직접 만들지 않고 생성자로 주입받으면 테스트와 유지보수가 편해집니다.

### JpaRepository를 상속만 했는데 어떻게 메서드가 동작하나요?

Spring Data JPA가 애플리케이션 시작 시 Repository 인터페이스를 분석해 프록시 구현체를 자동으로 만들어 Bean으로 등록합니다. `save`, `findById`, `findAll`, `deleteById` 같은 기본 CRUD 메서드는 `JpaRepository`가 이미 정의하고 있습니다. 개발자는 인터페이스만 선언해도 Spring이 런타임에 실제 동작을 연결해줍니다.

### 트랜잭션을 Service에 거는 이유와 Repository에 거는 경우의 차이를 설명해보세요.

Service는 여러 Repository 호출과 비즈니스 규칙을 하나의 업무 단위로 묶는 계층입니다. 따라서 주문 생성, 재고 차감, 결제 기록 저장처럼 여러 DB 작업이 함께 성공해야 하는 경우 Service에 트랜잭션을 거는 것이 자연스럽습니다. Repository에만 걸면 개별 DB 작업 단위로는 안전하지만, 여러 작업 전체의 원자성을 보장하기 어렵습니다.

### N+1 문제가 무엇이고 왜 발생하나요?

N+1 문제는 목록 1번 조회 후 각 행의 연관 데이터를 가져오려고 추가 쿼리가 N번 더 발생하는 문제입니다. JPA의 지연 로딩 관계에서 연관 엔티티를 반복문 안에서 접근할 때 자주 생깁니다. 해결 방법으로는 fetch join, EntityGraph, DTO 조회, batch size 설정 등이 있습니다.

### JPA와 MyBatis 중 무엇을 선택하나요? 각각 어떤 상황에서 유리한가요?

JPA는 객체 중심으로 CRUD를 작성하고 엔티티 변경 감지, 연관관계 관리가 필요할 때 유리합니다. 반복적인 CRUD가 많고 도메인 모델을 유지하고 싶다면 JPA가 생산성이 좋습니다. MyBatis는 복잡한 SQL, 레거시 DB, 튜닝된 쿼리를 직접 제어해야 하는 SI 프로젝트에서 유리합니다.

## 학습 경로 안내

- 자바 문법이 처음이라면 점프 투 자바, 자바의 정석을 1주 정도 가볍게 훑은 뒤 이 단계를 시작하세요.
- Spring 자체를 깊이 파기보다는, "Express로 만든 게시판 = Spring으로 만든 게시판" 1:1 비교에 집중하세요.
- 자격증을 병행한다면 SQLD와 정보처리기사가 이 단계 학습과 가장 시너지가 큽니다.
