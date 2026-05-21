// 3번 문제의 모킹 대상. notifyUser는 sendMail에 의존합니다.

import { sendMail } from './mailer';

export interface UserSummary {
  email: string;
  name: string;
}

export async function notifyUser(user: UserSummary): Promise<void> {
  const subject = `${user.name} 님께 알림`;
  const body = `안녕하세요 ${user.name} 님.`;
  await sendMail(user.email, subject, body);
}
