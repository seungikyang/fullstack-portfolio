# 11단계 Java와 Spring Boot

## 목표

한국 SI/SW 실무의 절대 다수가 Java + Spring 기반입니다. 4단계 Express 게시판 API를 Spring Boot로 다시 작성하면서, 같은 REST API가 두 스택에서 어떻게 표현되는지 비교합니다.

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

위 6개가 모두 통과하면 11단계 학습 목표가 달성된 것입니다.

## 완료 기준

- `GET /api/posts`, `POST /api/posts`, `PUT /api/posts/{id}`, `DELETE /api/posts/{id}` 가 모두 동작합니다.
- Controller, Service, Repository 세 계층으로 코드를 분리했습니다.
- H2 인메모리 DB에 JPA로 게시글이 저장됐다 조회됩니다.
- `@Valid`로 요청 body 검증을 한 번 이상 적용했습니다.

## 취업 연결

SI/SW 실무에서 Spring은 다음과 같이 쓰입니다.

- 대형 SI 프로젝트의 백엔드 사실상 표준.
- 계층 분리(Controller / Service / Repository)와 의존성 주입이 면접 단골.
- JPA(Hibernate)와 MyBatis 두 ORM 진영을 모두 알아두면 좋지만, 신입은 JPA를 먼저 익히는 편이 학습 효율이 높습니다.

이 단계가 끝나면 "Express로 만든 게시판 API와 동일한 기능을 Spring Boot로 다시 작성하며 Controller/Service/Repository 계층 분리와 JPA 영속성 흐름을 익혔다"고 설명할 수 있어야 합니다.

## 핵심 개념

- 어노테이션. `@SpringBootApplication`, `@RestController`, `@RequestMapping`, `@Service`, `@Repository`, `@Entity`, `@Autowired`.
- 의존성 주입(DI)과 IoC 컨테이너의 개념.
- Spring Data JPA. `JpaRepository`가 제공하는 메서드.
- Bean Validation. `@NotBlank`, `@Size`, `@Valid`.
- Lombok. `@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`.
- 글로벌 예외 처리. `@RestControllerAdvice`, `@ExceptionHandler`.

## Express와 Spring 같은 기능 비교

| 기능 | Express | Spring Boot |
| --- | --- | --- |
| 라우터 | `app.get('/posts', handler)` | `@GetMapping("/posts")` |
| 요청 body | `req.body.title` | `@RequestBody PostDto dto` |
| URL 파라미터 | `req.params.id` | `@PathVariable Long id` |
| 상태 코드 | `res.status(201).json(...)` | `ResponseEntity.status(201).body(...)` |
| 미들웨어 | `app.use(fn)` | `@Component`로 등록되는 Filter/Interceptor |
| DB 연결 | `mongoose.connect(...)` | `application.yml`의 datasource 설정 |
| ORM | Mongoose | Spring Data JPA / Hibernate |

## 면접 연습

- `@Controller`와 `@RestController`의 차이를 설명해보세요.
- 의존성 주입은 무엇이고 왜 필요한가요?
- JpaRepository를 상속만 했는데 어떻게 메서드가 동작하나요?
- 트랜잭션을 Service에 거는 이유와 Repository에 거는 경우의 차이를 설명해보세요.
- N+1 문제가 무엇이고 왜 발생하나요?
- JPA와 MyBatis 중 무엇을 선택하나요? 각각 어떤 상황에서 유리한가요?

## 학습 경로 안내

- 자바 문법이 처음이라면 점프 투 자바, 자바의 정석을 1주 정도 가볍게 훑은 뒤 이 단계를 시작하세요.
- Spring 자체를 깊이 파기보다는, "Express로 만든 게시판 = Spring으로 만든 게시판" 1:1 비교에 집중하세요.
- 자격증을 병행한다면 SQLD와 정보처리기사가 이 단계 학습과 가장 시너지가 큽니다.
