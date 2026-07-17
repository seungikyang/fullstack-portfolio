// 비밀번호 해시와 JWT 인증 처리를 담당하는 서버 유틸리티 파일
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_EXPIRES_IN = "2h";
const JWT_ALGORITHM = "HS256";
const MIN_PRODUCTION_SECRET_LENGTH = 32;
const EXAMPLE_SECRETS = new Set([
  "career-hub-local-secret",
  "change-this-secret-before-deploy",
  "change-me-in-production"
]);

function getSecret() {
  assertAuthConfig();
  return process.env.JWT_SECRET?.trim() || "career-hub-local-secret";
}

export function assertAuthConfig() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secret = process.env.JWT_SECRET?.trim() || "";

  if (secret.length < MIN_PRODUCTION_SECRET_LENGTH || EXAMPLE_SECRETS.has(secret)) {
    throw new Error("운영 환경에는 32자 이상의 안전한 JWT_SECRET이 필요합니다.");
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name
    },
    getSecret(),
    { algorithm: JWT_ALGORITHM, expiresIn: TOKEN_EXPIRES_IN }
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    const payload = jwt.verify(token, getSecret(), { algorithms: [JWT_ALGORITHM] });
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    return next();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}
