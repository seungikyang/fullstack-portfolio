// 노트 저장소의 공통 인터페이스와 인메모리 구현, 그리고 입력 검증 함수.
// 인터페이스를 분리해 두면 Postgres 등 다른 백엔드를 같은 시그니처로 갈아 끼울 수 있다(notes-store-pg.ts 참고).
import { randomUUID } from "node:crypto";
import { NoteLimits, type CreateNoteInput, type Note } from "@note-hub/shared";

export interface NotesStore {
  list(): Promise<Note[]>;
  create(input: CreateNoteInput): Promise<Note>;
  delete(id: string): Promise<boolean>;
  /** 테스트와 헬스체크용. */
  ping?(): Promise<boolean>;
}

export class InMemoryNotesStore implements NotesStore {
  private notes: Note[] = [];

  async list(): Promise<Note[]> {
    return [...this.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const note: Note = {
      id: randomUUID(),
      title: input.title.trim(),
      body: input.body.trim(),
      tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };
    this.notes.push(note);
    return note;
  }

  async delete(id: string): Promise<boolean> {
    const before = this.notes.length;
    this.notes = this.notes.filter((note) => note.id !== id);
    return this.notes.length !== before;
  }

  async ping(): Promise<boolean> {
    return true;
  }
}

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

  let tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    if (tagsRaw.length > NoteLimits.tags) {
      errors.push(`tags must contain ${NoteLimits.tags} items or fewer`);
    }
    if (tagsRaw.some((tag) => typeof tag !== "string")) {
      errors.push("tags must contain only strings");
    } else {
      tags = tagsRaw.map((tag) => tag.trim()).filter(Boolean);
      if (tags.some((tag) => tag.length > NoteLimits.tag)) {
        errors.push(`each tag must be ${NoteLimits.tag} characters or fewer`);
      }
    }
  } else if (tagsRaw !== undefined) {
    errors.push("tags must be an array");
  }

  return { value: { title, body, tags }, errors };
}
