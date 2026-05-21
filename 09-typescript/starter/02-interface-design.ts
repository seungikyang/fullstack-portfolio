// 사용자 도메인 모델에 인터페이스와 유니온 리터럴을 적용하는 연습 파일

// TODO: 'admin' 또는 'user' 만 허용하는 유니온 리터럴 타입을 정의하세요.
export type Role = ____;

// TODO: User 인터페이스를 만들고 id, email, name, role 필드를 추가하세요.
export interface User {
  id: ____;
  email: ____;
  name: ____;
  role: ____;
}

// TODO: 반환 타입을 User로 명시하세요.
export function createUser(email: string, name: string): ____ {
  return {
    id: crypto.randomUUID(),
    email,
    name,
    role: 'user',
  };
}
