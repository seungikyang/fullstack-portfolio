// 로그인 실습에서 사용할 임시 사용자 저장소 파일
export const users = [];

export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

