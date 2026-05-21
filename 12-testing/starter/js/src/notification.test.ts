// 3번. mailer 모킹 빈칸 채우기

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { notifyUser } from './notification';
import * as mailer from './mailer';

describe('notifyUser', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('mailer를 올바른 인자로 호출한다', async () => {
    // TODO: mailer.sendMail을 spyOn으로 가짜 대체하고 resolvedValue로 undefined를 돌려주게 만드세요.
    const spy = vi.____(mailer, 'sendMail').mockResolvedValue(undefined);

    await notifyUser({ email: 'a@b.c', name: '홍길동' });

    // TODO: spy가 (이메일, 이름이 들어간 제목, 임의 문자열)로 호출되었는지 검증하세요.
    expect(spy).toHaveBeenCalledWith(
      '____',
      expect.stringContaining('____'),
      expect.any(String),
    );
  });
});
