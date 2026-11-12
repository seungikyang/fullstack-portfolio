// App 컴포넌트 스모크 테스트. fetch를 가짜로 바꿔서 네트워크 없이 렌더와 폼 흐름을 확인한다.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
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

function pendingResponse() {
  let resolve!: (response: Response) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Response>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe("App", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("초기 로드 시 노트 목록을 호출하고 빈 메시지를 보여준다", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<App />);

    expect(await screen.findByText(/아직 노트가 없습니다/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/notes", { headers: {} });
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
    await user.type(screen.getByLabelText("태그 (쉼표 구분)"), " tag1, , tag2 ");
    await user.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(screen.getByText("새 노트", { selector: "strong" })).toBeInTheDocument();
    });

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(postCall?.[0]).toBe("/api/notes");
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({
      title: "새 노트",
      body: "new",
      tags: ["tag1", "tag2"]
    });
  });

  it("생성·삭제 요청이 끝나기 전의 반복 클릭은 요청을 한 번만 보낸다", async () => {
    const post = pendingResponse();
    const remove = pendingResponse();
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === "POST") return post.promise;
      if (init?.method === "DELETE") return remove.promise;
      return Promise.resolve({ ok: true, json: async () => [makeNote({ title: "기존 노트" })] });
    });
    const countCalls = (method: string) =>
      fetchMock.mock.calls.filter(([, init]) => init?.method === method).length;

    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("기존 노트");

    await user.type(screen.getByLabelText("제목"), "새 노트");
    await user.type(screen.getByLabelText("본문"), "new");
    const addButton = screen.getByRole("button", { name: "추가" });
    await user.click(addButton);
    await user.click(addButton);
    expect(addButton).toBeDisabled();
    expect(countCalls("POST")).toBe(1);

    const deleteButton = screen.getByRole("button", { name: "삭제" });
    await user.click(deleteButton);
    await user.click(deleteButton);
    expect(countCalls("DELETE")).toBe(1);

    await act(async () => {
      post.resolve({ ok: true, status: 201, json: async () => makeNote() } as Response);
      remove.resolve({ ok: true, status: 204 } as Response);
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "추가" })).toBeEnabled());
  });

  it("연결한 토큰을 sessionStorage에 보관하고 API Bearer 헤더로 보낸다", async () => {
    const accessToken = "web-test-access-token";
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/아직 노트가 없습니다/);

    await user.type(screen.getByLabelText("접근 토큰"), accessToken);
    await user.click(screen.getByRole("button", { name: /^연결$/ }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/notes", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    });
    expect(sessionStorage.getItem("noteHubAccessToken")).toBe(accessToken);
  });

  it("연결 해제 즉시 보호된 목록을 비우고 401 후에도 복원하지 않는다", async () => {
    sessionStorage.setItem("noteHubAccessToken", "old-token");
    const disconnectedLoad = pendingResponse();
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [makeNote({ title: "보호 노트" })] })
      .mockReturnValueOnce(disconnectedLoad.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("보호 노트");

    await user.click(screen.getByRole("button", { name: "연결 해제" }));

    expect(sessionStorage.getItem("noteHubAccessToken")).toBeNull();
    expect(screen.queryByText("보호 노트")).not.toBeInTheDocument();
    await act(async () => disconnectedLoad.resolve(new Response(null, { status: 401 })));
    expect(await screen.findByText("목록 조회 실패 (401)")).toBeInTheDocument();
    expect(screen.queryByText("보호 노트")).not.toBeInTheDocument();
  });

  it.each(["success", "error"])("토큰 변경 전 조회의 늦은 %s를 무시한다", async (result) => {
    sessionStorage.setItem("noteHubAccessToken", "old-token");
    const oldLoad = pendingResponse();
    fetchMock
      .mockReturnValueOnce(oldLoad.promise)
      .mockResolvedValueOnce({ ok: true, json: async () => [makeNote({ title: "새 연결 노트" })] });
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText("접근 토큰"));
    await user.type(screen.getByLabelText("접근 토큰"), "new-token");
    await user.click(screen.getByRole("button", { name: /^연결$/ }));
    await screen.findByText("새 연결 노트");

    await act(async () => {
      if (result === "success") {
        oldLoad.resolve(new Response(JSON.stringify([makeNote({ title: "이전 연결 노트" })])));
      } else {
        oldLoad.reject(new Error("이전 연결 오류"));
      }
    });

    expect(screen.getByText("새 연결 노트")).toBeInTheDocument();
    expect(screen.queryByText("이전 연결 노트")).not.toBeInTheDocument();
    expect(screen.queryByText("이전 연결 오류")).not.toBeInTheDocument();
  });

  it("같은 토큰으로 재조회해도 마지막 요청 결과를 유지한다", async () => {
    sessionStorage.setItem("noteHubAccessToken", "same-token");
    const olderLoad = pendingResponse();
    const newerLoad = pendingResponse();
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockReturnValueOnce(olderLoad.promise)
      .mockReturnValueOnce(newerLoad.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/아직 노트가 없습니다/);
    await user.click(screen.getByRole("button", { name: /^연결$/ }));
    await user.click(screen.getByRole("button", { name: /^연결$/ }));
    await act(async () => {
      newerLoad.resolve(new Response(JSON.stringify([makeNote({ title: "최신 목록" })])));
    });
    await act(async () => {
      olderLoad.resolve(new Response(JSON.stringify([makeNote({ title: "오래된 목록" })])));
    });

    expect(screen.getByText("최신 목록")).toBeInTheDocument();
    expect(screen.queryByText("오래된 목록")).not.toBeInTheDocument();
  });

  it.each([
    { method: "POST", result: "success" },
    { method: "POST", result: "error" },
    { method: "DELETE", result: "success" },
    { method: "DELETE", result: "error" }
  ])("이전 연결의 $method $result가 새 연결 상태를 변경하지 않는다", async ({ method, result }) => {
    sessionStorage.setItem("noteHubAccessToken", "old-token");
    const mutation = pendingResponse();
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [makeNote({ title: "기존 노트" })] })
      .mockReturnValueOnce(mutation.promise)
      .mockResolvedValueOnce({ ok: true, json: async () => [makeNote({ title: "새 연결 목록" })] });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("기존 노트");
    if (method === "POST") {
      await user.type(screen.getByLabelText("제목"), "제출 제목");
      await user.type(screen.getByLabelText("본문"), "제출 본문");
      await user.click(screen.getByRole("button", { name: "추가" }));
    } else {
      await user.click(screen.getByRole("button", { name: "삭제" }));
    }
    await user.clear(screen.getByLabelText("접근 토큰"));
    await user.type(screen.getByLabelText("접근 토큰"), "new-token");
    await user.click(screen.getByRole("button", { name: /^연결$/ }));
    await screen.findByText("새 연결 목록");
    await user.clear(screen.getByLabelText("제목"));
    await user.type(screen.getByLabelText("제목"), "새 연결 초안");

    await act(async () => {
      if (result === "success") {
        mutation.resolve(new Response(null, { status: method === "POST" ? 201 : 204 }));
      } else {
        mutation.reject(new Error("이전 변경 오류"));
      }
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(screen.getByText("새 연결 목록")).toBeInTheDocument();
    expect(screen.getByLabelText("제목")).toHaveValue("새 연결 초안");
    expect(screen.queryByText("이전 변경 오류")).not.toBeInTheDocument();
  });
});
