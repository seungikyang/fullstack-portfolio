// 노트 저장소의 공통 인터페이스와 인메모리 구현, 그리고 입력 검증 함수.
// 인터페이스를 분리해 두면 Postgres 등 다른 백엔드를 같은 시그니처로 갈아 끼울 수 있다(notes-store-pg.ts 참고).
import { randomUUID } from "node:crypto";
import { normalizeTags, NoteLimits, type CreateNoteInput, type Note } from "@note-hub/shared";

export interface NotesStore {
  // 두 저장소 구현이 반드시 지켜야 할 비동기 CRUD 계약이다.
  list(): Promise<Note[]>;
  create(input: CreateNoteInput): Promise<Note>;
  delete(id: string): Promise<boolean>;
  /** 테스트와 헬스체크용. */
  ping?(): Promise<boolean>;
}

export class InMemoryNotesStore implements NotesStore {
  // 메모리 배열은 서버를 재시작하면 사라지므로 로컬 학습·테스트용이다.
  private notes: Note[] = [];

  async list(): Promise<Note[]> {
    // 복사본을 정렬해 저장소 안의 원본 배열 순서를 바꾸지 않는다.
    return [...this.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(input: CreateNoteInput): Promise<Note> {
    // id와 생성 시각은 클라이언트 입력이 아니라 서버가 책임지고 만든다.
    const note: Note = {
      id: randomUUID(),
      title: input.title.trim(),
      body: input.body.trim(),
      tags: normalizeTags(input.tags),
      createdAt: new Date().toISOString()
    };
    this.notes.push(note);
    return note;
  }

  async delete(id: string): Promise<boolean> {
    // 삭제 전후 길이가 달라졌다면 해당 id가 실제로 존재했다는 뜻이다.
    const before = this.notes.length;
    this.notes = this.notes.filter((note) => note.id !== id);
    return this.notes.length !== before;
  }

  async ping(): Promise<boolean> {
    // 외부 연결이 없는 메모리 저장소는 서버가 살아 있으면 항상 준비된 상태다.
    return true;
  }
}

// unknown 요청 본문을 신뢰하지 않고 저장 가능한 CreateNoteInput으로 좁힌다.
export function validateCreate(payload: unknown): { value: CreateNoteInput; errors: string[] } {
  const errors: string[] = [];
  const obj = (payload ?? {}) as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  const body = typeof obj.body === "string" ? obj.body.trim() : "";
  const tagsRaw = obj.tags;

  if (!title) errors.push("title is required");
  if (!body) errors.push("body is required");
  if (title.length > NoteLimits.title) {
    errors.push(`title must be ${NoteLimits.title} characters or fewer`);
  }
  if (body.length > NoteLimits.body) {
    errors.push(`body must be ${NoteLimits.body} characters or fewer`);
  }

  // tags는 선택 항목이지만 전달됐다면 문자열 배열·개수·항목 길이를 모두 검사한다.
  let tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    if (tagsRaw.length > NoteLimits.tags) {
      errors.push(`tags must contain ${NoteLimits.tags} items or fewer`);
    }
    if (tagsRaw.some((tag) => typeof tag !== "string")) {
      errors.push("tags must contain only strings");
    } else {
      tags = normalizeTags(tagsRaw);
      if (tags.some((tag) => tag.length > NoteLimits.tag)) {
        errors.push(`each tag must be ${NoteLimits.tag} characters or fewer`);
      }
    }
  } else if (tagsRaw !== undefined) {
    errors.push("tags must be an array");
  }

  return { value: { title, body, tags }, errors };
}
