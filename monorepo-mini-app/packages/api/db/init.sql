-- Note Hub 초기 스키마. docker-compose의 Postgres 컨테이너가 첫 부팅 시 /docker-entrypoint-initdb.d/
-- 에서 자동 실행한다. UUID는 Postgres에서 생성한다.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC);
