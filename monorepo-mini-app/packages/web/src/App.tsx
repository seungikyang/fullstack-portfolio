// Note Hub 메인 화면. 모노레포의 핵심 장점을 보여주기 위해 백엔드와 같은 타입(Note, CreateNoteInput)을
// @note-hub/shared에서 import해서 사용한다. 백엔드 응답 타입이 바뀌면 여기서 컴파일 에러가 난다.
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ApiRoutes,
  isNote,
  normalizeTags,
  NoteLimits,
  type CreateNoteInput,
  type Note
} from "@note-hub/shared";

const emptyInput: CreateNoteInput = { title: "", body: "", tags: [] };
const accessTokenSessionKey = "noteHubAccessToken";

function accessHeaders(accessToken: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export default function App() {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem(accessTokenSessionKey) ?? ""
  );
  const [tokenInput, setTokenInput] = useState(accessToken);
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState<CreateNoteInput>(emptyInput);
  const [tagsText, setTagsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadNotes = useCallback(async (token: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ApiRoutes.notes, { headers: accessHeaders(token) });
      if (!res.ok) throw new Error(`목록 조회 실패 (${res.status})`);
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data) || !data.every(isNote)) {
        throw new Error("응답 형식이 Note[]가 아닙니다");
      }
      setNotes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes(accessToken);
  }, [accessToken, loadNotes]);

  function handleConnect(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextToken = tokenInput.trim();
    sessionStorage.setItem(accessTokenSessionKey, nextToken);
    if (nextToken === accessToken) {
      void loadNotes(nextToken);
      return;
    }
    setAccessToken(nextToken);
  }

  function handleDisconnect(): void {
    sessionStorage.removeItem(accessTokenSessionKey);
    setTokenInput("");
    setAccessToken("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    const payload: CreateNoteInput = {
      title: input.title,
      body: input.body,
      tags: normalizeTags(tagsText.split(","))
    };
    try {
      const res = await fetch(ApiRoutes.notes, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...accessHeaders(accessToken) },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setError(body.message ?? `생성 실패 (${res.status})`);
        return;
      }
      setInput(emptyInput);
      setTagsText("");
      await loadNotes(accessToken);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      const res = await fetch(ApiRoutes.noteById(id), {
        method: "DELETE",
        headers: accessHeaders(accessToken)
      });
      if (!res.ok) {
        setError(`삭제 실패 (${res.status})`);
        return;
      }
      await loadNotes(accessToken);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    }
  }

  return (
    <main className="page">
      <header>
        <h1>Note Hub</h1>
        <p className="subtitle">
          npm workspaces + TypeScript 모노레포 데모. 프론트엔드와 백엔드가 같은{" "}
          <code>@note-hub/shared</code> 패키지의 타입을 공유합니다.
        </p>
      </header>

      <section className="card">
        <h2>API 접근 토큰</h2>
        <form onSubmit={handleConnect} className="form token-form">
          <label>
            <span>접근 토큰</span>
            <input
              aria-describedby="token-help"
              autoComplete="off"
              required
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button type="submit">연결</button>
            {accessToken && (
              <button className="secondary-button" type="button" onClick={handleDisconnect}>
                연결 해제
              </button>
            )}
          </div>
        </form>
        <p className="hint" id="token-help">
          운영 API 토큰은 현재 브라우저 탭의 sessionStorage에만 보관됩니다. 로컬 무토큰 학습은 입력
          없이 바로 사용할 수 있습니다.
        </p>
      </section>

      <section className="card">
        <h2>새 노트</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>제목</span>
            <input
              maxLength={NoteLimits.title}
              required
              value={input.title}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
            />
          </label>
          <label>
            <span>본문</span>
            <textarea
              maxLength={NoteLimits.body}
              required
              rows={4}
              value={input.body}
              onChange={(e) => setInput({ ...input, body: e.target.value })}
            />
          </label>
          <label>
            <span>태그 (쉼표 구분)</span>
            <input
              aria-describedby="tags-help"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </label>
          <p className="hint" id="tags-help">
            최대 {NoteLimits.tags}개, 태그당 {NoteLimits.tag}자까지 입력할 수 있습니다.
          </p>
          <button type="submit">추가</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>노트 목록 ({notes.length})</h2>
        {loading && <p>불러오는 중...</p>}
        <ul className="notes">
          {notes.map((note) => (
            <li key={note.id} className="note">
              <div className="note-head">
                <strong>{note.title}</strong>
                <button type="button" onClick={() => void handleDelete(note.id)}>
                  삭제
                </button>
              </div>
              <p>{note.body}</p>
              <div className="tags">
                {note.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
              <small>{new Date(note.createdAt).toLocaleString()}</small>
            </li>
          ))}
          {notes.length === 0 && !loading && <li className="empty">아직 노트가 없습니다.</li>}
        </ul>
      </section>
    </main>
  );
}
