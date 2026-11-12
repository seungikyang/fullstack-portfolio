// 회원가입 때 비밀번호를 처리하고, 로그인 뒤에는 확인표(JWT)를 검사하는 파일이다.
// 흐름: 비밀번호를 해시로 저장 → 로그인 때 비교 → 확인표 발급 → 다음 요청마다 확인표 검사.
// 해시는 비밀번호를 원문으로 되돌리도록 만든 값이 아니다. JWT 내용은 암호문이 아니므로 비밀번호를 넣지 않는다.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 확인표는 2시간 뒤 만료된다. HS256은 확인표에 서명을 만들고 검사할 때 사용하는 방식의 이름이다.
const TOKEN_EXPIRES_IN = "2h";
const JWT_ALGORITHM = "HS256";
const MIN_PRODUCTION_SECRET_LENGTH = 32;
const EXAMPLE_SECRETS = new Set([
  "career-hub-local-secret",
  "change-this-secret-before-deploy",
  "change-me-in-production"
]);

// JWT_SECRET은 서버만 알아야 하는 서명용 비밀값이다. 공개 서비스에서는 아래 검사를 먼저 통과해야 한다.
function getSecret() {
  assertAuthConfig();
  return process.env.JWT_SECRET?.trim() || "career-hub-local-secret";
}

// production은 실제 서비스로 실행하는 설정이다. 비밀값이 너무 짧거나 공개된 예제 값이면 시작을 멈춘다.
export function assertAuthConfig() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secret = process.env.JWT_SECRET?.trim() || "";

  if (secret.length < MIN_PRODUCTION_SECRET_LENGTH || EXAMPLE_SECRETS.has(secret)) {
    throw new Error("운영 환경에는 32자 이상의 안전한 JWT_SECRET이 필요합니다.");
  }
}

// 비밀번호 글자 그대로 저장하는 대신 bcrypt가 계산한 해시를 저장한다.
// 숫자 10은 계산에 들이는 작업량 설정이다. 계산을 반복해 많은 비밀번호를 빠르게 추측하기 어렵게 한다.
export async function hashPassword(password) {
  if (bcrypt.truncates(password)) {
    throw new Error("비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.");
  }
  return bcrypt.hash(password, 10);
}

// 사용자가 입력한 비밀번호가 저장한 해시에 맞는지 bcrypt가 검사한다. 맞으면 true를 돌려준다.
export async function verifyPassword(password, passwordHash) {
  if (bcrypt.truncates(password)) return false;
  return bcrypt.compare(password, passwordHash);
}

// 로그인에 성공하면 사용자 번호와 유효 기간이 든 확인표를 만든다.
// sub는 '이 확인표의 주인'을 뜻하는 항목이며 사용자 id(번호)를 넣는다.
// 서명은 서버가 만든 확인표인지, 내용이 바뀌지 않았는지를 검사하는 데 쓰인다.
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

// 미들웨어는 본격적인 요청 처리 전에 거치는 검사 단계다. 여기서는 로그인 확인표를 검사한다.
// req는 받은 요청, res는 보낼 답, next는 다음 처리 단계로 넘어가는 함수다.
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  // 화면이 'Authorization: Bearer 확인표내용'으로 보낸 정보에서 확인표 부분만 꺼낸다.
  // 인증 방식 이름은 대소문자를 구분하지 않으므로(HTTP 규칙) 'bearer'로 보내도 받는다.
  const token = /^Bearer /i.test(authHeader) ? authHeader.slice("Bearer ".length) : "";

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    // 서명과 만료 시간을 검사하며, 서버에서 정한 HS256 방식으로 만든 확인표만 받는다.
    const payload = jwt.verify(token, getSecret(), { algorithms: [JWT_ALGORITHM] });
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    return next(); // 확인한 사용자 번호를 기억해두었으므로 다음 요청 처리로 넘어간다.
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}
