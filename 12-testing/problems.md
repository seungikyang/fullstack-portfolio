# 12단계 테스트 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

JS 테스트 파일과 테스트 대상 코드를 함께 열어 실패 테스트부터 작성하세요. Java 실습은 11단계 Spring 프로젝트를 만든 경우에만 진행합니다.

- [계산기 코드 보기](./starter/js/src/calculator.ts?view=source)
- [계산기 테스트 코드 보기](./starter/js/src/calculator.test.ts?view=source)
- [Express 앱 코드 보기](./starter/js/src/app.ts?view=source)
- [Express 통합 테스트 코드 보기](./starter/js/src/app.test.ts?view=source)
- [알림 코드 보기](./starter/js/src/notification.ts?view=source)
- [메일러 코드 보기](./starter/js/src/mailer.ts?view=source)
- [알림 테스트 코드 보기](./starter/js/src/notification.test.ts?view=source)
- [11단계 Spring 프로젝트 생성 안내](../11-java-spring/starter/README.md)

`starter/` 폴더의 빈칸을 채워가며 진행합니다. JS와 Java 양쪽을 모두 다룹니다.

## 1번. 순수 함수 단위 테스트 (Vitest)

`starter/js/src/calculator.ts`의 함수에 단위 테스트를 작성하세요.

- `add`, `subtract`, `divide` 함수가 있습니다.
- `divide`는 0으로 나누면 `Error('cannot divide by zero')`를 던지도록 구현됐습니다.
- `starter/js/src/calculator.test.ts`에서 5개 이상의 케이스를 작성하세요.
  - 정상 케이스 2개.
  - 음수 케이스 1개.
  - 부동소수점 케이스 1개.
  - 0으로 나누기 예외 케이스 1개.

검증. `npm test`가 모두 통과.

## 2번. Express 라우터 통합 테스트 (supertest)

`starter/js/src/app.ts`의 게시판 API에 통합 테스트를 작성하세요.

- `starter/js/src/app.test.ts`에 다음 케이스를 작성.
  - `GET /posts` → 200, 빈 배열.
  - `POST /posts` → 201, 생성된 게시글 반환.
  - `POST /posts` body 누락 → 400.
  - `GET /posts/:id` 존재하지 않는 id → 404.

`supertest`를 써서 실제 HTTP 호출 없이 라우터를 테스트하세요.

## 3번. 모킹 (Vitest)

`starter/js/src/notification.ts`는 이메일 전송 함수에 의존합니다.

- `vi.spyOn(mailer, "sendMail")`로 이메일 함수를 감시하고 가짜 반환값을 설정.
- `notifyUser` 호출 시 이메일 함수가 인자 `(to, subject, body)`로 호출되는지 검증.

## 4번. JUnit 5 단위 테스트

11단계의 `PostService`에 단위 테스트를 작성합니다.

`board-api/src/test/java/com/example/board/PostServiceTest.java`에 다음을 작성하세요.

- `@ExtendWith(MockitoExtension.class)`.
- `@Mock PostRepository`, `@InjectMocks PostService`.
- 다음 테스트.
  - `findById_없는_id_예외`. `repository.findById`가 `Optional.empty()`를 반환할 때 `IllegalArgumentException`이 던져지는지.
  - `create_저장된_엔티티_반환`. `repository.save`를 모킹하고 반환값이 전달되는지.

## 5번. MockMvc Controller 통합 테스트

`board-api/src/test/java/com/example/board/PostControllerTest.java`에 다음을 작성하세요.

- `@WebMvcTest(PostController.class)`.
- `MockMvc`를 `@Autowired`로 주입.
- `PostService`를 `@MockBean`으로 대체.
- 다음 테스트.
  - `GET /api/posts` → 200, JSON 배열.
  - `POST /api/posts` body 누락 → 400.

## 6번. 커버리지 보고서

JS와 Java 양쪽에서 커버리지를 한 번씩 출력하세요.

```bash
# JS
npx vitest run --coverage

# Java (build.gradle에 jacoco 플러그인 추가 후)
./gradlew test jacocoTestReport
```

검증. 보고서가 생성되는지 확인하고, "어떤 줄이 테스트되지 않았는가"를 한 줄 메모하세요.

## 자가 점검

- 각 테스트가 다른 테스트와 독립적으로 실행되나요?
- 모킹한 부분과 실제로 호출한 부분의 경계가 명확한가요?
- 테스트 이름만 봐도 "무엇을 검증하는지" 알 수 있나요?
