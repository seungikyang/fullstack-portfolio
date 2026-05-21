// 실제 이메일 전송은 외부 시스템에 의존하므로 테스트에서는 모킹합니다.

export async function sendMail(to: string, subject: string, body: string): Promise<void> {
  console.log(`[mailer] to=${to} subject=${subject}`);
  // 실제 구현에서는 SMTP나 메일 서비스 API를 호출합니다.
}
