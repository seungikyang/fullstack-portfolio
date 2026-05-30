---
name: si-interview-patterns
description: 한국 SI/SW(특히 Java/Spring 대형 SI) 신입·주니어 면접의 단골 질문, STAR 답변 형식, Node/Express → Java/Spring 용어 변환 가이드를 제공한다. si-job-fit-coach 에이전트가 면접 Q&A를 생성할 때, portfolio-doc-editor가 resume-assets.md를 다듬을 때 반드시 이 스킬을 참조하라.
---

# si-interview-patterns — SI/Spring 채용 면접 패턴

한국 SI/SW 채용(특히 Java/Spring 기반 SI)에서 신입·주니어가 받는 면접 질문 패턴, 답변 구조, 용어 변환 가이드.

## 사용 시점

- si-job-fit-coach가 코드 근거 있는 면접 Q&A를 생성할 때
- portfolio-doc-editor가 README의 "면접에서 설명할 포인트" 섹션이나 resume-assets.md를 다듬을 때
- SI 적합성을 평가할 때

## 핵심 원칙

### 1. 신입은 "직접 만든 것"을 정확히 설명할 수 있어야 한다

면접관은 거창한 기술을 자랑하는 신입보다 **"왜 이렇게 짰는지"를 자기 말로 설명하는 신입**을 선호한다. 답변에 다음 3가지를 반드시 포함하라:
- **What:** 무엇을 했는지 (구현 사실)
- **Why:** 왜 그렇게 했는지 (의도, 트레이드오프)
- **Where:** 코드의 어디에 있는지 (파일명·함수명)

### 2. STAR 형식으로 정리하라

- **Situation (상황):** 어떤 문제·요구가 있었는지
- **Task (과제):** 무엇을 해야 했는지
- **Action (행동):** 어떻게 했는지 (코드 근거)
- **Result (결과):** 어떤 효과가 있었는지 (가능하면 정량 표현)

예시:
> (S) 로그인 토큰이 무제한이면 탈취 시 영구 접근이 가능합니다. (T) 만료를 두되 사용자 경험을 해치지 않아야 했습니다. (A) `server/auth.js`의 `signToken`에 `expiresIn: '1h'`를 추가하고, 클라이언트가 401 응답을 받으면 재로그인하도록 처리했습니다. (R) 토큰 탈취 영향 범위를 최대 1시간으로 제한했습니다.

### 3. Node로 만든 것을 Java/Spring 어휘로 다리 놓기

SI 면접관은 대부분 Spring 기반 질문을 한다. Node로 짠 포트폴리오를 그대로 자랑하면 "왜 Spring 안 쓰셨어요?"로 끝난다. **다리(bridge) 문장**을 답변 끝에 붙여라.

예시:
> ...라우터(`server/index.js`)와 저장소(`server/data-store.js`)를 분리한 것은 Spring으로 옮긴다면 `@RestController`와 `@Repository`를 별도로 두는 것과 같은 의도입니다.

## Node/Express → Java/Spring 용어 변환표

| Node/Express 개념 | Spring 대응 | 다리 문장 표현 |
|------------------|-------------|---------------|
| `app.get/post(...)` 라우터 | `@RestController` + `@GetMapping/@PostMapping` | "라우터는 Spring의 컨트롤러에 해당합니다" |
| 비즈니스 로직 함수 | `@Service` 메서드 | "서비스 계층 분리와 같은 의도입니다" |
| `data-store.js` 같은 저장소 모듈 | `@Repository` 인터페이스 + JPA | "저장소 인터페이스 분리에 해당합니다" |
| `express.json()` 미들웨어 | `@RequestBody` + Jackson | "본문 파싱과 같은 역할입니다" |
| `validators.js` + 수동 검증 | `@Valid` + `@Validated` + JSR-303 | "스프링이라면 `@Valid` 어노테이션으로 선언적으로 처리합니다" |
| Express 에러 핸들러 | `@ControllerAdvice` + `@ExceptionHandler` | "전역 예외 처리기와 같은 역할입니다" |
| JWT 검증 미들웨어 | Spring Security `OncePerRequestFilter` | "필터 체인에서 토큰을 검증하는 것과 같습니다" |
| pino-http 로깅 | Logback + MDC + `Filter` | "MDC로 요청 상관관계 ID를 묶는 것과 같은 의도입니다" |
| Vitest + supertest | JUnit 5 + MockMvc / `@SpringBootTest` | "단위 테스트는 JUnit, 통합 테스트는 MockMvc에 해당합니다" |
| helmet, rate-limit, CORS 미들웨어 | Spring Security 필터 / `@CrossOrigin` | "보안 헤더와 CORS를 필터에서 처리하는 것과 같습니다" |
| `try/catch` 트랜잭션 흉내 | `@Transactional` | "선언적 트랜잭션 처리와 같은 의도이며, 현재는 JSON 파일이라 부분적으로만 흉내냈습니다" |

