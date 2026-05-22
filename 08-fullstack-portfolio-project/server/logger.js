// 구조적(JSON) 로깅 모듈. pino를 직접 만들어 두면 테스트에서 silent 로거로 바꿔치우기 쉽다.
// 운영에서는 pino의 JSON 로그를 Loki/CloudWatch 같은 수집기로 보내는 것이 일반적이다.
import pino from "pino";

const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  // 테스트에서는 로그가 시끄러우므로 silent. 운영/개발에서는 info.
  level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
  // 응답 본문에 비밀 토큰/비밀번호가 새는 사고를 막기 위한 자동 마스킹.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'req.body.password',
      'res.body.token'
    ],
    censor: "[REDACTED]"
  },
  base: { service: "career-hub" },
  timestamp: pino.stdTimeFunctions.isoTime
});
