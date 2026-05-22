// App 컴포넌트 스모크 테스트. fetch를 가짜로 바꿔서 네트워크 없이 렌더와 폼 흐름을 확인한다.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Note } from "@note-hub/shared";
import App from "./App.js";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: overrides.id ?? "1",
    title: overrides.title ?? "예시 노트",
    body: overrides.body ?? "본문",
    tags: overrides.tags ?? ["demo"],
    createdAt: overrides.createdAt ?? new Date().toISOString()
  };
}

describe("App", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("초기 로드 시 노트 목록을 호출하고 빈 메시지를 보여준다", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<App />);

    expect(await screen.findByText(/아직 노트가 없습니다/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/notes");
  });

  it("기존 노트가 있으면 목록에 렌더된다", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [makeNote({ title: "Hello world" })]
    });

    render(<App />);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("#demo")).toBeInTheDocument();
  });

  it("폼 제출 시 POST와 재조회가 이루어진다", async () => {
    fetchMock
      // 초기 list
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // POST 결과
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => makeNote({ id: "2", title: "새 노트", body: "new" })
      })
      // 재조회 list
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeNote({ id: "2", title: "새 노트", body: "new", tags: [] })]
      });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/아직 노트가 없습니다/);

    await user.type(screen.getByLabelText("제목"), "새 노트");
    await user.type(screen.getByLabelText("본문"), "new");
    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(screen.getByText("새 노트")).toBeInTheDocument();
    });

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(postCall?.[0]).toBe("/api/notes");
  });
});
