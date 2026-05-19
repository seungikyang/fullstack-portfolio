// 회원가입과 로그인을 처리하는 Express 인증 서버 파일
import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { requireAuth, signToken } from "./auth.js";
import { findUserByEmail, users } from "./users.js";

const app = express();
const PORT = process.env.PORT || 4200;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "login-auth" });
});

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호가 필요합니다." });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: "이미 가입된 이메일입니다." });
  }

  const passwordHash = await bcrypt.hash("____", 10); // 빈칸 1. 사용자가 입력한 password를 넣으세요.
  const user = {
    id: randomUUID(),
    email,
    name: name || "____", // 빈칸 2. 이름이 없을 때 사용할 기본 이름을 넣으세요.
    passwordHash
  };

  users.push(user);

  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const isPasswordValid = false; // 빈칸 5. bcrypt.compare로 비밀번호를 검증하세요.

  if (!isPasswordValid) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

app.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "보호된 API에 접근했습니다.",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`로그인 실습 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

