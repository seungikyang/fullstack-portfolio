# 12단계 테스트 정답 예시

## 1번 정답 예시

```ts
// starter/js/src/calculator.ts
export function add(a: number, b: number): number { return a + b; }
export function subtract(a: number, b: number): number { return a - b; }
export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('cannot divide by zero');
  return a / b;
}

// starter/js/src/calculator.test.ts
import { describe, expect, test } from 'vitest';
import { add, subtract, divide } from './calculator';

describe('calculator', () => {
  test('add는 두 수의 합을 반환한다', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('subtract는 두 수의 차이를 반환한다', () => {
    expect(subtract(5, 2)).toBe(3);
  });

  test('add는 음수를 처리한다', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  test('divide는 부동소수점을 처리한다', () => {
    expect(divide(1, 3)).toBeCloseTo(0.333, 3);
  });

  test('divide는 0으로 나눌 때 예외를 던진다', () => {
    expect(() => divide(1, 0)).toThrow('cannot divide by zero');
  });
});
```

설명. 부동소수점은 `toBe` 대신 `toBeCloseTo`를 씁니다. 예외 검증은 함수를 콜백으로 감싸 `toThrow`로 검사합니다.

## 2번 정답 예시

```ts
// starter/js/src/app.test.ts
import { describe, expect, test, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

describe('Posts API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  test('GET /posts는 빈 배열을 반환한다', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /posts는 게시글을 생성한다', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 't', content: 'c' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 't', content: 'c' });
  });

  test('POST /posts는 body가 부족하면 400을 반환한다', async () => {
    const res = await request(app).post('/posts').send({ title: 't' });
    expect(res.status).toBe(400);
  });

  test('GET /posts/:id는 없는 id에 404를 반환한다', async () => {
    const res = await request(app).get('/posts/9999');
    expect(res.status).toBe(404);
  });
});
```

설명. `beforeEach`에서 새 app을 만들어 테스트 간 상태가 누설되지 않게 합니다. supertest는 서버를 실제로 띄우지 않고 메모리 안에서 라우터를 호출합니다.

## 3번 정답 예시

```ts
// starter/js/src/notification.test.ts
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { notifyUser } from './notification';
import * as mailer from './mailer';

describe('notifyUser', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('mailer를 올바른 인자로 호출한다', async () => {
    const spy = vi.spyOn(mailer, 'sendMail').mockResolvedValue(undefined);
    await notifyUser({ email: 'a@b.c', name: '홍길동' });
    expect(spy).toHaveBeenCalledWith(
      'a@b.c',
      expect.stringContaining('홍길동'),
      expect.any(String),
    );
  });
});
```

## 4번 정답 예시

```java
// board-api/src/test/java/com/example/board/PostServiceTest.java
package com.example.board;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    PostRepository repository;

    @InjectMocks
    PostService service;

    @Test
    void findById_없는_id_예외() {
        given(repository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not found");
    }

    @Test
    void create_저장된_엔티티_반환() {
        Post incoming = new Post();
        incoming.setTitle("t");
        incoming.setContent("c");
        given(repository.save(incoming)).willReturn(incoming);

        Post result = service.create(incoming);

        assertThat(result.getTitle()).isEqualTo("t");
    }
}
```

설명. `@Mock`은 의존성을, `@InjectMocks`는 그 의존성을 주입받는 대상을 만듭니다. AssertJ의 `assertThatThrownBy`가 가독성이 좋습니다.

## 5번 정답 예시

```java
// board-api/src/test/java/com/example/board/PostControllerTest.java
package com.example.board;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
class PostControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean PostService service;
    @Autowired ObjectMapper objectMapper;

    @Test
    void list_빈_배열() throws Exception {
        given(service.findAll()).willReturn(List.of());

        mockMvc.perform(get("/api/posts"))
            .andExpect(status().isOk())
            .andExpect(content().json("[]"));
    }

    @Test
    void create_body_누락_400() throws Exception {
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }
}
```

설명. `@WebMvcTest`는 Controller 계층만 띄워 가볍게 테스트합니다. Service는 `@MockBean`으로 대체합니다.

## 6번 커버리지 결과 예시

```bash
# JS
npx vitest run --coverage
# 출력 예시: coverage/index.html

# Java
./gradlew test jacocoTestReport
# 출력 예시: build/reports/jacoco/test/html/index.html
```

메모 예시. "Controller의 PUT 분기가 빨간색으로 남았다. 수정 API에 대한 테스트를 추가해야 한다."

## 자주 막히는 부분

- `vi.mock`이 끌어올림(hoisting)되어 import 전에 실행되는 점을 잊고 변수 캡처 오류를 만남.
- supertest 테스트에서 `done` 콜백을 빠뜨려 비동기 종료를 못 함. async/await로 통일하세요.
- JUnit에서 `@InjectMocks` 대상에 `@Service` 어노테이션을 그대로 둬도 무관하지만, 의존성 누락 시 NPE가 납니다. `@Mock` 누락을 의심하세요.
- `@WebMvcTest`는 JPA 빈을 띄우지 않으므로 `@Repository` 의존성이 필요한 테스트에는 `@SpringBootTest`를 쓰세요.

## 테스트 작성 원칙

- 테스트 이름은 "주어_조건_결과" 형태로 작성하면 실패 시 원인 추적이 쉽습니다.
- 테스트가 외부 시스템(실제 DB, 실제 메일 서버)에 의존하면 느리고 깨지기 쉽습니다.
- 한 테스트에서 단언(assert)은 가능한 한 적게. 한 테스트에서 너무 많은 것을 검증하면 실패 원인이 모호해집니다.
