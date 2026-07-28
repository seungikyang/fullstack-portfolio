# 16단계 보안 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

취약한 코드와 방어 TODO를 같은 파일에서 비교하며 공격 전후를 검증하세요.

- [저장형 XSS 코드 보기](./starter/01-xss-stored.js?view=source)
- [반사형 XSS 코드 보기](./starter/02-xss-reflected.js?view=source)
- [SQL Injection 코드 보기](./starter/03-sql-injection.js?view=source)
- [SQL Injection 준비 SQL 보기](./starter/03-sql-injection-setup.sql?view=source)
- [CSRF 공격 화면 코드 보기](./starter/04-csrf-demo/vulnerable.html?view=source)
- [CSRF 방어 서버 코드 보기](./starter/04-csrf-demo/protected.js?view=source)
- [CORS 코드 보기](./starter/05-cors.js?view=source)

각 문제는 1) 취약한 코드 실행, 2) 공격 재현, 3) 방어 코드 적용, 4) 같은 공격이 막히는지 확인의 4단계로 진행합니다. 막히면 `answers.md`와 비교합니다.

먼저 공통 의존성과 문법을 확인합니다.

```bash
cd 16-security
npm install
npm run check
```

3000번 포트는 저장형 XSS, 반사형 XSS, SQL Injection, CORS가 함께 사용합니다. 한 서버를 확인한 뒤 `Ctrl+C`로 종료하고 다음 서버를 실행하세요. CSRF 서버만 4000번을 사용합니다.

## 1번. 저장형 XSS

`starter/01-xss-stored.js`는 방어 함수를 직접 완성하는 미니 게시판입니다. 먼저 상세 화면의 제목과 본문을 함수로 감싸지 않고 그대로 출력하는 취약 상태를 만들어 공격을 확인한 뒤 방어 TODO로 돌아옵니다.

1. 상세 라우트가 `post.title`, `post.content`를 그대로 문자열에 넣는 취약 상태인지 확인합니다.
2. `npm run start:xss-stored`를 실행하고 글 작성 폼에 `<script>alert('XSS')</script>`를 본문으로 제출합니다.
3. 저장된 글 상세 화면에서 어떤 일이 일어나는지 기록한 뒤 `Ctrl+C`로 서버를 종료합니다.
4. `escapeHtml`과 상세 라우트의 빈칸을 채워 출력 인코딩을 적용합니다.
5. 서버를 다시 실행해 같은 페이로드가 코드가 아닌 텍스트로 보이는지 확인합니다.

힌트. 정답은 출력 인코딩(`<` → `&lt;`)입니다. 입력 검증으로만 막으면 충분하지 않습니다.

## 2번. 반사형 XSS와 URL 파라미터

`starter/02-xss-reflected.js`도 먼저 `q`를 함수로 감싸지 않고 출력하는 취약 상태를 확인한 뒤 방어 TODO를 작성합니다.

1. `npm run start:xss-reflected`를 실행합니다.
2. 브라우저에서 `http://localhost:3000/search?q=<img src=x onerror=alert(1)>`로 접속해 취약 상태의 동작을 기록합니다.
3. 서버를 종료하고 `escapeHtml` 함수와 두 출력 위치의 빈칸을 채웁니다.
4. 다시 실행해 같은 페이로드가 텍스트로만 보이는지 확인합니다.

힌트. 템플릿 엔진(Handlebars, EJS의 `<%= %>`)이 자동으로 escape를 해주는지 확인하세요. 직접 문자열을 결합하는 방식은 항상 위험합니다.

## 3번. SQL Injection 방지

`starter/03-sql-injection.js`는 사용자 검색 쿼리를 문자열 결합으로 만듭니다.

먼저 로컬 MySQL 또는 Docker MySQL 중 하나만 선택해 `app.users` 테이블과 연습 계정을 만듭니다.

로컬 MySQL을 사용하는 경우입니다.

```bash
cd 16-security
mysql -u root -p < starter/03-sql-injection-setup.sql
```

Docker를 사용하는 경우입니다.

```bash
docker run --name security-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -d mysql:8

# 아래 명령이 "mysqld is alive"를 출력할 때까지 다시 실행합니다.
docker exec security-mysql mysqladmin ping -uroot -proot

docker exec -i security-mysql mysql -uroot -proot \
  < starter/03-sql-injection-setup.sql
```

1. `npm run start:sqli`를 실행합니다.
2. 아래 요청으로 취약 경로가 여러 사용자를 반환하는지 확인합니다.

   ```bash
   curl --get --data-urlencode "name=' OR '1'='1" \
     http://localhost:3000/search-bad
   ```

3. 서버를 종료하고 파라미터화 쿼리 빈칸을 채운 뒤 다시 실행합니다.
4. 같은 입력을 `/search-safe`로 보내 더 이상 모든 행을 반환하지 않는지 확인합니다.

힌트. ORM을 쓰는 4~5단계와 11단계 코드가 왜 SQL Injection으로부터 안전한지 설명해보세요.

## 4번. CSRF 시연

`starter/04-csrf-demo/` 폴더에 `vulnerable.html`(공격자 페이지 흉내)과 `protected.js`(방어된 서버 예시)가 있습니다.

