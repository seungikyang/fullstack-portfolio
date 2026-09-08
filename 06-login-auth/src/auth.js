// 문제 2~3에서 읽을 파일: JWT 발급 → Authorization 헤더와 JWT 검증
import jwt from "jsonwebtoken";

function getJwtSecret() {
  // 기본값은 로컬 실습용이며, 배포 환경에서는 외부에 노출되지 않는 환경 변수를 사용해야 합니다.
  return process.env.JWT_SECRET || "local-dev-secret";
}

export function signToken(user) {
  // 문제 2. 로그인 성공 뒤 사용할 JWT에 최소 사용자 식별 정보를 담습니다.
  // JWT 내용은 암호화되지 않으므로 비밀번호 같은 비밀값을 넣으면 안 됩니다.
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
  // 문제 3. 보호된 API에 들어가기 전에 Authorization 헤더에서 실제 토큰을 분리합니다.
  const authHeader = req.headers.authorization;
  const token = ""; // 빈칸 4. authHeader에서 Bearer 접두사를 제거하세요.

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    // 서명과 만료 시간을 모두 통과한 토큰만 신뢰하고, 다음 라우트가 사용할 정보를 요청에 붙입니다.
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch (error) {
    // 변조되었거나 만료된 토큰은 모두 인증 실패로 처리합니다.
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}
