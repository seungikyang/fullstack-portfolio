# Java/Spring 다리 — 단골 질문 상세 답변 패턴

Career Hub(Node/Express) 코드를 SI/Java-Spring 채용 면접에서 설명할 때 사용할 상세 답변 카탈로그.

## 사용법

si-job-fit-coach가 면접 Q&A를 생성할 때 이 문서의 패턴을 베이스로 사용한다. 단, 답변 본문은 **실제 사용자의 코드에 맞춰 다시 작성**해야 한다 (이 문서의 예시는 일반화된 템플릿).

## 목차

1. 인증·인가
2. REST API와 HTTP
3. 계층 분리와 의존성 역전
4. 트랜잭션·동시성
5. 보안 미들웨어
6. 로깅·관측성
7. 테스트 전략
8. 빌드·배포
9. 데이터베이스·SQL (예상 질문)
10. 객체지향·자료구조 (예상 질문)

---

## 1. 인증·인가

### Q: JWT를 어떻게 검증하시나요?

(S) 보호 API 요청마다 사용자가 누구인지 확인해야 합니다. (T) 매 요청마다 DB를 조회하지 않고도 사용자를 식별할 방법이 필요했습니다. (A) `server/auth.js`의 `verifyToken` 함수에서 `jsonwebtoken.verify`로 서명을 검증하고, 페이로드의 사용자 ID를 `req.user`에 넣어 라우터에서 쓰도록 했습니다. 만료 검증도 `expiresIn` 옵션으로 처리됩니다. (R) DB 부하 없이 인증이 처리되며 stateless 구조라 수평 확장이 쉽습니다.

**Java/Spring 다리:** Spring Security에서는 `OncePerRequestFilter`를 만들어 `Authorization` 헤더에서 토큰을 꺼내 검증하고 `SecurityContextHolder`에 `Authentication` 객체를 넣는 방식과 같은 의도입니다.

**예상 후속 challenge:**
- "JWT vs 세션의 차이는요?" → stateless / stateful, 확장성 / 즉시 무효화 가능성
- "토큰을 어디에 저장하나요?" → 현재는 localStorage. XSS 시 탈취 위험이 있고 httpOnly 쿠키가 더 안전함을 인지하고 있다고 답한다.

### Q: bcrypt를 쓴 이유는요?

(S) 비밀번호를 평문이나 단순 해시(SHA-256 등)로 저장하면 유출 시 무방비입니다. (T) 강력한 해시 + salt + slow를 만족하는 방식이 필요했습니다. (A) bcryptjs의 `hash`/`compare`를 사용했고 라운드 수는 10으로 설정했습니다. (R) 무차별 대입 공격 비용이 크게 증가합니다.

**Java/Spring 다리:** Spring Security의 `BCryptPasswordEncoder`와 정확히 동일한 알고리즘입니다. `passwordEncoder.encode(rawPassword)`와 `matches`에 대응합니다.

---

## 2. REST API와 HTTP

### Q: HTTP 상태 코드를 어떻게 나누셨나요?

(S) 클라이언트가 실패 원인에 따라 다르게 처리해야 합니다. (T) 일관된 분기 기준이 필요했습니다. (A) 생성 성공은 201, 인증 실패는 401, 권한 부족은 403, 자원 미존재는 404, 검증 실패는 400, 서버 예외는 500으로 나눴습니다. (R) 프론트엔드(`src/App.jsx`)에서 401이면 로그인 페이지로, 400이면 폼 에러 메시지를 보이도록 분기할 수 있습니다.

**Java/Spring 다리:** Spring에서는 `ResponseEntity.status(HttpStatus.CREATED)` 또는 `@ResponseStatus(HttpStatus.NOT_FOUND)`로 표현합니다.

### Q: PATCH와 PUT 차이는요?

PUT은 자원 전체를 교체하고, PATCH는 일부 필드만 부분 수정합니다. 이 프로젝트는 지원 현황 상태(예: "지원함" → "면접")처럼 일부 필드만 바꾸는 경우가 많아 PATCH로 통일했습니다.

---

## 3. 계층 분리와 의존성 역전

