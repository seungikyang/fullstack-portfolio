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

각 문제는 1) 취약한 코드 실행, 2) 공격 재현, 3) 방어 코드 적용, 4) 같은 공격이 막히는지 확인의 4단계로 진행합니다. 막히면 먼저 `hints.md`의 1~3단계를 순서대로 보고, 마지막에만 `answers.md`와 비교합니다.

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

개념 확인. 아래 4지선다 A03과 17단계 기술 카드의 I66에서 입력이 쿼리 구문으로 해석되는 위험과 매개변수 바인딩을 확인합니다. ORM을 사용해도 원시 쿼리를 문자열로 조합하면 위험할 수 있습니다.

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
2. credentials를 포함한 요청에는 허용된 구체 출처가 필요함을 브라우저에서 확인하고, 아래 X02에서 CORS와 인증 요청을 구분합니다.
3. 허용 출처를 함수로 받아 화이트리스트 검사하도록 바꿉니다.
4. preflight 요청(OPTIONS)이 어떤 헤더를 검사하는지 직접 확인합니다.

## 6번. 시크릿 노출 사후 대응

실제 비밀값을 원격 저장소에 올리지 말고, 로컬 연습 저장소와 `dummy-secret-for-practice` 같은 폐기 가능한 값으로만 다음 흐름을 실험하세요.

1. 로컬 연습 저장소의 `.env`에 `JWT_SECRET=dummy-secret-for-practice`를 적고 커밋합니다. push하지 않습니다.
2. `git show --stat --oneline HEAD`와 `git show HEAD -- .env`로 커밋 이력에 값이 남는 것을 확인합니다.
3. 다음 대응 흐름을 확인하고 17단계 기술 카드의 I69에서 적절한 대응 순서를 고릅니다.
   - `JWT_SECRET`을 즉시 새 값으로 교체.
   - 기존에 발급된 토큰을 모두 무효화(서버 비밀이 바뀌면 자동).
   - 영향 범위 평가. 푸시된 시점부터 발견까지 얼마나 노출됐는가.
   - 히스토리 정리는 신중하게(`git filter-repo`).

## 7번. 비밀번호 정책 점검 — 4지선다

6단계 인증 코드의 비밀번호 정책을 네 가지 개념 문제로 확인합니다. 보안 기준은 [OWASP 비밀번호 저장 안내](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)와 [인증 안내](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)를 참고합니다.

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PW16-01. bcrypt의 work factor(cost)를 정할 때 알맞은 방법은?

bcrypt의 work factor(cost)를 정할 때 알맞은 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. cost는 비밀번호의 최소 글자 수이므로 12이면 12글자만 허용한다.
2. cost가 12 미만이면 salt가 생성되지 않아 같은 비밀번호의 해시가 항상 같다.
3. cost를 높이면 서버 부하 없이 로그인 검증 시간이 항상 짧아진다.
4. 비용을 높이면 해시 계산과 검증이 느려지므로 실제 서버에서 시간을 측정하고 보안 정책과 처리 용량을 함께 고려한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

work factor는 계산 비용입니다. 6단계 실습은 cost 10을 사용하며, 12가 모든 서비스의 유일한 정답은 아닙니다. OWASP는 bcrypt를 사용하는 기존 시스템에서 최소 10과 서버 성능을 고려하도록 안내합니다. 실제 서버에서 검증 시간을 측정해 정책을 정합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W452)

### PW16-02. 회원가입의 비밀번호 최소 길이 정책을 적용하는 알맞은 위치는?

회원가입의 비밀번호 최소 길이 정책을 적용하는 알맞은 위치는? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 서버에서 비밀번호의 타입과 정책에 맞는 길이를 검증하고 실패한 입력은 해시·저장 전에 거부한다.
2. 입력 칸의 minlength만 설정하면 HTTP 클라이언트도 짧은 비밀번호를 보낼 수 없다.
3. bcrypt가 모든 서비스의 최소 비밀번호 길이를 자동으로 검사한다.
4. 짧은 비밀번호도 먼저 저장한 뒤 브라우저에 경고만 표시한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

브라우저 검증은 우회할 수 있으므로 서버가 정책을 강제해야 합니다. 6단계 원본은 이메일·비밀번호 존재 여부만 확인하며 최소 길이 정책은 별도 구현 대상입니다. 길이 기준은 인증 방식과 서비스 정책을 고려해 정합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W453)

