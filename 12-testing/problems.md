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

검증. 보고서가 생성되는지 확인하고 아래 4지선다 U01에서 해석 방법을 고르세요.

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS12-01. 테스트의 독립성을 확보하는 적절한 방법은?

테스트의 독립성을 확보하는 적절한 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 앞 테스트가 만든 전역 상태를 다음 테스트의 필수 조건으로 둔다.
2. 각 테스트의 데이터와 모킹 상태를 준비·정리하고 실행 순서에 의존하지 않게 한다.
3. 한 번 함께 통과하면 단독 실행 검증은 언제나 불필요하다.
4. 테스트 간 DB 데이터를 무조건 공유하면 격리가 보장된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

순서가 바뀌거나 단독으로 실행해도 같은 조건에서 같은 결과가 나와야 합니다. 공유 자원과 모킹 상태의 초기화도 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W434)

### PS12-02. 모킹과 실제 호출의 경계를 명확히 설명한 것은?

모킹과 실제 호출의 경계를 명확히 설명한 것은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. DB를 모킹했어도 실제 DB 연결을 검증했다고 말한다.
2. HTTP 호출을 모킹하면 네트워크 환경도 항상 검증된다.
3. 대체한 의존성과 실제로 실행한 경로를 구분하고 테스트가 검증하지 않은 통합도 밝힌다.
4. 모킹이 있으면 assertion 없이 모든 경로가 정확하다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

모킹은 일부 의존성을 대체합니다. 대체한 구현과 실제 실행한 구현을 구별해야 테스트 결과가 보장하는 범위를 정확히 설명할 수 있습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W435)

### PS12-03. 무엇을 검증하는지 드러내는 테스트 이름은?

무엇을 검증하는지 드러내는 테스트 이름은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. test 1
2. 아무튼 성공
3. 모든 코드가 완벽하다.
4. 빈 제목으로 게시글 생성을 요청하면 400을 반환한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

입력 조건·대상 동작·기대 결과를 이름에 담으면 실패 원인을 좁히기 쉽습니다. 실제 assertion도 이름의 기대와 일치해야 합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W436)

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

커버리지 판단 문제 · [웹에서 채점하기](../quiz/index.html?bank=written&category=testing)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### U01. 커버리지 보고서 읽기

커버리지 보고서 읽기 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 실행되지 않은 줄·분기와 요구 시나리오를 대조해 의미 있는 검증을 보강한다.
2. 보고서 파일이 생기면 모든 테스트가 정확한 것이다.
3. 커버리지 수치만 높으면 단언은 없어도 된다.
4. 보고서가 있으면 모든 외부 연동 검증을 생략한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

실행 범위와 테스트의 정확성은 다릅니다. 경계 입력·오류 경로·단언을 함께 확인합니다.

</details>
<!-- written-choice:end -->
