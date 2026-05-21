# 16단계 보안 문제 모음

각 문제는 1) 취약한 코드 실행, 2) 공격 재현, 3) 방어 코드 적용, 4) 같은 공격이 막히는지 확인의 4단계로 진행합니다. 막히면 `answers.md`와 비교합니다.

## 1번. 저장형 XSS

`starter/01-xss-stored.js`는 게시글 본문을 그대로 화면에 그리는 미니 게시판입니다.

1. 서버를 실행하고 글 작성 폼에 `<script>alert('XSS')</script>` 를 본문으로 제출하세요.
2. 다른 사용자로 같은 게시글을 열면 어떤 일이 일어나는지 확인합니다.
3. 빈칸을 채워 출력 시점에 HTML escape를 적용하세요.
4. 같은 페이로드가 더 이상 동작하지 않는지 재확인합니다.

힌트. 정답은 출력 인코딩(`<` → `&lt;`)입니다. 입력 검증으로만 막으면 충분하지 않습니다.

## 2번. 반사형 XSS와 URL 파라미터

`starter/02-xss-reflected.js`는 검색어 `?q=...`를 화면에 그대로 표시합니다.

1. 서버를 실행한 뒤 `http://localhost:3000/search?q=<img src=x onerror=alert(1)>` 로 접속해보세요.
2. 빈칸을 채워 사용자 입력을 안전하게 출력하세요. `escapeHtml` 함수는 1번과 동일합니다.
3. 같은 페이로드가 텍스트로만 보이는지 재확인합니다.

힌트. 템플릿 엔진(Handlebars, EJS의 `<%= %>`)이 자동으로 escape를 해주는지 확인하세요. 직접 문자열을 결합하는 방식은 항상 위험합니다.

## 3번. SQL Injection 방지

`starter/03-sql-injection.js`는 사용자 검색 쿼리를 문자열 결합으로 만듭니다.

1. 검색어에 `' OR '1'='1` 을 입력하면 어떤 결과가 나오나요?
2. 빈칸을 채워 파라미터화 쿼리로 바꾸세요.
3. 같은 페이로드가 더 이상 모든 행을 반환하지 않는지 재확인합니다.

힌트. ORM을 쓰는 4~5단계와 11단계 코드가 왜 SQL Injection으로부터 안전한지 설명해보세요.

## 4번. CSRF 시연

`starter/04-csrf-demo/` 폴더에 `vulnerable.html`(공격자 페이지 흉내)과 `protected.js`(방어된 서버 예시)가 있습니다.

1. `protected.js`의 빈칸을 채워 SameSite 쿠키와 CSRF 토큰을 적용한 뒤 `node protected.js`로 실행합니다.
2. `vulnerable.html`을 다른 출처(다른 포트의 정적 서버나 `file://`)에서 열어보세요. 자동 제출되는 POST 요청이 어떻게 처리되는지 확인합니다.
   - SameSite=Lax 쿠키는 외부에서 시작된 POST에 보내지지 않습니다.
   - CSRF 토큰 검증은 토큰 없는 요청을 403으로 거부합니다.
3. 같은 페이지를 같은 출처(`http://localhost:4000`)에서 열었을 때는 정상 동작하는지 확인합니다.

힌트. JWT를 Authorization 헤더로만 보내고 쿠키에 넣지 않으면 기본적으로 CSRF에 안전합니다. 그러나 쿠키 인증을 쓰는 순간 SameSite 또는 토큰이 필요합니다. 08 Career Hub가 헤더 방식을 쓴 것도 이 이유입니다.

## 5번. CORS 설정 잘못된 것 → 안전한 것

`starter/05-cors.js`의 빈칸을 채우세요.

1. `Access-Control-Allow-Origin: *` 와 `Access-Control-Allow-Credentials: true`를 함께 두면 어떤 문제가 있나요?
2. 허용 출처를 함수로 받아 화이트리스트 검사하도록 바꾸세요.
3. preflight 요청(OPTIONS)이 어떤 헤더를 검사하는지 직접 확인하세요.

## 6번. 시크릿 노출 사후 대응

다음 시나리오를 직접 실험하세요.

1. `.env`에 `JWT_SECRET=topsecret`을 적고 실수로 커밋·푸시합니다.
2. GitHub Secret Scanning이 알림을 보내는지 확인합니다.
3. 다음 대응 순서를 메모로 정리하세요.
   - `JWT_SECRET`을 즉시 새 값으로 교체.
   - 기존에 발급된 토큰을 모두 무효화(서버 비밀이 바뀌면 자동).
   - 영향 범위 평가. 푸시된 시점부터 발견까지 얼마나 노출됐는가.
   - 히스토리 정리는 신중하게(`git filter-repo`).

## 7번. 비밀번호 정책 점검

6단계 코드를 다음 기준으로 점검하세요.

- bcrypt의 work factor(cost)가 12 이상인가?
- 비밀번호 최소 길이 정책이 있는가?
- 동일 비밀번호 여러 사용자에 대해 다른 해시가 나오는가? (salt 효과)
- 로그인 실패 시 "이메일이 없음"과 "비밀번호가 틀림"을 구분해 응답하는가? (사용자 열거 공격)

빈칸을 채워 보완하세요.

## 8번. 의존성 취약점 스캔

```bash
cd 04-node-board-api && npm audit
cd 11-java-spring/starter/board-api && ./gradlew dependencyCheckAnalyze  # 플러그인 추가 필요
```

- `npm audit`이 보고하는 취약점 중 high 이상이 있다면 수정 PR 패치를 적용하세요.
- 운영에서는 CI 단계에서 자동으로 audit이 실행되도록 13~14단계 워크플로우에 추가합니다.

## 9번. OWASP Top 10 자기 정리

[OWASP Top 10 2021](https://owasp.org/Top10/ko/) 페이지를 보고 각 항목을 한 줄로 자기 말로 적으세요.

| 번호 | 항목 | 한 줄 요약 |
| --- | --- | --- |
| A01 | Broken Access Control | |
| A02 | Cryptographic Failures | |
| A03 | Injection | |
| A04 | Insecure Design | |
| A05 | Security Misconfiguration | |
| A06 | Vulnerable and Outdated Components | |
| A07 | Identification and Authentication Failures | |
| A08 | Software and Data Integrity Failures | |
| A09 | Security Logging and Monitoring Failures | |
| A10 | Server-Side Request Forgery (SSRF) | |

## 자가 점검

- 모든 공격을 직접 실행한 뒤 방어를 적용했나요? (눈으로만 보지 마세요)
- "출력 인코딩"이 왜 "입력 검증"보다 XSS 방어에 더 신뢰할 수 있는지 설명할 수 있나요?
- CORS·CSRF·SameSite의 관계를 그림으로 그려보세요.
