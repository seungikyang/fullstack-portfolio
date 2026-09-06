// 비밀번호 해시와 JWT 인증 처리를 담당하는 서버 유틸리티 파일
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 토큰 만료 시간과 알고리즘을 한곳에 두면 발급과 검증 규칙이 어긋나지 않는다.
const TOKEN_EXPIRES_IN = "2h";
const JWT_ALGORITHM = "HS256";
const MIN_PRODUCTION_SECRET_LENGTH = 32;
const EXAMPLE_SECRETS = new Set([
  "career-hub-local-secret",
  "change-this-secret-before-deploy",
  "change-me-in-production"
]);

// 개발에서는 예제 비밀값을 쓸 수 있지만, 운영에서는 assertAuthConfig가 먼저 안전성을 검사한다.
function getSecret() {
  assertAuthConfig();
  return process.env.JWT_SECRET?.trim() || "career-hub-local-secret";
}

// 배포 환경에서 짧거나 문서에 공개된 예제 비밀값을 실수로 쓰지 못하게 서버 시작을 막는다.
export function assertAuthConfig() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secret = process.env.JWT_SECRET?.trim() || "";

  if (secret.length < MIN_PRODUCTION_SECRET_LENGTH || EXAMPLE_SECRETS.has(secret)) {
    throw new Error("운영 환경에는 32자 이상의 안전한 JWT_SECRET이 필요합니다.");
  }
}

// 평문 비밀번호 대신 bcrypt 해시만 저장한다. 숫자 10은 계산 비용(work factor)이다.
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// 로그인 입력을 다시 해시해 저장된 값과 안전하게 비교한다.
export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// 로그인 성공 시 사용자 식별 정보를 담은 2시간짜리 JWT를 발급한다.
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

// 보호 API 앞에 붙는 Express 미들웨어. Bearer 토큰이 유효할 때만 다음 핸들러로 넘긴다.
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  // Authorization: Bearer <token> 형식에서 실제 토큰 부분만 잘라낸다.
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    // 허용 알고리즘을 HS256으로 제한해 다른 방식으로 만든 토큰을 받지 않는다.
    const payload = jwt.verify(token, getSecret(), { algorithms: [JWT_ALGORITHM] });
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    return next(); // req.user를 뒤의 API 핸들러가 사용할 수 있게 한 뒤 계속 진행한다.
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}