1. 빈칸을 채우기 전에 `npm run start:csrf`를 실행합니다. `sameSitePractice`가 아직 `____`인 동안 세션 쿠키에는 SameSite가 추가되지 않습니다.
2. 다른 터미널에서 로그인하고 쿠키를 파일에 저장합니다.

   ```bash
   curl -i -c csrf-cookies.txt -X POST http://localhost:4000/login
   ```

3. CSRF 토큰을 검사하지 않는 취약 경로가 세션 쿠키만으로 200을 반환하는지 확인합니다. `vulnerable.html`도 이 `/api/transfer` 경로를 호출합니다.

   ```bash
   curl -i -b csrf-cookies.txt \
     -d "to=attacker&amount=100000" \
     http://localhost:4000/api/transfer
   ```

4. 같은 쿠키로 보호 경로 `/transfer`를 토큰 없이 호출해 403을 확인합니다.

   ```bash
   curl -i -b csrf-cookies.txt \
     -d "to=friend&amount=1000" \
     http://localhost:4000/transfer
   ```

5. 토큰을 발급받아 응답 JSON의 `token` 값을 복사합니다. 이 요청이 만든 CSRF 쿠키도 같은 파일에 저장합니다.

   ```bash
   curl -i -b csrf-cookies.txt -c csrf-cookies.txt \
     http://localhost:4000/api/csrf-token
   ```

6. `<복사한-token>`을 실제 값으로 바꿔 보호 경로가 200을 반환하는지 확인합니다.

   ```bash
   curl -i -b csrf-cookies.txt \
     --data-urlencode "_csrf=<복사한-token>" \
     --data-urlencode "to=friend" \
     --data-urlencode "amount=1000" \
     http://localhost:4000/transfer
   ```

7. 서버를 종료하고 `sameSitePractice` 빈칸을 채운 뒤 다시 로그인해 `Set-Cookie`에 SameSite가 붙는지 확인합니다. curl은 브라우저가 아니므로 SameSite를 강제하지 않습니다. 교차 출처 POST 차단은 `vulnerable.html`을 다른 출처에서 열어 브라우저에서 확인합니다.
8. `/form`의 hidden input 빈칸도 채운 뒤 브라우저 폼 제출이 보호 경로에서 동작하는지 확인합니다.

힌트. JWT를 Authorization 헤더로만 보내고 쿠키에 넣지 않으면 기본적으로 CSRF에 안전합니다. 그러나 쿠키 인증을 쓰는 순간 SameSite 또는 토큰이 필요합니다. 08 Career Hub가 헤더 방식을 쓴 것도 이 이유입니다.

## 5번. CORS 설정 잘못된 것 → 안전한 것

`starter/05-cors.js`의 빈칸을 채우세요.

1. 다른 3000번 실습을 종료하고 `npm run start:cors`를 실행합니다.
2. `Access-Control-Allow-Origin: *`와 `Access-Control-Allow-Credentials: true`를 함께 두면 어떤 문제가 있는지 설명합니다.
3. 허용 출처를 함수로 받아 화이트리스트 검사하도록 바꿉니다.
4. preflight 요청(OPTIONS)이 어떤 헤더를 검사하는지 직접 확인합니다.

## 6번. 시크릿 노출 사후 대응

실제 비밀값을 원격 저장소에 올리지 말고, 로컬 연습 저장소와 `dummy-secret-for-practice` 같은 폐기 가능한 값으로만 다음 흐름을 실험하세요.

1. 로컬 연습 저장소의 `.env`에 `JWT_SECRET=dummy-secret-for-practice`를 적고 커밋합니다. push하지 않습니다.
2. `git show --stat --oneline HEAD`와 `git show HEAD -- .env`로 커밋 이력에 값이 남는 것을 확인합니다.
3. 다음 대응 순서를 메모로 정리합니다.
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
cd 16-security
npm audit --omit=dev

# 11단계 board-api와 OWASP Dependency-Check 플러그인을 직접 만든 경우에만 실행
cd ../11-java-spring/starter/board-api
./gradlew dependencyCheckAnalyze
```

- `npm audit`이 보고하는 취약점 중 high 이상이 있다면 수정 PR 패치를 적용하세요.
- 운영에서는 CI 단계에서 자동으로 audit이 실행되도록 13~14단계 워크플로우에 추가합니다.

## 9번. OWASP Top 10 자기 정리

[OWASP Top 10 2021](https://owasp.org/Top10/ko/) 페이지를 보고 각 항목을 한 줄로 자기 말로 적으세요.

| 번호 | 항목                                       | 한 줄 요약 |
| ---- | ------------------------------------------ | ---------- |
| A01  | Broken Access Control                      |            |
| A02  | Cryptographic Failures                     |            |
| A03  | Injection                                  |            |
| A04  | Insecure Design                            |            |
| A05  | Security Misconfiguration                  |            |
| A06  | Vulnerable and Outdated Components         |            |
| A07  | Identification and Authentication Failures |            |
| A08  | Software and Data Integrity Failures       |            |
| A09  | Security Logging and Monitoring Failures   |            |
| A10  | Server-Side Request Forgery (SSRF)         |            |

## 자가 점검

- 모든 공격을 직접 실행한 뒤 방어를 적용했나요? (눈으로만 보지 마세요)
- "출력 인코딩"이 왜 "입력 검증"보다 XSS 방어에 더 신뢰할 수 있는지 설명할 수 있나요?
- CORS·CSRF·SameSite의 관계를 그림으로 그려보세요.
