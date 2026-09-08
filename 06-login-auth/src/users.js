// server.js의 회원가입과 로그인에서 함께 사용하는 임시 사용자 저장소 파일
// 메모리 배열이므로 서버를 다시 시작하면 가입한 사용자도 사라집니다.
export const users = [];

export function findUserByEmail(email) {
  // 가입 중복 확인과 로그인에서 같은 사용자 검색 규칙을 함께 사용합니다.
  return users.find((user) => user.email === email);
}
