// 제네릭으로 fetch 응답 타입을 호출자가 지정하게 하는 연습 파일

// TODO: 제네릭 T를 받아 Promise<T>를 반환하도록 시그니처를 채우세요.
export async function fetchJson<____>(url: string): Promise<____> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ____;
}

// 사용 예시
interface User {
  id: string;
  name: string;
}

// TODO: 위 fetchJson을 호출하면서 User 타입을 지정하세요.
async function loadMe() {
  const me = await fetchJson<____>('/api/me');
  console.log(me.name);
}