## SI 면접 단골 질문 카테고리

상세 질문과 답변 패턴은 `references/java-spring-bridge.md`를 참조한다.

### A. 본인 소개·동기 (5분)
- 왜 SI 회사인가? 왜 우리 회사인가?
- 왜 풀스택을 공부했는가?

### B. 프로젝트 설명 (15분, 가장 핵심)
- 이 프로젝트에서 뭘 했는지 1분 안에
- 가장 어려웠던 부분과 해결 과정
- 직접 작성한 코드 한 줄을 지목해 설명

### C. 기술 깊이 (15분)
- JWT 동작 원리, bcrypt를 쓴 이유
- REST API와 HTTP 상태 코드
- 트랜잭션 격리 수준 (Java/Spring 빈출)
- 인덱스, JOIN, N+1 문제 (SQL 빈출)
- 객체지향 4원칙 (Java 빈출)

### D. CS 기초 (10분)
- TCP/UDP 차이, HTTP/HTTPS
- 프로세스/스레드
- 자료구조 (Hash vs Tree)

### E. 인성·협업 (10분)
- 갈등 해결 경험
- 야근·주말 근무에 대한 태도
- 본인의 약점

## 이력서·자기소개서용 문장 패턴

### 좋은 문장 (정량 + STAR 압축)
> "Express 기반 REST API와 React SPA를 통합한 풀스택 포트폴리오를 개발하며, JWT 인증·bcrypt 해시·helmet CSP를 적용해 OWASP 기준 기본 보안을 충족했습니다. Vitest 단위/통합 테스트 30+건과 GitHub Actions CI(lint→test→build→docker)로 회귀 방지를 자동화했습니다."

### 나쁜 문장 (검증 불가능한 형용사)
> "꼼꼼하게 풀스택 프로젝트를 잘 만들었습니다."

### 좋은 문장 (Java/Spring 다리 + 학습 의지)
> "Node/Express로 구현한 계층 분리(라우터-저장소)를 Spring의 Controller-Service-Repository 구조로 옮기는 실습을 11번 트랙(`11-java-spring`)에서 진행 중입니다."

## 답변 검토 체크리스트

면접 답안 초안을 작성한 뒤 다음을 모두 통과해야 한다:

- [ ] 코드 근거(파일:라인 또는 함수명)가 1개 이상 인용되었는가?
- [ ] "왜"가 설명되어 있는가?
- [ ] Java/Spring 다리 문장이 있는가? (선택적이지만 있으면 강함)
- [ ] 신입 톤인가? ("저는 ~을 직접 작성했고 ~을 확인했습니다" 형태)
- [ ] 거짓·과장이 없는가? (실제 코드와 일치)
- [ ] 1분 이내로 말할 분량인가? (너무 길면 면접관이 끊는다)

## 신입 톤 가이드

| 좋은 표현 | 피해야 할 표현 |
|----------|---------------|
| "직접 작성했습니다" | "설계했습니다" (너무 거창) |
| "이 부분이 헷갈렸는데 ~로 해결했습니다" | "완벽하게 구현했습니다" |
| "면접관님이 더 좋은 방법을 알려주시면 배우고 싶습니다" | "이게 베스트 프랙티스입니다" |
| "현재 한계점은 ~이고 다음 단계는 ~입니다" | (한계 언급 회피) |
| "1~7 트랙에서 배운 ~을 이 부분에 적용했습니다" | "오랫동안 풀스택을 해왔습니다" |
