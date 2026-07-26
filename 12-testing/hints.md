# 12단계 단계별 힌트

[단계 설명](./README.md) · [문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md)

한 번에 모두 읽지 말고, 막힌 문제의 1단계부터 차례로 확인하세요.

## 1번. 순수 함수 단위 테스트

### 1단계. 개념 환기

- 테스트는 준비, 실행, 검증의 흐름으로 읽을 수 있어야 합니다.
- 정확한 값은 `toBe`, 근삿값은 `toBeCloseTo`, 예외는 함수를 감싸 `toThrow`로 검증합니다.

### 2단계. 접근 방향

- 각 `it`의 이름이 말하는 입력으로 함수를 호출하세요.
- 부동소수점은 완전 일치 대신 허용 정밀도를 지정하세요.
- 예외 함수는 먼저 실행하지 말고 실행할 콜백을 `expect`에 넘기세요.

### 3단계. Vitest API 수준

```ts
expect(/* 함수 호출 결과 */).toBe(/* 기대값 */);
expect(/* 소수 계산 결과 */).toBeCloseTo(/* 기대 근삿값 */, /* 자릿수 */);
expect(() => /* 예외가 나는 호출 */).toThrow(/* 메시지 */);
```

## 2번. Express 라우터 통합 테스트

### 1단계. 개념 환기

- supertest는 서버 포트를 직접 열지 않고 Express app에 HTTP 형태의 요청을 보냅니다.
- 상태 코드와 응답 body를 함께 검증해야 계약을 확인할 수 있습니다.

### 2단계. 접근 방향

- 각 테스트에서 메서드와 경로를 문제 요구와 맞추세요.
- POST 성공에는 완전한 body를, 실패에는 필수 필드가 빠진 body를 보내세요.
- 테스트 간 배열 상태가 공유되는지 확인하고 필요하면 기존 초기화 코드를 사용하세요.

### 3단계. supertest API 수준

```ts
const response = await request(app).post("/posts").send({
  /* 요청 body */
});

expect(response.status).toBe(/* 기대 상태 */);
expect(response.body).toEqual(/* 기대 응답 형태 */);
```

## 3번. 모킹

### 1단계. 개념 환기

- spy는 실제 함수 호출 여부와 인자를 관찰하면서 구현을 가짜로 바꿀 수 있습니다.
- 비동기 함수의 가짜 성공값은 Promise로 반환해야 합니다.

### 2단계. 접근 방향

- mailer 객체와 메서드 이름을 `spyOn`에 전달하세요.
- `notifyUser`를 호출한 뒤 spy가 몇 번, 어떤 인자로 호출됐는지 검증하세요.
- 테스트 후 원래 구현 복원 흐름이 있는지 확인하세요.

### 3단계. Vitest spy 수준

```ts
const spy = vi
  .spyOn(/* 모듈 객체 */, /* 메서드 이름 */)
  .mockResolvedValue(/* 가짜 비동기 결과 */);

expect(spy).toHaveBeenCalledWith(
  /* 수신자 */,
  expect.stringContaining(/* 제목 일부 */),
  expect.any(String),
);
```

## 4번. JUnit 5 단위 테스트

### 1단계. 개념 환기

- Service 단위 테스트에서는 Repository를 실제 DB 대신 mock으로 바꿉니다.
- `when(...).thenReturn(...)`으로 의존성 결과를 준비하고 `assertThrows`나 `assertEquals`로 결과를 검증합니다.

### 2단계. 접근 방향

- Mockito 확장, Repository mock, Service 주입 구성을 먼저 완성하세요.
- 없는 id 테스트는 Optional의 빈 값을 준비한 뒤 Service 호출을 예외 검증 안에 넣으세요.
- 생성 테스트는 저장 결과 객체를 준비하고 반환 객체가 같은지 확인하세요.

### 3단계. JUnit·Mockito 수준

```java
when(repository.findById(id)).thenReturn(Optional.empty());
assertThrows(/* 예외 타입 */, () -> service.findById(id));

when(repository.save(entity)).thenReturn(savedEntity);
assertEquals(/* 기대 객체 */, service.create(entity));
```

## 5번. MockMvc Controller 통합 테스트

### 1단계. 개념 환기

- `@WebMvcTest`는 MVC 계층만 올리고 Service는 mock으로 대체합니다.
- MockMvc는 요청 수행 뒤 상태와 JSON 경로를 검증합니다.

### 2단계. 접근 방향

- 테스트 대상 Controller와 필요한 Service mock을 선언하세요.
- GET 테스트는 Service 반환값을 먼저 준비하세요.
- POST 실패 테스트는 content type을 JSON으로 설정하고 필수 body를 누락하세요.

### 3단계. MockMvc API 수준

```java
mockMvc.perform(get("/api/posts"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$").isArray());

mockMvc.perform(post("/api/posts")
        .contentType(MediaType.APPLICATION_JSON)
        .content(/* 검증 실패 JSON */))
    .andExpect(status().isBadRequest());
```

## 6번. 커버리지 보고서

### 1단계. 개념 환기

- 커버리지는 실행된 줄이나 분기의 비율이지 코드가 올바르다는 보장은 아닙니다.
- 숫자보다 어떤 위험 경로가 빠졌는지 확인하는 것이 중요합니다.

### 2단계. 접근 방향

- 먼저 일반 테스트를 통과시킨 뒤 커버리지 명령을 실행하세요.
- 생성된 HTML 보고서에서 미실행 줄을 하나 선택하세요.
- 그 줄이 정상·오류·경계값 중 어떤 시나리오인지 메모하세요.

### 3단계. 실행 명령 수준

```bash
npx vitest run --coverage
./gradlew test jacocoTestReport
```

실제로 구성한 환경의 명령만 실행하고, 보고서 경로와 미검증 줄을 함께 기록하세요.

3단계까지 확인한 뒤에도 막히면 마지막으로 [정답 예시와 비교하세요](./answers.md).
