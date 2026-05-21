// 유니온 타입을 가드로 좁히는 연습 파일

// TODO: string, number, Date 입력을 받아 항상 string으로 변환하세요.
export function formatValue(value: ____): string {
  if (typeof value === '____') {
    return value;
  }
  if (typeof value === '____') {
    return value.toFixed(2);
  }
  if (value instanceof ____) {
    return value.toISOString();
  }
  // TODO: 모든 분기를 처리했음을 컴파일러가 검사하도록 never 변수에 할당하세요.
  const _exhaustive: ____ = value;
  return _exhaustive;
}
