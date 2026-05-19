// JWT 발급과 인증 미들웨어를 담당하는 파일
import jwt from "jsonwebtoken";

function getJwtSecret() {
  return process.env.JWT_SECRET || "local-dev-secret";
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: "____" // 빈칸 3. user.email을 넣으세요.
    },
    getJwtSecret(),
    { expiresIn: "1h" }
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = ""; // 빈칸 4. authHeader에서 Bearer 접두사를 제거하세요.

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch (error) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}