### Q: 저장소 로직을 분리한 이유는요?

(S) JSON 파일 저장이 학습용으로 시작이지만, 실서비스라면 MongoDB/PostgreSQL로 바뀝니다. (T) 저장 방식이 바뀌어도 라우터·비즈니스 로직 영향을 최소화해야 했습니다. (A) `server/data-store.js`에 CRUD 함수(`load`, `save`, `update` 등)를 모아 두고, 라우터는 이 함수만 호출합니다. (R) 나중에 MongoDB로 바꿔도 `data-store.js`의 내부 구현만 바꾸면 됩니다.

**Java/Spring 다리:** Spring의 `Repository` 인터페이스를 정의하고 구현체(`JpaRepository` 또는 `MongoRepository`)를 갈아 끼우는 의존성 역전 원칙(DIP)과 같은 의도입니다.

---

## 4. 트랜잭션·동시성

### Q: 동시에 두 사용자가 같은 데이터를 수정하면 어떻게 되나요?

(S) JSON 파일을 읽고-수정-쓰는 사이에 다른 요청이 끼면 lost update가 발생할 수 있습니다. (T) 이 한계를 인지하고 답할 수 있어야 합니다. (A) 현재 구현은 단순 파일 쓰기라 동시성 보장이 약합니다. (R) **한계 명시:** 실서비스에서는 DB 트랜잭션이나 낙관적 락(version 컬럼)으로 처리해야 합니다.

**Java/Spring 다리:** `@Transactional`로 메서드 단위 트랜잭션을 걸고, `@Version` 컬럼으로 낙관적 락을 적용하는 방식으로 옮길 수 있습니다.

**팁:** 이 답변은 약점을 솔직히 인정하면서 다음 단계를 아는 신입의 모습으로 좋은 인상을 준다.

---

## 5. 보안 미들웨어

### Q: helmet, rate-limit, CORS를 왜 같이 쓰셨나요?

helmet은 X-Frame-Options·X-Content-Type-Options·CSP 같은 기본 보안 헤더를 추가합니다 (`server/index.js`). rate-limit은 `/api/auth/login`처럼 무차별 대입 가능한 엔드포인트를 보호합니다. CORS는 `CLIENT_ORIGIN`만 허용해 다른 도메인의 무단 호출을 막습니다.

**Java/Spring 다리:** Spring Security의 `HttpSecurity` 설정에서 `.headers()`, `.cors()`, 그리고 별도 Bucket4j 필터로 rate-limit을 거는 방식에 대응합니다.

### Q: CSP를 명시한 이유는요?

helmet 기본값은 가장 엄격한 CSP를 적용하는데, Vite 빌드 결과나 외부 폰트가 필요한 경우 충돌이 납니다. `server/index.js`에서 CSP `directives`를 명시해 필요한 origin만 허용했습니다.

---

## 6. 로깅·관측성

### Q: 요청 추적은 어떻게 하시나요?

(S) 운영 환경에서 문제가 생기면 어느 요청이 원인인지 추적해야 합니다. (T) 로그에 요청 단위 식별자가 필요했습니다. (A) `pino-http`가 모든 요청에 `X-Request-Id`를 부여하고 응답 헤더에도 echo합니다. 외부에서 보낸 `X-Request-Id`가 있으면 그 값을 그대로 사용해 분산 추적을 흉내냅니다. (R) 로그에서 한 요청의 전체 흐름을 ID로 묶어 볼 수 있습니다.

**Java/Spring 다리:** Logback의 `MDC.put("requestId", ...)`와 같은 의도이며, Sleuth/Micrometer Tracing이 자동으로 처리해주는 부분과 대응됩니다.

### Q: 로그에서 비밀번호는 어떻게 가렸나요?

`server/logger.js`에서 pino의 `redact` 옵션으로 `req.body.password`와 `req.headers.authorization`을 자동 마스킹합니다.

---

## 7. 테스트 전략

### Q: 어떤 테스트를 짜셨나요?

