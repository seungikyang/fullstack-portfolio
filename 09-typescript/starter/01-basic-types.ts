// 기본 타입을 함수에 입혀 컴파일 시점에 오류를 잡는 연습 파일

// TODO: a, b, 반환 타입을 number로 명시하세요.
export function add(a: ____, b: ____): ____ {
  return a + b;
}

// TODO: suffix를 옵셔널 string으로 만들고 반환을 string으로 명시하세요.
export function greet(name: ____, suffix?: ____): ____ {
  return suffix ? `${name} ${suffix}` : name;
}

// TODO: 제네릭 T를 받아 첫 요소를 안전하게 반환하도록 만드세요.
export function head<____>(items: ____[]): ____ | undefined {
  return items[0];
}
