// 노트 저장소의 공통 인터페이스와 인메모리 구현, 그리고 입력 검증 함수.
// 인터페이스를 분리해 두면 Postgres 등 다른 백엔드를 같은 시그니처로 갈아 끼울 수 있다(notes-store-pg.ts 참고).
import { randomUUID } from "node:crypto";
import type { CreateNoteInput, Note } from "@note-hub/shared";

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

  let tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    tags = tagsRaw.filter((t): t is string => typeof t === "string");
  } else if (typeof tagsRaw === "string") {
    tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return { value: { title, body, tags }, errors };
}
