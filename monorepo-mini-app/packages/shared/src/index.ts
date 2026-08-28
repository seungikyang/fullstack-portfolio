// API와 Web이 공유하는 도메인 타입과 API 계약 정의.
// 이 파일이 모노레포의 가장 큰 장점이다: 백엔드가 응답 형태를 바꾸면 프론트엔드 컴파일이
// 즉시 실패하므로 "JSON 모양이 어긋나 화면이 빈다" 같은 런타임 버그를 컴파일 시점에 잡는다.

// 서버가 반환하고 Web이 렌더링하는 완성된 노트의 공통 모양이다.
export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

// 생성 요청에는 서버가 만드는 id·createdAt이 아직 없다.
export interface CreateNoteInput {
  title: string;
  body: string;
  tags?: string[];
}

// 모든 API 오류 응답이 공유하는 기본 모양이다.
export interface ApiError {
  message: string;
  errors?: string[];
}

// 프론트 maxLength와 서버 검증이 같은 제한 숫자를 사용한다.
export const NoteLimits = {
  title: 120,
  body: 10_000,
  tags: 20,
  tag: 50
} as const;

// API 경로를 한 곳에서 정의해 양쪽이 같은 문자열을 본다.
export const ApiRoutes = {
  health: "/api/health",
  openapi: "/api/openapi.json",
  notes: "/api/notes",
  noteById: (id: string) => `/api/notes/${id}`
} as const;

export function normalizeTags(tags: readonly string[] = []): string[] {
  // 원본 readonly 배열은 바꾸지 않고 공백·빈 항목을 제거한 새 배열을 반환한다.
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

// 타입 가드. fetch 응답이 Note인지 런타임에 확인할 때 사용.
export function isNote(value: unknown): value is Note {
  // TypeScript 타입은 실행 중 사라지므로 fetch로 받은 JSON은 필드를 직접 검사해야 한다.
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.body === "string" &&
    Array.isArray(v.tags) &&
    typeof v.createdAt === "string"
  );
}