### PW16-03. 같은 비밀번호를 쓰는 두 사용자의 bcrypt 해시가 달라지는 이유는?

같은 비밀번호를 쓰는 두 사용자의 bcrypt 해시가 달라지는 이유는? — 알맞은 설명 또는 답변 방식을 고르세요.

1. bcrypt가 사용자의 비밀번호를 몰래 바꾸기 때문에 해시가 달라진다.
2. 사용자별 해시 생성 때 서로 다른 임의 salt를 사용하며 로그인에서는 저장된 해시와 bcrypt.compare로 검증한다.
3. 해시가 다르면 두 사용자가 같은 비밀번호를 사용할 수 없었다는 뜻이다.
4. 로그인 때 새 salt로 만든 해시 문자열과 저장된 문자열이 같은지만 비교해야 한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

salt는 같은 비밀번호가 같은 해시로 드러나는 것을 줄입니다. bcrypt 해시에는 검증에 필요한 salt와 비용 정보가 포함됩니다. 매번 새 salt로 해시를 만들어 문자열을 비교하는 대신 bcrypt.compare로 입력과 저장된 해시를 검증합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W454)

### PW16-04. 로그인 실패 응답에서 사용자 열거 위험을 줄이는 방법은?

로그인 실패 응답에서 사용자 열거 위험을 줄이는 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 없는 이메일에는 404, 틀린 비밀번호에는 401로 응답해 계정 존재 여부를 알려준다.
2. 응답 본문에 가입 여부와 저장된 비밀번호 해시를 함께 표시한다.
3. 없는 이메일과 틀린 비밀번호에 같은 일반 오류 메시지와 상태 코드를 사용하고 처리 시간 차이도 검토한다.
4. 브라우저에서 메시지만 숨기면 API 응답과 처리 시간의 차이는 점검할 필요가 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

실패 원인을 구별해 공개하면 공격자가 가입된 이메일을 추측할 수 있습니다. 6단계는 두 실패에 같은 401과 메시지를 사용하지만 없는 사용자일 때 일찍 반환하므로 시간 차이 검토는 별도로 필요합니다. 일반 오류 문구만으로 모든 열거 경로가 차단되지는 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W455)

선택한 답과 [6단계 인증 코드](../06-login-auth/src/server.js?view=source)를 대조하세요. 정책 구현과 실행 검증은 별도 실습으로 진행합니다.

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

## 9번. OWASP Top 10 2021 — 4지선다

기존 학습판인 [OWASP Top 10 2021](https://top10.owasp.org/2021/)의 A01~A10을 아래 선택형 문제로 확인합니다. 분류는 2021판 기준이며, 빈 요약 표 대신 보기 네 개 중 하나를 고릅니다.

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS16-01. 공격 재현과 방어 적용을 실제 검증한 근거는?

공격 재현과 방어 적용을 실제 검증한 근거는? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 보안 라이브러리 이름을 목록에 적은 사실만
2. 검증하지 않은 코드에 safe라는 함수 이름을 붙인 사실만
3. 허가된 실습의 같은 공격 입력·방어 전후 결과·정상 요청 결과와 수정 코드
4. 정상 사용자를 포함한 모든 요청을 실패시킨 결과만

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

방어 전후의 비교와 정상 기능 확인이 필요합니다. 실제 실행한 입력과 결과를 기록하고 확인하지 않은 보안 성과를 주장하지 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W443)

### PS16-02. XSS 방어를 선택할 때 알맞은 기준은?

XSS 방어를 선택할 때 알맞은 기준은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. script라는 단어만 제거하면 어떤 출력 문맥에서도 안전하다.
2. JWT가 있으면 innerHTML에 외부 값을 그대로 넣어도 안전하다.
3. 모든 문맥에 하나의 단순 문자열 치환만 쓰면 충분하다.
4. 데이터가 쓰이는 HTML·속성·URL 등의 출력 문맥에 맞는 안전한 처리와 필요한 검증을 적용한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

출력 문맥마다 안전하게 처리하는 방법이 다릅니다. 외부 데이터를 HTML 문자열로 직접 삽입하는 흐름과 URL·속성 문맥도 구분해서 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W444)

