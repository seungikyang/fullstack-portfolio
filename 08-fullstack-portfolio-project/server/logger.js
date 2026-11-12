// 서버의 활동 일지를 만드는 파일이다. logger로 언제 어떤 요청이나 오류가 있었는지 기록한다.
// pino는 기록을 JSON(이름과 값을 짝지은 자료)으로 남겨주는 도구다.
import pino from "pino";

// NODE_ENV는 실행 방식 설정이다. test이면 자동 검사 중이므로 기록 출력을 줄인다.
const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  // silent는 기록을 출력하지 않고, info는 일반 활동과 경고·오류를 출력한다.
  level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
  // 아래 항목이 일지에 들어오면 비밀번호와 확인표 대신 [REDACTED]를 적는다.
  // 로그에 적용하는 규칙이며, 사용자에게 보내는 답의 내용을 바꾸는 설정은 아니다.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "res.body.token"
    ],
    censor: "[REDACTED]"
  },
  base: { service: "career-hub" }, // 모든 로그에 서비스 이름을 공통으로 붙인다.
  timestamp: pino.stdTimeFunctions.isoTime // 날짜와 시간대를 일정한 글자 형식으로 기록한다.
});
