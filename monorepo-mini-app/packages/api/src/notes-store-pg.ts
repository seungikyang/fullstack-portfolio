// PostgreSQL 기반 NotesStore 구현. InMemoryNotesStore와 동일한 인터페이스라 server.ts에서
// DATABASE_URL 유무로 두 구현을 갈아 끼울 수 있다. 실제 DB 클라이언트는 node-postgres(pg)를 사용.
import pg from "pg";
import type { CreateNoteInput, Note } from "@note-hub/shared";
import type { NotesStore } from "./notes-store.js";

export class PostgresNotesStore implements NotesStore {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString, max: 10 });
  }

  async ping(): Promise<boolean> {
    const res = await this.pool.query("SELECT 1 AS ok");
    return res.rows[0]?.ok === 1;
  }

  async list(): Promise<Note[]> {
    const { rows } = await this.pool.query<{
      id: string;
      title: string;
      body: string;
      tags: string[];
      created_at: Date;
    }>(`SELECT id, title, body, tags, created_at FROM notes ORDER BY created_at DESC`);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags ?? [],
      createdAt: row.created_at.toISOString()
    }));
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const tags = (input.tags ?? []).map((t) => t.trim()).filter(Boolean);
    const { rows } = await this.pool.query<{
      id: string;
      title: string;
      body: string;
      tags: string[];
      created_at: Date;
    }>(
      `INSERT INTO notes (title, body, tags)
       VALUES ($1, $2, $3)
       RETURNING id, title, body, tags, created_at`,
      [input.title.trim(), input.body.trim(), tags]
    );
    const row = rows[0];
    if (!row) {
      throw new Error("INSERT returned no row");
    }
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags ?? [],
      createdAt: row.created_at.toISOString()
    };
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(`DELETE FROM notes WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
