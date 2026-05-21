// 1번. calculator 단위 테스트 빈칸 채우기

import { describe, expect, test } from 'vitest';
import { add, subtract, divide } from './calculator';

describe('calculator', () => {
  test('add는 두 수의 합을 반환한다', () => {
    // TODO: add(2, 3)이 5인지 검증하세요.
    expect(____).toBe(____);
  });

  test('subtract는 두 수의 차이를 반환한다', () => {
    expect(subtract(5, 2)).toBe(____);
  });

  test('add는 음수를 처리한다', () => {
    expect(add(-1, -2)).toBe(____);
  });

  test('divide는 부동소수점을 처리한다', () => {
    // TODO: 1 / 3은 정확히 표현되지 않습니다. toBeCloseTo를 쓰세요.
    expect(divide(1, 3)).____(0.333, 3);
  });

  test('divide는 0으로 나눌 때 예외를 던진다', () => {
    // TODO: () => divide(1, 0)을 toThrow로 검증하세요.
    expect(() => ____).toThrow('cannot divide by zero');
  });
});
