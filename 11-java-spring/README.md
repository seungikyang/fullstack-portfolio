# 11단계 Java와 Spring Boot

[HTML 목차](../index.html) · 학습 흐름. [문제 풀기](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 목표

Java + Spring을 요구하는 SI/SW 공고가 많습니다. 4단계 Express 게시판 API를 Spring Boot로 다시 작성하면서, 같은 REST API가 두 스택에서 어떻게 표현되는지 비교합니다.

Spring 전문가가 되는 것이 목표가 아닙니다. "신입으로서 Spring Boot 프로젝트를 클론해 빌드하고, Controller와 Service의 역할을 설명할 수 있다"는 수준이 목표입니다.

## 기술을 쓰는 이유와 동작 흐름

처음 보는 용어는 [전체 기술 안내서](../technology-guide.md)와 함께 읽으세요. 아래 흐름은 실습을 이해하기 위한 안내이며, 빈칸과 완료 체크는 직접 진행합니다.

이 단계의 `starter`에는 생성 안내만 있습니다. 아래 내용은 [프로젝트 생성 안내](./starter/README.md)와 [문제](./problems.md)를 따라 직접 만들 구조를 설명하며, 이미 완성된 서버의 실행 결과는 아닙니다.

| 기술 | 무엇이고, 왜 필요한가요? | 이 실습에서는 어떻게 쓰나요? |
| --- | --- | --- |
| Java·JDK·Gradle | Java는 서버 코드를 작성하는 언어, JDK는 컴파일·실행 도구, Gradle은 의존성 설치와 빌드 작업을 묶는 도구입니다. 같은 절차로 앱을 만들고 실행하게 합니다. | 생성한 프로젝트의 Gradle wrapper(지정한 Gradle 버전을 실행하는 스크립트)로 빌드·실행합니다. |
| Spring Boot·Spring Web | Spring Boot는 서버 설정과 시작을 돕고, Spring Web은 HTTP 요청 처리를 연결합니다. Controller(요청 접점)와 Service(업무 처리)의 역할을 분리하도록 사용합니다. | 문제에서 게시글 Controller와 Service를 직접 만들도록 안내합니다. |
| Spring Data JPA·H2 | JPA는 Java 객체와 관계형 DB 저장을 연결하는 표준이고, Spring Data JPA는 반복적인 저장 코드를 줄입니다. H2는 실습에 사용할 DB입니다. | Repository(저장·조회 접점)와 게시글 객체를 만들고, 이 실습의 H2 메모리 DB에 연결합니다. |
| Validation·의존성 주입 | Validation은 입력 규칙 검사 도구이고, 의존성 주입은 필요한 객체를 외부에서 받아 쓰는 방식입니다. 잘못된 입력과 객체 연결 책임을 정리합니다. | 요청 객체를 검사하고 Spring이 Controller·Service·Repository 사이의 객체를 연결하게 합니다. |

**게시글 생성의 목표 흐름:** HTTP 요청 → 요청 데이터 변환·검증 → Controller → Service → Repository → DB 저장 → 응답 반환. 각 계층은 파일 수를 늘리기 위한 것이 아니라 요청 처리·업무 규칙·저장 책임을 나누기 위한 구분입니다.

**직접 관찰하기:** 구현 후 API 응답과 H2 조회 결과를 함께 보고 저장을 담당한 코드 위치를 찾으세요. 메모리 H2는 앱 종료 시 데이터가 사라질 수 있습니다. 4단계 Express와 같은 기능이 어디에 대응하는지 비교하고, 12단계에서는 각 역할을 테스트로 확인합니다.

## 실행 방법

### 사전 준비

- **JDK 25 LTS** 설치.
  - macOS. `brew install openjdk@25` 후 PATH 등록 안내를 따릅니다.
  - Windows. https://adoptium.net 에서 Temurin 25 installer로 설치.
  - Linux. 배포판 패키지 관리자 또는 SDKMAN(`sdk install java 25-tem`)으로 설치합니다.
- **Maven** 또는 **Gradle**. Spring Initializr가 만든 프로젝트에 wrapper가 포함되므로 별도 설치 없이 `./mvnw` 또는 `./gradlew`로 실행할 수 있습니다.

### 설치 확인 (반드시 먼저)

```bash
java -version
# 출력 예시. openjdk 25.0.x가 나와야 합니다.

./gradlew --version
# starter/board-api/를 만든 뒤 그 안에서 실행하세요.
# 출력 예시. Gradle 9.x, JVM 25.
```

JDK 25가 아니라 21이나 17이 잡히면 PATH나 `JAVA_HOME`을 확인하세요. 이 저장소는 Spring Boot 4.1+와 JDK 25 LTS 조합을 기준으로 합니다.

### 새 프로젝트 만들기

1. https://start.spring.io 접속.
2. 다음으로 설정.
   - Project. Gradle - Groovy.
   - Language. Java.
   - Spring Boot. 4.1 이상.
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
- JPA/Hibernate는 객체와 테이블의 연결을, MyBatis는 직접 작성한 SQL과 객체의 연결을 돕습니다. 이 단계는 JPA로 반복적인 저장·조회 흐름을 먼저 익힙니다.

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

<!-- written-choice:start -->
4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### R11-01. `@Controller`와 `@RestController`의 차이를 설명해보세요.

`@Controller`와 `@RestController`의 차이를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. RestController는 DB 테이블 생성만 담당한다.
2. RestController는 Controller와 ResponseBody의 역할을 결합해 응답 본문을 반환하게 한다.
3. Controller에서는 ResponseBody를 사용할 수 없다.
4. RestController는 무조건 HTML 템플릿 이름만 반환한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

MVC의 뷰 반환과 메시지 변환을 통한 본문 반환을 구분합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W214)

