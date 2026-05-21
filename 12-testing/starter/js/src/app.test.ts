// 2번. Express 통합 테스트 빈칸 채우기

import { describe, expect, test, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

describe('Posts API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  test('GET /posts는 빈 배열을 반환한다', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(____);
    expect(res.body).toEqual(____);
  });

  test('POST /posts는 게시글을 생성한다', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 't', content: 'c' });
    // TODO: 생성에 성공한 상태 코드를 작성하세요.
    expect(res.status).toBe(____);
    expect(res.body).toMatchObject({ title: 't', content: 'c' });
  });

  test('POST /posts는 body가 부족하면 400을 반환한다', async () => {
    // TODO: title만 보내 body 일부를 누락시키세요.
    const res = await request(app).post('/posts').send({ ____ });
    expect(res.status).toBe(400);
  });

  test('GET /posts/:id는 없는 id에 404를 반환한다', async () => {
    const res = await request(app).get('/posts/9999');
    expect(res.status).toBe(____);
  });
});
