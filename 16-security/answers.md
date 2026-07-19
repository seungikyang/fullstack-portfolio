# 16단계 보안 정답과 해설

[문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md) · [다음 단계](../17-interview-prep/README.md)

## 1번. 저장형 XSS

취약 코드.

```js
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  res.send(`<h1>${post.title}</h1><div>${post.content}</div>`); // 위험
});
```

방어 코드.

```js
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  res.send(
    `<h1>${escapeHtml(post.title)}</h1><div>${escapeHtml(post.content)}</div>`,
  );
});
```

설명. 입력 시점에 `<script>`만 걸러도 `<img onerror=...>`로 우회됩니다. 출력 시점 인코딩이 사실상 유일한 안정적 방어입니다. React, Vue, Angular 같은 현대 프레임워크는 기본적으로 출력 인코딩을 해줍니다. `dangerouslySetInnerHTML`을 직접 쓸 때만 위험합니다.

## 2번. 반사형 XSS

```js
// Express + EJS
app.get("/search", (req, res) => {
  res.render("search", { q: req.query.q }); // EJS의 <%= %>가 자동 escape
});
```

설명. EJS는 `<%= %>`로 출력하면 자동으로 escape하지만 `<%- %>`로 쓰면 원본 HTML이 들어갑니다. Handlebars의 `{{x}}`도 자동 escape, `{{{x}}}`는 원본. 프레임워크의 기본 동작을 알아야 합니다.

## 3번. SQL Injection 방어

실행 전 `starter/03-sql-injection-setup.sql`을 로컬 MySQL 또는 Docker MySQL에 적용합니다. 이 스크립트가 코드의 접속값과 같은 `app` 데이터베이스, `user` 계정, `users` 테이블을 만듭니다.

취약 코드.

```js
// Node + mysql2 콜백
const sql = `SELECT * FROM users WHERE name = '${req.query.name}'`; // 위험
connection.query(sql, (err, rows) => res.json(rows));
```

방어 코드.

```js
// 파라미터화 쿼리
connection.query(
  "SELECT * FROM users WHERE name = ?",
  [req.query.name],
  (err, rows) => res.json(rows),
);
```

```ts
// Spring Data JPA는 메서드 시그니처가 자동으로 파라미터화 쿼리를 만듭니다.
@Query("SELECT u FROM User u WHERE u.name = :name")
List<User> findByName(@Param("name") String name);
```

설명. 문자열 결합으로 만든 쿼리는 사용자 입력이 쿼리 구조 자체를 바꿀 수 있습니다. 파라미터화 쿼리는 입력을 데이터로만 다루므로 안전합니다. ORM이 안전한 이유가 이것입니다.

## 4번. CSRF 방어

`starter/04-csrf-demo/protected.js`는 `node:crypto`로 만든 토큰을 쿠키와 요청 body에서 직접 비교합니다.

방어 1. 세션 쿠키의 SameSite 설정.

```js
const sameSitePractice = "lax"; // 또는 "strict"

res.cookie(sessionCookieName, sessionId, {
  httpOnly: true,
  secure: false, // 로컬 HTTP 실습용. 운영 HTTPS에서는 true.
  sameSite: sameSitePractice,
});
```

방어 2. 수동 CSRF 토큰 발급과 검증.

```js
function issueCsrfToken(_req, res) {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(csrfCookieName, token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  return token;
}

function verifyCsrfToken(req, res, next) {
  if (!tokensMatch(req.cookies[csrfCookieName], req.body._csrf)) {
    return res.status(403).json({
      message: "CSRF 토큰이 없거나 올바르지 않습니다.",
    });
  }
  return next();
}

app.post("/transfer", requireSession, verifyCsrfToken, handler);
```

폼의 빈칸은 해당 요청에서 발급한 `token` 변수를 연결합니다.

```html
<input type="hidden" name="_csrf" value="${token}" />
```

설명.

- `/api/transfer`는 비교를 위해 세션만 확인하는 취약 경로이고, `/transfer`는 세션과 CSRF 토큰을 모두 확인하는 보호 경로입니다.
- `SameSite=Lax` 또는 `Strict`의 교차 출처 전송 제한은 브라우저가 적용합니다. `curl -b`는 저장된 쿠키를 명시적으로 보내므로 SameSite 차단을 재현하지 않습니다.
- CSRF 토큰은 `/api/csrf-token` 또는 `/form`에서 발급되고, 같은 쿠키와 body 토큰을 함께 보내야 보호 경로를 통과합니다.
- JWT를 Authorization 헤더로만 쓰고 쿠키에 넣지 않는 SPA 패턴은 기본적으로 CSRF 위험이 적습니다(이것이 Career Hub의 패턴입니다).

XSS vs CSRF.

- XSS는 사용자 브라우저에서 임의 코드를 실행. 영향이 큽니다.
- CSRF는 사용자가 모르는 사이 의도하지 않은 요청을 보냄. 영향이 제한적이지만 흔합니다.

## 5번. CORS 안전 설정

위험한 설정.

```js
app.use(cors({ origin: "*", credentials: true })); // 동시에 쓰면 브라우저가 거부
```