단위 테스트는 Vitest로 `validators.test.js`, `auth.test.js`, `data-store.test.js`에서 함수 단위로, 통합 테스트는 supertest로 `api.test.js`에서 실제 Express 앱에 HTTP 요청을 보내 검증합니다. 추가로 `scripts/api-smoke-test.js`로 실 서버를 띄워 핵심 흐름(가입→로그인→CRUD)을 한 번에 검증합니다.

**Java/Spring 다리:** JUnit 5 단위 테스트 + MockMvc 통합 테스트 + `@SpringBootTest` 풀 컨텍스트 테스트에 대응합니다.

### Q: smoke test는 일반 테스트와 뭐가 다른가요?

smoke test는 "최소 동작 확인"입니다. 기능을 깊게 검증하지 않고 핵심 흐름이 망가지지 않았는지만 빠르게 확인합니다. 배포 직전이나 큰 리팩터링 후에 안전망으로 씁니다.

---

## 8. 빌드·배포

### Q: 멀티 스테이지 Dockerfile을 쓴 이유는요?

(S) 빌드에 필요한 도구(node_modules의 devDependencies, Vite 빌드러)는 운영 이미지에 필요 없습니다. (T) 최종 이미지를 작게, 보안 표면을 좁히고 싶었습니다. (A) builder 스테이지에서 빌드 산출물만 추출해 runtime 스테이지로 복사했고, 비루트 사용자(`node`)로 실행하며 HEALTHCHECK를 추가했습니다. (R) 이미지 크기 감소, 컨테이너 침해 시 영향 범위 축소.

**Java/Spring 다리:** Spring Boot 프로젝트에서도 builder + JRE-only 이미지로 동일하게 멀티 스테이지를 적용합니다.

### Q: CI에서 뭘 검증하시나요?

`.github/workflows/ci.yml`에서 lint → test → build → docker 이미지 빌드 → `/api/health` 응답 확인 순으로 게이트를 둡니다. 어느 한 단계라도 실패하면 머지가 막힙니다.

---

## 9. 데이터베이스·SQL (예상 질문)

이 포트폴리오가 JSON 파일이라서 SQL 질문은 직접 매칭이 어렵습니다. 그래서 다음과 같이 답한다:

> 이 프로젝트는 학습 순서상 JSON 저장소에서 멈췄지만, 10번 트랙(`10-sql-oracle`)에서 SQL JOIN/집계/트랜잭션을 별도로 실습 중입니다. 이 포트폴리오의 `data-store.js`를 PostgreSQL Repository로 교체하는 작업이 다음 단계입니다.

**준비할 보너스 답변:**
- N+1 문제: ORM에서 자식 컬렉션을 loop 안에서 lazy 로딩할 때 쿼리가 폭증하는 문제. fetch join 또는 batch size로 해결.
- 트랜잭션 격리 수준: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE. 격리가 높을수록 일관성↑ 동시성↓.
- 인덱스: B-Tree가 일반적이며 WHERE/JOIN/ORDER BY에 자주 쓰는 컬럼에 둠. 너무 많으면 쓰기 비용↑.

---

## 10. 객체지향·자료구조 (예상 질문)

Node로 짰지만 Java 면접 단골을 미리 정리:

- **OOP 4원칙:** 캡슐화(private 필드), 상속(extends), 다형성(오버라이드/오버로드), 추상화(interface).
- **SOLID:** SRP(단일책임), OCP(개방-폐쇄), LSP(리스코프 치환), ISP(인터페이스 분리), DIP(의존성 역전). 이 포트폴리오에서 DIP는 `data-store.js` 분리로 부분적으로 적용됨.
- **자료구조:** Array는 인덱스 접근 O(1), 삽입 O(n). HashMap은 평균 O(1) 조회/삽입, 최악 O(n). Tree(BST/Red-Black)는 정렬된 데이터에서 O(log n) 조회.

---

## 답변 마무리 공통 표현

좋은 마무리:
> "현재 한계는 ~이고, 다음 단계로 ~을 학습 중입니다."
> "면접관님이 다른 접근 방식을 선호하신다면 말씀해 주세요. 배우고 싶습니다."

나쁜 마무리:
> "끝났습니다." (어색한 종료)
> "이게 베스트입니다." (오만)