### R11-02. 의존성 주입은 무엇이고 왜 필요한가요?

의존성 주입은 무엇이고 왜 필요한가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 의존성 주입은 모든 객체를 전역 변수로만 만든다.
2. 주입하면 모든 메서드가 자동으로 비동기가 된다.
3. 객체의 의존성을 외부에서 전달해 결합을 줄이고 교체·테스트를 돕는다.
4. 주입은 테스트 대역을 사용할 수 없게 한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

생성자 주입은 의존 관계를 명확하게 보여줍니다. 객체 생성과 사용 책임을 분리합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W215)

### R11-03. JpaRepository를 상속만 했는데 어떻게 메서드가 동작하나요?

JpaRepository를 상속만 했는데 어떻게 메서드가 동작하나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. Java 컴파일러가 인터페이스의 모든 DB 쿼리를 임의로 발명한다.
2. 브라우저가 Repository 메서드를 직접 구현한다.
3. 메서드 이름이 없어도 모든 업무 규칙과 권한 검사가 자동 생성된다.
4. Spring Data가 Repository 구현을 구성해 기본 CRUD 기능을 제공한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

제공되는 CRUD와 사용자 업무 규칙을 구분합니다. 데이터 접근 구현은 프레임워크가 구성합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W216)

### R11-04. 트랜잭션을 Service에 거는 이유와 Repository에 거는 경우의 차이를 설명해보세요.

트랜잭션을 Service에 거는 이유와 Repository에 거는 경우의 차이를 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 업무 단위의 여러 데이터 작업에 트랜잭션 경계를 설정한다.
2. 어노테이션만 있으면 내부 호출을 포함해 모든 실행 경로가 무조건 새 트랜잭션이다.
3. Transactional은 요청 body를 암호화하는 도구이다.
4. Service에 사용하면 DB 없이 데이터가 영구 저장된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

프록시 적용 경로와 전파·롤백 규칙을 확인해야 합니다. 업무 단위가 경계 선택의 기준입니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W217)

### R11-05. N+1 문제가 무엇이고 왜 발생하나요?

N+1 문제가 무엇이고 왜 발생하나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 항상 한 쿼리로 모든 데이터를 읽는 현상이다.
2. 목록 한 번 조회 후 연관 데이터를 항목별로 추가 조회하여 쿼리가 늘어나는 현상이다.
3. HTTP 응답 코드가 1씩 증가하는 현상이다.
4. DB 컬럼이 한 개 부족한 문법 오류이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

필요한 조회에 맞춰 fetch join, entity graph, batch fetch 등을 검토하고 SQL 수를 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W218)

### R11-06. JPA와 MyBatis 중 무엇을 선택하나요? 각각 어떤 상황에서 유리한가요?

JPA와 MyBatis 중 무엇을 선택하나요? 각각 어떤 상황에서 유리한가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. JPA는 JavaScript 브라우저 표준이다.
2. MyBatis는 어떤 SQL도 작성할 수 없다.
3. JPA는 ORM 명세이고 MyBatis는 SQL과 결과 매핑을 직접 제어하는 방식이다.
4. 둘은 데이터베이스 연결 없이만 실행된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

객체 영속 관리와 SQL 중심 매핑의 차이를 요구 사항에 맞춰 비교합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W219)

<!-- written-choice:end -->

## 학습 경로 안내

- 자바 문법이 처음이라면 점프 투 자바, 자바의 정석을 1주 정도 가볍게 훑은 뒤 이 단계를 시작하세요.
- Spring 자체를 깊이 파기보다는, "Express로 만든 게시판 = Spring으로 만든 게시판" 1:1 비교에 집중하세요.
- 자격증을 병행한다면 SQLD와 정보처리기사가 이 단계 학습과 가장 시너지가 큽니다.