### PS16-03. CORS·CSRF·SameSite를 구분한 설명은?

CORS·CSRF·SameSite를 구분한 설명은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. CORS는 브라우저의 교차 출처 응답 접근을 다루고 CSRF는 원치 않는 인증 요청이며 SameSite는 쿠키 전송 조건을 제한한다.
2. CORS는 모든 클라이언트의 사용자별 권한을 검사하는 기능이다.
3. SameSite가 있으면 XSS와 SQL Injection도 자동 차단한다.
4. CORS 허용 목록만 있으면 모든 CSRF 위험이 사라진다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

세 개념은 서로 다른 경계를 다룹니다. 인증 수단과 쿠키 설정·요청 방식에 맞춰 방어하며 CORS를 서버의 인증·접근 제어로 대신하지 않습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W445)

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

OWASP Top 10 2021과 방어 판단 · [웹에서 채점하기](../quiz/index.html?bank=written&category=security)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### A01. 2021 A01 Broken Access Control

2021 A01 Broken Access Control — 알맞은 설명 또는 답변 방식을 고르세요.

1. 다른 사용자의 데이터에 권한 없이 접근하는 문제
2. 비밀번호 해시에 약한 알고리즘을 사용하는 문제
3. 외부 URL을 서버가 무제한 요청하는 문제
4. 의존성 취약점을 패치하지 않는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

인증된 사용자라도 데이터별 권한이 필요합니다. 서버에서 소유자와 허용 작업을 확인합니다.

</details>

### A02. 2021 A02 Cryptographic Failures

2021 A02 Cryptographic Failures — 알맞은 설명 또는 답변 방식을 고르세요.

1. 다른 사용자의 문서를 읽을 권한을 검사하지 않는 문제
2. 민감한 데이터의 보호가 약하거나 누락된 문제
3. SQL 입력을 쿼리로 실행하는 문제
4. 서버가 공격자 URL을 요청하는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

전송과 저장에서 민감한 데이터가 노출되지 않도록 검증된 보호 방법과 비밀 관리가 필요합니다.

</details>

### A03. 2021 A03 Injection

2021 A03 Injection — 알맞은 설명 또는 답변 방식을 고르세요.

1. 서버의 기본 비밀번호를 그대로 사용하는 문제
2. 보안 사건 로그를 전혀 수집하지 않는 문제
3. 입력이 명령이나 쿼리 구문으로 해석되어 의도하지 않은 실행을 만드는 문제
4. 암호화 키를 안전하지 않게 관리하는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

SQL 구조와 값을 분리하는 매개변수 바인딩 등의 방어를 적용합니다. 입력의 해석 경계를 확인합니다.

</details>

### A04. 2021 A04 Insecure Design

2021 A04 Insecure Design — 알맞은 설명 또는 답변 방식을 고르세요.

1. 단일 SQL 쿼리의 매개변수 바인딩이 누락된 구현 결함만을 뜻한다.
2. 설치된 라이브러리 버전이 취약한 문제만을 뜻한다.
3. TLS 인증서 만료만을 뜻한다.
4. 위협을 고려하지 않아 업무 설계 자체에 안전장치가 빠진 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

설계 단계부터 위험한 사용 흐름과 필요한 통제를 확인합니다. 구현 버그를 수정하는 것만으로 끝나지 않을 수 있습니다.

</details>

### A05. 2021 A05 Security Misconfiguration

2021 A05 Security Misconfiguration — 알맞은 설명 또는 답변 방식을 고르세요.

1. 기본 비밀번호·과도한 공개·불필요한 기능 등 잘못된 보안 설정 문제
2. 공격 입력을 SQL 구조와 값으로 분리하지 않는 문제
3. 공급된 패키지의 서명을 확인하지 않는 문제
4. 사용자 데이터의 소유권 검사를 생략하는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

환경별 설정을 확인하고 기본 비밀값과 불필요한 노출을 제거합니다. 안전한 설정도 검증해야 합니다.

</details>

### A06. 2021 A06 Vulnerable and Outdated Components

2021 A06 Vulnerable and Outdated Components — 알맞은 설명 또는 답변 방식을 고르세요.

