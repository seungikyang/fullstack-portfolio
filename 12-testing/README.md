# 12단계 자동화 테스트

## 목표

코드가 의도대로 동작하는지 수동 확인이 아닌 자동화 테스트로 검증하는 능력을 익힙니다. SI/SW 실무에서는 인수인계와 유지보수가 잦아 "테스트가 통과해야 PR을 머지한다"는 흐름이 점점 표준이 되고 있습니다.

JavaScript 진영은 Vitest 또는 Jest, Java/Spring 진영은 JUnit 5 + MockMvc를 다룹니다. 두 진영에서 같은 함수와 API에 테스트를 작성해 비교합니다.

## 실행 방법

### JavaScript (Vitest)

```bash
cd 12-testing/starter/js
npm install
npm test
```

### Java (JUnit 5)

Spring Boot 프로젝트(11단계 starter)에서 진행합니다.

```bash
cd 11-java-spring/starter/board-api
./gradlew test
```

## 완료 기준

- Vitest로 순수 함수 테스트 5개 이상을 작성하고 통과시켰습니다.
- Express 라우터를 supertest로 호출하는 통합 테스트를 작성했습니다.
- JUnit 5로 Spring Service 단위 테스트를 작성했습니다.
- MockMvc로 Spring Controller 통합 테스트를 작성했습니다.
- 테스트 커버리지 보고서를 한 번 이상 출력했습니다.

## 취업 연결

SI/SW 실무에서 테스트는 다음과 같은 가치를 가집니다.

- 신입이 작성한 PR을 시니어가 빠르게 리뷰할 수 있게 해줍니다.
- 회귀 버그를 막아 운영 중 야간 장애를 줄입니다.
- CI/CD 파이프라인의 게이트 역할을 합니다.

이 단계가 끝나면 "Vitest와 JUnit으로 같은 기능에 단위 테스트와 통합 테스트를 작성했고, MockMvc로 Controller 계층을 검증했다"고 설명할 수 있어야 합니다.

## 핵심 개념

- 단위 테스트 vs 통합 테스트 vs E2E 테스트의 차이.
- AAA 패턴. Arrange, Act, Assert.
- 모킹(Mocking)과 스파이(Spy).
- 테스트 더블의 종류. Stub, Mock, Fake, Dummy.
- 픽스처와 setUp/tearDown.
- 테스트 격리(test isolation). 한 테스트가 다른 테스트에 영향을 주지 않게.
- 커버리지의 함정. "커버리지 100%가 곧 버그 0"이 아닙니다.

## JS 진영 vs Java 진영 비교

| 개념 | Vitest/Jest | JUnit 5 |
| --- | --- | --- |
| 테스트 정의 | `test('...', () => {})` | `@Test void name() {}` |
| 단언 | `expect(x).toBe(y)` | `assertEquals(y, x)` |
| 모킹 | `vi.mock(...)`, `vi.fn()` | `Mockito.mock(...)`, `@Mock` |
| 라이프사이클 | `beforeEach`, `afterEach` | `@BeforeEach`, `@AfterEach` |
| API 호출 | `supertest(app).get(...)` | `MockMvc.perform(get(...))` |
| 실행 | `npm test` | `./gradlew test` |

## 면접 연습

- 단위 테스트와 통합 테스트의 차이를 설명해보세요.
- 모킹은 왜 필요한가요? 모든 의존성을 모킹해도 되나요?
- 테스트가 가끔만 실패하는 경우(flaky test) 어떻게 진단하나요?
- 커버리지 100%인데 버그가 있을 수 있나요?
- 데이터베이스가 필요한 테스트에서 격리는 어떻게 보장하나요?