안전한 설정.

```js
const allowed = ["http://localhost:3000", "https://app.example.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

설명. CORS는 **브라우저가 검증**합니다. 서버는 응답 헤더로 "이 출처는 허용"이라고 알리고, 위반 시 브라우저가 응답을 JS에 노출하지 않습니다. 따라서 curl이나 백엔드 호출은 CORS와 무관합니다.

Preflight(OPTIONS)는 다음 조건에서 발생합니다.

- `Content-Type`이 `application/json`.
- `Authorization` 같은 사용자 정의 헤더가 있을 때.
- `PUT`, `DELETE` 같은 비단순 메서드.

## 6번. 시크릿 노출 대응 순서

1. **즉시 새 값으로 교체**. JWT_SECRET, DB 비밀번호, API 키, OAuth 클라이언트 시크릿 모두.
2. **기존 토큰 무효화**. 서버 비밀이 바뀌면 기존에 발급된 JWT는 자동으로 검증 실패.
3. **영향 범위 평가**. 푸시 시점부터 발견까지 얼마나 노출됐는지. 외부 침해 흔적이 있는지 로그 확인.
4. **저장소 정리**. `git filter-repo`로 히스토리에서 제거(주의. 협업 중인 브랜치에 영향).
5. **재발 방지**. `.gitignore`에 `.env*` 추가, pre-commit 훅으로 시크릿 패턴 검사(`detect-secrets`, `gitleaks`).

설명. **히스토리에서 지운다고 안전해지지 않습니다**. GitHub fork·검색 인덱스·다운로드된 사본이 어딘가에 남아 있을 수 있으므로, "노출됐다 = 무효화한다"가 원칙입니다.

## 7번. 비밀번호 정책

```js
import bcrypt from "bcrypt";
const COST = 12; // 2026년 기준 권장. 4년 전 권장이 10이었음.
const hash = await bcrypt.hash(password, COST);
```

```js
// 사용자 열거 공격 방어
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    // 같은 응답으로 통일
    return res.status(401).json({ error: "invalid email or password" });
  }
  // ...
});
```

설명.

- bcrypt는 내부적으로 salt를 자동 생성·저장합니다.
- work factor가 높을수록 무차별 대입이 어려워지지만 로그인 응답도 느려집니다. 12 = 약 250ms.
- 같은 비밀번호도 사용자마다 salt가 달라 다른 해시가 나옵니다.
- 로그인 실패 응답을 구분하면 공격자가 어떤 이메일이 가입돼 있는지 알 수 있습니다.

## 8번. 의존성 취약점

```bash
cd 16-security
npm audit --omit=dev
npm audit fix         # 자동으로 가능한 것만 수정
npm audit fix --force # major 버전 업까지 (호환성 깨질 수 있음)
```

CI 워크플로우 추가 예시.

```yaml
- run: npm audit --audit-level=high
  working-directory: 16-security
```

설명. 자동 수정이 항상 안전하지 않습니다. major 버전 업이 호환성을 깨면 테스트가 잡아줘야 합니다(12단계와 연결).

## 9번. OWASP Top 10 한 줄 요약

| 번호 | 항목                                       | 한 줄 요약                                                                       |
| ---- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| A01  | Broken Access Control                      | 인증된 사용자가 자기 권한 밖 자원에 접근할 수 있는 결함.                         |
| A02  | Cryptographic Failures                     | 약한 알고리즘·평문 저장·잘못된 인증서 검증 같은 암호학적 실수.                   |
| A03  | Injection                                  | SQL Injection, NoSQL Injection, 명령어 주입 등 사용자 입력이 구조를 바꾸는 공격. |
| A04  | Insecure Design                            | 코드 버그가 아닌 설계 단계의 보안 결함.                                          |
| A05  | Security Misconfiguration                  | 기본 비밀번호, 노출된 관리 페이지, 부적절한 헤더 같은 설정 오류.                 |
| A06  | Vulnerable and Outdated Components         | 패치되지 않은 라이브러리·프레임워크 사용.                                        |
| A07  | Identification and Authentication Failures | 약한 비밀번호 정책, 세션 관리 결함, 토큰 노출.                                   |
| A08  | Software and Data Integrity Failures       | 무결성 검증 없는 업데이트 채널, CI/CD 파이프라인 조작.                           |
| A09  | Security Logging and Monitoring Failures   | 침해를 알아챌 수 없는 로깅·모니터링 부재.                                        |
| A10  | Server-Side Request Forgery (SSRF)         | 서버가 사용자 입력대로 내부 자원에 요청을 보내는 결함.                           |

## 면접에서 자주 묻는 답 패턴

- "이 코드는 안전한가요?" → 입력 출처와 출력 위치를 분리해 답합니다.
- "내가 직접 막은 보안 이슈가 있나요?" → 한 가지 예시(예. XSS escape, CORS 화이트리스트)를 3문장으로 준비합니다.
- "비밀번호가 평문으로 저장된 코드를 봤습니다. 어떻게 하나요?" → 즉시 해시 도입, 마이그레이션 전략, 사용자 알림 흐름을 답합니다.