1. 비밀번호를 약한 방식으로 보호하는 문제
2. 취약하거나 지원이 끝난 의존성을 관리하지 않는 문제
3. 관리자 권한 없이 다른 계정을 삭제할 수 있는 문제
4. 공격을 탐지할 로그를 남기지 않는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

사용 중인 구성 요소와 취약점 정보를 확인하고 업그레이드·대체·완화 조치를 검증합니다.

</details>

### A07. 2021 A07 Identification and Authentication Failures

2021 A07 Identification and Authentication Failures — 알맞은 설명 또는 답변 방식을 고르세요.

1. 인증 후 사용자별 데이터 접근 권한만 누락된 문제
2. 무제한 외부 URL 요청으로 내부 자원에 접근하는 문제
3. 로그인·자격 증명·세션 관리가 약해 사용자를 제대로 확인하지 못하는 문제
4. 서명 없는 업데이트를 신뢰하는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

비밀번호 보호와 인증 시도·토큰 수명 등 인증 흐름을 점검합니다. 권한 부여 문제와 구분합니다.

</details>

### A08. 2021 A08 Software and Data Integrity Failures

2021 A08 Software and Data Integrity Failures — 알맞은 설명 또는 답변 방식을 고르세요.

1. 오래된 라이브러리의 알려진 취약점만을 뜻한다.
2. 로그인 시도 제한이 빠진 문제만을 뜻한다.
3. 다른 사용자 데이터의 접근 권한만 누락된 문제를 뜻한다.
4. 신뢰하지 못하는 업데이트·파이프라인·데이터의 무결성을 확인하지 않는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

신뢰 경계와 무결성 검증을 확인합니다. 빌드·배포 과정에서 변조된 코드가 들어오지 않도록 관리합니다.

</details>

### A09. 2021 A09 Security Logging and Monitoring Failures

2021 A09 Security Logging and Monitoring Failures — 알맞은 설명 또는 답변 방식을 고르세요.

1. 보안 사건을 기록·탐지·대응하기 위한 로그와 감시가 부족한 문제
2. 공격자 입력을 셸 명령으로 실행하는 문제
3. 비밀번호를 평문으로 저장하는 문제
4. 서버의 기본 관리자 암호를 변경하지 않는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

필요한 사건을 기록하고 탐지·대응과 연결합니다. 비밀번호나 토큰 원문은 로그에 남기지 않습니다.

</details>

### A10. 2021 A10 Server-Side Request Forgery

2021 A10 Server-Side Request Forgery — 알맞은 설명 또는 답변 방식을 고르세요.

1. 사용자 브라우저에서 악성 스크립트를 실행시키는 XSS만을 뜻한다.
2. 공격자가 서버의 요청 대상을 조작해 내부 등 의도하지 않은 자원에 접근시키는 문제
3. SQL 구조를 사용자 입력으로 조작하는 문제
4. 로그인 비밀번호를 평문으로 저장하는 문제

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

서버가 사용자 입력 URL을 요청할 때 대상 제한과 네트워크 통제가 필요합니다. 서버의 접근 권한을 악용하는 공격입니다.

</details>

### X01. XSS 출력 처리

XSS 출력 처리 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 모든 입력에서 공백만 삭제한다.
2. 항상 innerHTML에 원문을 그대로 넣는다.
3. 출력 문맥에 맞는 인코딩·안전한 API를 사용하고 HTML 허용 시 정화한다.
4. HTTPS가 있으면 출력 처리는 생략한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

HTML·속성·URL·스크립트 등 문맥이 다릅니다. textContent 등 안전한 API로 필요한 표현을 합니다.

</details>

### X02. CORS·CSRF·SameSite 관계

CORS·CSRF·SameSite 관계 — 알맞은 설명 또는 답변 방식을 고르세요.

1. CORS만 있으면 모든 CSRF 요청이 전송 불가능하다.
2. SameSite는 모든 XSS 코드를 자동 삭제한다.
3. CSRF 토큰은 DB 인덱스 이름이다.
4. CORS는 응답 읽기 정책이고 SameSite·CSRF 토큰은 상황에 맞는 CSRF 완화 수단이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

브라우저의 읽기 허용과 인증 정보를 동반한 요청 위조를 구분합니다. 실제 인증 방식에 맞춰 방어합니다.

</details>
<!-- written-choice:end -->
