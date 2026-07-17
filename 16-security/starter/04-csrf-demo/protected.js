// CSRF 취약 경로와 수동 토큰 방어 경로를 비교하는 실습 서버

import cookieParser from "cookie-parser";
import crypto from "node:crypto";
import express from "express";

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const sessionCookieName = "session";
const csrfCookieName = "csrfToken";
const sameSitePractice = "____";

function requireSession(req, res, next) {
  if (!req.cookies[sessionCookieName]) {
    return res
      .status(401)
      .json({ message: "먼저 POST /login으로 로그인하세요." });
  }

  return next();
}

function tokensMatch(expected, actual) {
  const expectedBuffer = Buffer.from(String(expected || ""));
  const actualBuffer = Buffer.from(String(actual || ""));

  return (
    expectedBuffer.length > 0 &&
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

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
    return res
      .status(403)
      .json({ message: "CSRF 토큰이 없거나 올바르지 않습니다." });
  }

  return next();
}

// TODO: sameSitePractice의 ____를 'lax' 또는 'strict'로 바꾸고 공격 요청 차이를 관찰하세요.
app.post("/login", (_req, res) => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const cookieOptions = {
    httpOnly: true,
    secure: false, // 학습용. 운영에서는 반드시 true.
  };

  if (sameSitePractice === "lax" || sameSitePractice === "strict") {
    cookieOptions.sameSite = sameSitePractice;
  }

  res.cookie(sessionCookieName, sessionId, cookieOptions);
  res.json({ ok: true });
});

// vulnerable.html이 호출하는 취약 경로. 세션만 확인하고 CSRF 토큰은 확인하지 않습니다.
app.post("/api/transfer", requireSession, (req, res) => {
  res.json({
    ok: true,
    protected: false,
    to: req.body.to,
    amount: req.body.amount,
  });
});

// 수동 검증용 토큰 발급 경로. 응답 token과 Set-Cookie를 함께 보관해 /transfer에 보냅니다.
app.get("/api/csrf-token", requireSession, (req, res) => {
  res.json({ token: issueCsrfToken(req, res) });
});

app.get("/form", requireSession, (req, res) => {
  const token = issueCsrfToken(req, res);
  res.send(`
    <p>이번 요청에서 발급된 토큰: <code>${token}</code></p>
    <form action="/transfer" method="POST">
      <!-- TODO: /api/csrf-token에서 발급한 값을 아래 ____에 연결하세요. -->
      <input type="hidden" name="_csrf" value="____" />
      <input name="to" />
      <input name="amount" />
      <button>송금</button>
    </form>
  `);
});

app.post("/transfer", requireSession, verifyCsrfToken, (req, res) => {
  res.json({
    ok: true,
    protected: true,
    to: req.body.to,
    amount: req.body.amount,
  });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`CSRF 실습 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
