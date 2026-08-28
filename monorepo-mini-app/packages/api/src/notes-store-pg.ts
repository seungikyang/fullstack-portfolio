// PostgreSQL 기반 NotesStore 구현. InMemoryNotesStore와 동일한 인터페이스라 server.ts에서
// DATABASE_URL 유무로 두 구현을 갈아 끼울 수 있다. 실제 DB 클라이언트는 node-postgres(pg)를 사용.
import pg from "pg";
import { normalizeTags, type CreateNoteInput, type Note } from "@note-hub/shared";
import type { NotesStore } from "./notes-store.js";

// 첫 요청 전에 테이블·인덱스가 없으면 만드는 멱등성 SQL이다(여러 번 실행해도 안전하다).
const POSTGRES_SCHEMA_SQL = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC);
`;

// PostgreSQL의 snake_case 행 모양을 TypeScript로 표현한 내부 전용 타입이다.
type PostgresNoteRow = {
  id: string;
  title: string;
  body: string;
  tags: string[] | null;
  created_at: Date;
};

// DB 행을 API/Web이 공유하는 camelCase Note 타입으로 변환한다.
function toNote(row: PostgresNoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    createdAt: row.created_at.toISOString()
  };
}

export class PostgresNotesStore implements NotesStore {
  // Pick을 사용하면 실제 Pool과 query/end만 가진 가짜 테스트 Pool을 모두 받을 수 있다.
  private pool: Pick<pg.Pool, "query" | "end">;
  // 동시에 여러 요청이 와도 스키마 생성 Promise 하나만 공유한다.
  private schemaReady?: Promise<void>;

  constructor(connectionString: string, pool?: Pick<pg.Pool, "query" | "end">) {
    this.pool = pool ?? new pg.Pool({ connectionString, max: 10 });
  }

  // ??=는 아직 준비를 시작하지 않았을 때만 오른쪽 쿼리를 실행한다.
  private ensureSchema(): Promise<void> {
    this.schemaReady ??= this.pool.query(POSTGRES_SCHEMA_SQL).then(() => undefined);
    return this.schemaReady;
  }

  // health API가 DB 연결 가능 여부를 확인할 때 사용하는 가장 작은 쿼리다.
  async ping(): Promise<boolean> {
    await this.ensureSchema();
    const res = await this.pool.query("SELECT 1 AS ok");
    return res.rows[0]?.ok === 1;
  }

  // 최신 노트부터 읽고 각 DB 행을 공통 Note 타입으로 바꾼다.
  async list(): Promise<Note[]> {
    await this.ensureSchema();
    const { rows } = await this.pool.query<PostgresNoteRow>(
      `SELECT id, title, body, tags, created_at FROM notes ORDER BY created_at DESC`
    );

    return rows.map(toNote);
  }

  // $1, $2, $3 자리표시자와 값 배열을 분리해 SQL Injection을 막는다.
  async create(input: CreateNoteInput): Promise<Note> {
    await this.ensureSchema();
    const tags = normalizeTags(input.tags);
    const { rows } = await this.pool.query<PostgresNoteRow>(
      `INSERT INTO notes (title, body, tags)
       VALUES ($1, $2, $3)
       RETURNING id, title, body, tags, created_at`,
      [input.title.trim(), input.body.trim(), tags]
    );
    const row = rows[0];
    if (!row) {
      throw new Error("INSERT returned no row");
    }
    return toNote(row);
  }

  // 삭제된 행 개수로 존재했던 노트인지 boolean 결과를 만든다.
  async delete(id: string): Promise<boolean> {
    await this.ensureSchema();
    const { rowCount } = await this.pool.query(`DELETE FROM notes WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  }

  // 테스트나 서버 종료 때 Pool이 가진 DB 연결을 정리한다.
  async close(): Promise<void> {
    await this.pool.end();
  }
}
