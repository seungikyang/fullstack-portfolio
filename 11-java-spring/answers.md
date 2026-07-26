# 11단계 Spring Boot 정답 예시

[문제로 돌아가기](./problems.md) · [단계별 힌트로 돌아가기](./hints.md) · [완료 체크](../student-checklist.md) · [다음 단계](../12-testing/README.md)

정답을 먼저 보지 마세요. 직접 작성해보고 막혔을 때만 비교합니다.

## 1번 정답 예시

```java
// src/main/java/com/example/board/Post.java
package com.example.board;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;
}
```

설명. `@GeneratedValue(strategy = IDENTITY)`는 DB의 auto-increment에 위임합니다. H2/MySQL과 호환되고, Oracle은 시퀀스를 별도로 지정하는 편이 안전합니다.

## 2번 정답 예시

```java
// PostRepository.java
package com.example.board;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
```

설명. 인터페이스만 정의하면 Spring Data JPA가 런타임에 구현체를 만들어 줍니다. 신입 면접에서 자주 묻는 "어떻게 메서드 없이 동작하느냐"의 답은 "프록시 구현"입니다.

## 3번 정답 예시

```java
// PostService.java
package com.example.board;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {
    private final PostRepository repository;

    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Post findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("post not found: " + id));
    }

    public Post create(Post post) {
        return repository.save(post);
    }

    public Post update(Long id, Post incoming) {
        Post existing = findById(id);
        existing.setTitle(incoming.getTitle());
        existing.setContent(incoming.getContent());
        return existing;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
```

설명. `update` 메서드는 `save`를 명시적으로 호출하지 않습니다. JPA의 변경 감지(dirty checking)가 트랜잭션 커밋 시점에 UPDATE 쿼리를 자동 실행합니다.

## 4번 정답 예시

```java
// PostController.java
package com.example.board;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService service;

    @GetMapping
    public List<Post> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Post get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Post create(@Valid @RequestBody PostCreateRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        return service.create(post);
    }

    @PutMapping("/{id}")
    public Post update(@PathVariable Long id, @Valid @RequestBody PostCreateRequest request) {
        Post incoming = new Post();
        incoming.setTitle(request.getTitle());
        incoming.setContent(request.getContent());
        return service.update(id, incoming);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

## 5번 정답 예시

```java
// PostCreateRequest.java
package com.example.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRequest {
    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    private String content;
}
```

## 6번 정답 예시

```java
// GlobalExceptionHandler.java
package com.example.board;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", msg == null ? "validation failed" : msg));
    }
}
```

## 7번 정답 예시

```yaml
# src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:h2:mem:boarddb
    username: sa
    password:
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  h2:
    console:
      enabled: true
      path: /h2-console
```

설명. `ddl-auto: update`는 학습용으로 편하지만 운영에서는 절대 쓰지 않습니다. Flyway 같은 마이그레이션 도구를 별도로 씁니다.

## 8번 비교 예시

| 비교 항목   | Express                         | Spring                               |
| ----------- | ------------------------------- | ------------------------------------ |
| 라우터 정의 | `app.post('/posts', handler)`   | `@PostMapping("/posts")`             |
| 요청 body   | `req.body.title` (express.json) | `@RequestBody PostCreateRequest req` |
| 검증        | 직접 if 또는 zod/joi            | `@Valid` + Bean Validation           |
| 응답 상태   | `res.status(201).json(...)`     | `@ResponseStatus(CREATED)`           |
| DB 저장     | `Post.create(...)` (Mongoose)   | `repository.save(entity)` (JPA)      |

## 자주 막히는 부분

- `Whitelabel Error Page`. 패키지 구조가 잘못된 경우. 메인 애플리케이션 클래스가 다른 패키지의 상위에 있어야 컴포넌트 스캔이 동작합니다.
- `Field service in ... required a bean of type ... that could not be found`. `@Service`, `@Repository`, `@Component` 누락.
- 빌드 시 `cannot find symbol Getter`. Lombok이 IDE에 설치되지 않은 경우. IntelliJ에 Lombok 플러그인 설치 + `Enable annotation processing` 체크.
- `Failed to start bean 'documentationPluginsBootstrapper'`. Spring Boot 3에서 Swagger 옛 의존성 충돌. `springdoc-openapi-starter-webmvc-ui`를 쓰세요.

## H2 콘솔 확인 절차

1. `http://localhost:8080/h2-console` 접속.
2. JDBC URL을 `jdbc:h2:mem:boarddb`로 입력.
3. 사용자 `sa`, 비밀번호 빈칸.
4. Connect → `SELECT * FROM POST;` 실행.
