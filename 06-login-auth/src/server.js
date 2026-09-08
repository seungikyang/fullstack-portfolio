// 문제 순서: 1. 회원가입 → auth.js의 2. 토큰·3. 헤더 → 4. 로그인 → 5. 보호 API
import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { requireAuth, signToken } from "./auth.js";
import { findUserByEmail, users } from "./users.js";

const app = express();
const PORT = process.env.PORT || 4200;

// 인증 라우트가 JSON으로 보낸 가입·로그인 정보를 읽기 전에 공통 미들웨어를 거칩니다.
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "login-auth" });
});

// 문제 1. 회원가입은 입력 확인 → 중복 확인 → 비밀번호 해시 → 사용자 저장 순서입니다.
app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호가 필요합니다." });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: "이미 가입된 이메일입니다." });
  }

  // 해시는 비밀번호를 원문으로 되돌릴 수 없는 값으로 바꾸는 작업입니다.
  // bcrypt의 두 번째 숫자는 해시 계산을 얼마나 반복할지 정하는 비용 값입니다.
  const passwordHash = await bcrypt.hash("____", 10); // 빈칸 1. 사용자가 입력한 password를 넣으세요.
  const user = {
    id: randomUUID(),
    email,
    name: name || "____", // 빈칸 2. 이름이 없을 때 사용할 기본 이름을 넣으세요.
    passwordHash
  };

  users.push(user);

  // 응답에는 공개해도 되는 사용자 정보만 담고 비밀번호 해시는 제외합니다.
  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

// 문제 4. 로그인은 저장된 사용자를 찾고 비밀번호를 검증한 뒤에만 JWT를 발급합니다.
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  // 사용자가 입력한 원문과 저장된 해시가 같은 비밀번호에서 나온 것인지 확인하는 단계입니다.
  const isPasswordValid = false; // 빈칸 5. bcrypt.compare로 비밀번호를 검증하세요.

  if (!isPasswordValid) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  // 비밀번호 검증을 통과한 뒤 문제 2에서 확인한 signToken으로 JWT를 만듭니다.
  const token = signToken(user);

  // 이후 클라이언트는 이 토큰을 보호된 API 요청의 인증 정보로 보냅니다.
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// 문제 5. 보호된 API는 requireAuth가 JWT를 확인한 뒤에만 실제 응답 함수를 실행합니다.
app.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "보호된 API에 접근했습니다.",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`로그인 실습 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
