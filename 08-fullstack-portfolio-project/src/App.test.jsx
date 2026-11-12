// 취업 워크북 화면의 입력과 저장 흐름을 검증하는 프론트엔드 테스트
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App, {
  ApplicationSection,
  getWorkbookSteps,
  ProjectSection,
  shouldShowDemo,
  WorkbookSection
} from "./App.jsx";

const workbook = {
  targetRole: "",
  targetDate: "",
  weeklyGoal: "",
  nextAction: "",
  resumeReady: false,
  portfolioReady: false,
  selfIntroReady: false,
  mockInterviewReady: false,
  reflection: ""
};

// fetch·confirm 같은 브라우저 전역 mock이 다른 테스트의 실제 동작처럼 남지 않게 매번 원상 복구한다.
beforeEach(() => {
  vi.stubGlobal("localStorage", globalThis.jsdom.window.localStorage);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  globalThis.jsdom.window.localStorage.clear();
});

describe("App 조회 오류", () => {
  function successfulFetch(path) {
    const data = {
      "/api/me": { user: { name: "테스터" } },
      "/api/dashboard": { readinessPercent: 0 },
      "/api/workbook": workbook,
      "/api/workbook/history": [],
      "/api/applications": [],
      "/api/projects": []
    };
    return Promise.resolve({ ok: true, status: 200, json: async () => data[path] });
  }

  it("첫 조회의 서버 오류는 토큰을 유지하고 다시 시도할 수 있다", async () => {
    localStorage.setItem("careerHubToken", "valid-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ message: "잠시 후 다시 시도하세요." })
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    expect(await screen.findByText("잠시 후 다시 시도하세요.")).toBeInTheDocument();
    expect(localStorage.getItem("careerHubToken")).toBe("valid-token");
    fetchMock.mockImplementation(successfulFetch);
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("안녕하세요, 테스터님.")).toBeInTheDocument();
  });

  it("JSON이 아닌 오류 응답도 읽기 오류 대신 상태 코드가 담긴 안내를 보여준다", async () => {
    localStorage.setItem("careerHubToken", "valid-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => JSON.parse("<html>Bad Gateway</html>")
      })
    );
    render(<App />);

    expect(await screen.findByText("요청 처리에 실패했습니다. (HTTP 502)")).toBeInTheDocument();
    expect(localStorage.getItem("careerHubToken")).toBe("valid-token");
  });

  it("새로고침 통신 오류는 로그인과 기존 화면을 유지한다", async () => {
    localStorage.setItem("careerHubToken", "valid-token");
    const fetchMock = vi.fn(successfulFetch);
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);
    await screen.findByText("안녕하세요, 테스터님.");

    fetchMock.mockRejectedValue(new Error("네트워크 오류"));
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));

    expect(await screen.findByText("네트워크 오류")).toBeInTheDocument();
    expect(screen.getByText("안녕하세요, 테스터님.")).toBeInTheDocument();
    expect(localStorage.getItem("careerHubToken")).toBe("valid-token");
  });

  it("401 인증 오류는 토큰을 지우고 이유를 로그인 화면에 표시한다", async () => {
    localStorage.setItem("careerHubToken", "expired-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "유효하지 않은 토큰입니다." })
      })
    );
    render(<App />);

    expect(await screen.findByText("유효하지 않은 토큰입니다.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("study@example.com")).toBeInTheDocument();
    expect(localStorage.getItem("careerHubToken")).toBeNull();
  });

  it("이전 로그인의 늦은 인증 실패가 새 로그인을 해제하지 않는다", async () => {
    localStorage.setItem("careerHubToken", "old-token");
    const fetchMock = vi.fn(successfulFetch);
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);
    await screen.findByText("안녕하세요, 테스터님.");

    let resolveOld;
    const oldResponse = new Promise((resolve) => {
      resolveOld = resolve;
    });
    fetchMock.mockImplementation((path) =>
      path === "/api/me" ? oldResponse : successfulFetch(path)
    );
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    fetchMock.mockImplementation((path) =>
      path === "/api/auth/login"
        ? Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ token: "new-token", user: { name: "테스터" } })
          })
        : successfulFetch(path)
    );
    fireEvent.change(screen.getByPlaceholderText("study@example.com"), {
      target: { value: "new@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("8자 이상"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByPlaceholderText("study@example.com").closest("form"));
    await screen.findByText("안녕하세요, 테스터님.");
    await act(async () => {
      resolveOld({ ok: false, status: 401, json: async () => ({ message: "이전 인증 만료" }) });
    });

    expect(screen.getByText("안녕하세요, 테스터님.")).toBeInTheDocument();
    expect(localStorage.getItem("careerHubToken")).toBe("new-token");
    expect(screen.queryByText("이전 인증 만료")).not.toBeInTheDocument();
  });

  it("워크북을 바꿔 저장하면 다시 불러온 뒤에도 저장 완료 안내가 남는다", async () => {
    localStorage.setItem("careerHubToken", "valid-token");
    let saved = workbook;
    vi.stubGlobal(
      "fetch",
      vi.fn((path, options = {}) => {
        if (path === "/api/workbook" && options.method === "PATCH") {
          saved = { ...saved, ...JSON.parse(options.body), updatedAt: "2026-07-17T00:00:00.000Z" };
          return Promise.resolve({ ok: true, status: 200, json: async () => saved });
        }
        if (path === "/api/workbook") {
          return Promise.resolve({ ok: true, status: 200, json: async () => saved });
        }
        return successfulFetch(path);
      })
    );
    render(<App />);
    await screen.findByText("안녕하세요, 테스터님.");

    fireEvent.change(screen.getByLabelText("목표 직무"), { target: { value: "백엔드 개발자" } });
    fireEvent.click(screen.getByRole("button", { name: "워크북 저장" }));

    expect(await screen.findByText("워크북을 저장했습니다.")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 직무")).toHaveValue("백엔드 개발자");
  });

  it("인증이 만료된 뒤 다른 사용자가 로그인해도 이전 사용자의 자료가 남아 보이지 않는다", async () => {
    localStorage.setItem("careerHubToken", "first-token");
    const fetchMock = vi.fn((path) =>
      path === "/api/workbook"
        ? Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ ...workbook, targetRole: "첫 사용자의 목표" })
          })
        : successfulFetch(path)
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);
    await screen.findByText("안녕하세요, 테스터님.");
    expect(screen.getByLabelText("목표 직무")).toHaveValue("첫 사용자의 목표");

    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "유효하지 않은 토큰입니다." })
    });
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
    await screen.findByPlaceholderText("study@example.com");

    // 두 번째 사용자의 로그인은 성공하지만 자료 조회는 통신 오류로 실패하는 상태를 만든다.
    fetchMock.mockImplementation((path) =>
      path === "/api/auth/login"
        ? Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ token: "second-token", user: { name: "둘째" } })
          })
        : Promise.reject(new Error("통신 오류"))
    );
    fireEvent.change(screen.getByPlaceholderText("study@example.com"), {
      target: { value: "second@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("8자 이상"), { target: { value: "password123" } });
    fireEvent.click(screen.getAllByRole("button", { name: "로그인" }).at(-1));

    // 자료를 읽기 전에는 입력 화면을 열지 않는다. 빈 화면을 저장하면 기존 워크북이 지워지기 때문이다.
    expect(await screen.findByText("통신 오류")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "워크북 저장" })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("첫 사용자의 목표")).not.toBeInTheDocument();

    fetchMock.mockImplementation((path) =>
      path === "/api/me"
        ? Promise.resolve({ ok: true, status: 200, json: async () => ({ user: { name: "둘째" } }) })
        : successfulFetch(path)
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    await screen.findByText("안녕하세요, 둘째님.");
    expect(screen.getByLabelText("목표 직무")).toHaveValue("");
  });

  it("저장 요청이 401로 거절되면 로그인 화면으로 돌아가 이유를 보여준다", async () => {
    localStorage.setItem("careerHubToken", "valid-token");
    vi.stubGlobal(
      "fetch",
      vi.fn((path, options = {}) =>
        options.method === "PATCH"
          ? Promise.resolve({
              ok: false,
              status: 401,
              json: async () => ({ message: "유효하지 않은 토큰입니다." })
            })
          : successfulFetch(path)
      )
    );
    render(<App />);
    await screen.findByText("안녕하세요, 테스터님.");

    fireEvent.click(screen.getByRole("button", { name: "워크북 저장" }));

    expect(await screen.findByPlaceholderText("study@example.com")).toBeInTheDocument();
    expect(screen.getByText("유효하지 않은 토큰입니다.")).toBeInTheDocument();
    expect(localStorage.getItem("careerHubToken")).toBeNull();
  });
});

describe("데모 계정 표시 설정", () => {
  it("명시적 설정에서만 데모 계정을 표시한다", () => {
    expect(shouldShowDemo({ DEV: true })).toBe(false);
    expect(shouldShowDemo({ DEV: false, VITE_SHOW_DEMO: "true" })).toBe(true);
    expect(shouldShowDemo({ DEV: false, VITE_SHOW_DEMO: "false" })).toBe(false);
  });
});

describe("WorkbookSection", () => {
  it("취업 준비를 목표, 실행, 제출 자료, 지원의 네 단계로 안내한다", () => {
    const steps = getWorkbookSteps(
      {
        ...workbook,
        targetRole: "Java 백엔드 개발자",
        targetDate: "2026-08-01",
        weeklyGoal: "프로젝트 README 완성",
        nextAction: "오늘 19시에 기능 설명 작성",
        resumeReady: true,
        portfolioReady: true
      },
      { completedProjectCount: 1, startedApplicationCount: 0 }
    );

    expect(steps.map((step) => step.title)).toEqual([
      "목표 정하기",
      "이번 주 실행",
      "제출 자료 만들기",
      "지원하고 설명하기"
    ]);
    expect(steps.map((step) => step.done)).toEqual([true, true, true, false]);
  });

  it("준비중 기록은 실제 지원 단계 완료로 계산하지 않는다", () => {
    const readyWorkbook = {
      ...workbook,
      targetRole: "Java 백엔드 개발자",
      targetDate: "2026-08-01",
      weeklyGoal: "지원서 제출",
      nextAction: "오늘 공고 분석",
      resumeReady: true,
      portfolioReady: true,
      selfIntroReady: true,
      mockInterviewReady: true
    };
    const waitingSteps = getWorkbookSteps(readyWorkbook, {
      completedProjectCount: 1,
      totalApplications: 1,
      startedApplicationCount: 0
    });
    const startedSteps = getWorkbookSteps(readyWorkbook, {
      completedProjectCount: 1,
      totalApplications: 1,
      startedApplicationCount: 1
    });

    expect(waitingSteps[3].done).toBe(false);
    expect(startedSteps[3].done).toBe(true);
  });

  it("네 단계를 모두 끝내면 끝난 단계를 다시 안내하지 않고 완료를 알린다", () => {
    render(
      <WorkbookSection
        token="token"
        workbook={{
          ...workbook,
          targetRole: "Java 백엔드 개발자",
          targetDate: "2026-08-01",
          weeklyGoal: "지원서 제출",
          nextAction: "오늘 공고 분석",
          resumeReady: true,
          portfolioReady: true,
          selfIntroReady: true,
          mockInterviewReady: true
        }}
        dashboard={{ completedProjectCount: 1, startedApplicationCount: 1 }}
        onChanged={() => {}}
      />
    );

    expect(screen.getByText("4/4단계 완료")).toBeInTheDocument();
    expect(screen.getByText(/네 단계를 모두 완료했습니다/)).toBeInTheDocument();
    expect(screen.queryByText("지금 진행")).not.toBeInTheDocument();
  });

  it("목표와 준비 상태를 API에 저장하고 데이터를 다시 불러온다", async () => {
    const onChanged = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ...workbook, targetRole: "Java 백엔드 개발자" })
      })
    );

    render(
      <WorkbookSection
        token="test-token"
        workbook={workbook}
        dashboard={{ readinessDone: 0, readinessTotal: 4, readinessPercent: 0 }}
        onChanged={onChanged}
      />
    );

    fireEvent.change(screen.getByLabelText("목표 직무"), {
      target: { value: "Java 백엔드 개발자" }
    });
    fireEvent.change(screen.getByLabelText("이번 주 목표"), {
      target: { value: "이력서 완성" }
    });
    fireEvent.click(screen.getByLabelText("이력서 완성"));
    fireEvent.click(screen.getByRole("button", { name: "워크북 저장" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      "/api/workbook",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining('"targetRole":"Java 백엔드 개발자"')
      })
    );
    expect(screen.getByText("워크북을 저장했습니다.")).toBeInTheDocument();
  });

  it("제출 자료 단계에서 프로젝트 화면으로 이동한다", () => {
    const onNavigate = vi.fn();

    render(
      <WorkbookSection
        token="test-token"
        workbook={workbook}
        dashboard={{
          readinessDone: 0,
          readinessTotal: 4,
          readinessPercent: 0,
          completedProjectCount: 0,
          startedApplicationCount: 0
        }}
        onChanged={vi.fn()}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "프로젝트 정리하기" }));
    expect(onNavigate).toHaveBeenCalledWith("projects");
  });
});

describe("기록 삭제 보호", () => {
  const application = {
    id: "1",
    company: "테스트 SI",
    role: "백엔드 개발자",
    status: "지원완료",
    dueDate: "",
    stack: [],
    contact: "",
    memo: "",
    priority: "보통"
  };
  const project = {
    id: "1",
    name: "Career Hub",
    summary: "취업 준비 워크북",
    status: "완료",
    stack: [],
    repoUrl: "",
    deployUrl: "",
    highlight: ""
  };

  it("지원 기록 삭제를 확인하고 처리 중 중복 클릭을 막는다", async () => {
    const onChanged = vi.fn();
    const confirm = vi.fn().mockReturnValue(true);
    let finishRequest;
    vi.stubGlobal("confirm", confirm);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            finishRequest = () => resolve({ ok: true, status: 204 });
          })
      )
    );

    render(
      <ApplicationSection token="test-token" applications={[application]} onChanged={onChanged} />
    );

    const deleteButton = screen.getByRole("button", { name: "테스트 SI 지원 기록 삭제" });
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(deleteButton).toBeDisabled();

    finishRequest();
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
  });

  it("수정 중이던 지원 기록을 삭제하면 입력 폼이 새 기록 추가 상태로 돌아간다", async () => {
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    render(<ApplicationSection token="token" applications={[application]} onChanged={vi.fn()} />);

    fireEvent.click(screen.getByTitle("수정"));
    expect(screen.getByRole("button", { name: "수정 저장" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "테스트 SI 지원 기록 삭제" }));

    expect(await screen.findByRole("button", { name: "지원 기록 추가" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("회사명")).toHaveValue("");
  });

  it("수정 중이던 프로젝트를 삭제하면 입력 폼이 새 프로젝트 추가 상태로 돌아간다", async () => {
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    render(<ProjectSection token="token" projects={[project]} onChanged={vi.fn()} />);

    fireEvent.click(screen.getByTitle("수정"));
    expect(screen.getByRole("button", { name: "수정 저장" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Career Hub 프로젝트 삭제" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "수정 저장" })).not.toBeInTheDocument()
    );
    expect(screen.getByPlaceholderText("Career Hub")).toHaveValue("");
  });

  it("프로젝트 삭제 실패를 사용자에게 표시한다", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("네트워크 오류")));

    render(<ProjectSection token="test-token" projects={[project]} onChanged={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Career Hub 프로젝트 삭제" }));

    expect(
      await screen.findByText("프로젝트를 삭제하지 못했습니다. 네트워크 오류")
    ).toBeInTheDocument();
  });

  it("지원 기록 저장 중에는 추가 버튼을 막아 같은 기록이 두 번 만들어지지 않는다", async () => {
    const onChanged = vi.fn();
    let finishRequest;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            finishRequest = () =>
              resolve({ ok: true, status: 201, json: () => Promise.resolve(application) });
          })
      )
    );

    render(<ApplicationSection token="test-token" applications={[]} onChanged={onChanged} />);

    fireEvent.change(screen.getByPlaceholderText("회사명"), { target: { value: "테스트 SI" } });
    fireEvent.change(screen.getByPlaceholderText("풀스택 신입 개발자"), {
      target: { value: "백엔드 개발자" }
    });
    const submitButton = screen.getByRole("button", { name: "지원 기록 추가" });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(submitButton).toBeDisabled();

    finishRequest();
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    expect(submitButton).not.toBeDisabled();
  });
});

describe("지원 기록 검색과 필터", () => {
  const applications = [
    {
      id: "11",
      company: "가온 SI",
      role: "Java 백엔드",
      status: "면접",
      priority: "높음",
      dueDate: "",
      stack: ["Spring"],
      contact: "team@example.com",
      memo: "API 경험"
    },
    {
      id: "22",
      company: "나래 IT",
      role: "Java 백엔드",
      status: "면접",
      priority: "보통",
      dueDate: "",
      stack: ["React"],
      contact: "",
      memo: "인턴 경험"
    },
    {
      id: "33",
      company: "다온 회사",
      role: "프론트엔드",
      status: "지원완료",
      priority: "높음",
      dueDate: "",
      stack: ["JavaScript"],
      contact: "",
      memo: ""
    }
  ];

  it("검색·상태·우선순위를 함께 적용하고 초기화하면 전체 기록이 돌아온다", () => {
    render(<ApplicationSection token="token" applications={applications} onChanged={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("지원 기록 검색"), { target: { value: "  JAVA  " } });
    fireEvent.change(screen.getByLabelText("상태 필터"), { target: { value: "면접" } });
    fireEvent.change(screen.getByLabelText("우선순위 필터"), { target: { value: "높음" } });
    expect(screen.getByRole("heading", { name: "가온 SI" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "나래 IT" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "다온 회사" })).not.toBeInTheDocument();
    expect(screen.getByText("검색 결과 1건 / 전체 3건")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "검색·필터 초기화" }));
    expect(screen.getByLabelText("지원 기록 검색")).toHaveValue("");
    expect(screen.getByLabelText("상태 필터")).toHaveValue("");
    expect(screen.getByLabelText("우선순위 필터")).toHaveValue("");
    expect(screen.getByText("검색 결과 3건 / 전체 3건")).toBeInTheDocument();
  });

  it("회사·직무·기술 스택·메모·연락처를 검색하고 결과가 없으면 안내한다", () => {
    render(<ApplicationSection token="token" applications={applications} onChanged={vi.fn()} />);
    for (const query of ["가온", "spring", "API 경험", "team@example.com"]) {
      fireEvent.change(screen.getByLabelText("지원 기록 검색"), { target: { value: query } });
      expect(screen.getByText("검색 결과 1건 / 전체 3건")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "가온 SI" })).toBeInTheDocument();
    }
    fireEvent.change(screen.getByLabelText("지원 기록 검색"), { target: { value: "없는 회사" } });
    expect(
      screen.getByText("검색 조건에 맞는 지원 기록이 없습니다. 검색어나 필터를 바꿔보세요.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/아직 지원 기록이 없습니다/)).not.toBeInTheDocument();
  });

  it("필터된 카드 수정은 배열 위치 대신 원래 지원 기록 ID로 PATCH한다", async () => {
    const onChanged = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => applications[1] })
    );
    render(<ApplicationSection token="token" applications={applications} onChanged={onChanged} />);
    fireEvent.change(screen.getByLabelText("지원 기록 검색"), { target: { value: "나래" } });
    const card = screen.getByRole("heading", { name: "나래 IT" }).closest("article");
    fireEvent.click(within(card).getByRole("button", { name: "수정" }));
    expect(screen.getByLabelText("회사", { exact: true })).toHaveValue("나래 IT");
    fireEvent.change(screen.getByLabelText("메모", { exact: true }), {
      target: { value: "면접 준비 완료" }
    });
    fireEvent.click(screen.getByRole("button", { name: "수정 저장" }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/22",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining('"memo":"면접 준비 완료"')
      })
    );
  });
});

describe("워크북 저장 이력 표시", () => {
  const dashboard = { readinessDone: 0, readinessTotal: 4, readinessPercent: 0 };
  it("빈 이력을 안내하고 새 이력이 전달되면 저장 시각과 당시 목표·준비 상태를 표시한다", () => {
    const props = { token: "token", workbook, dashboard, onChanged: vi.fn() };
    const { rerender } = render(<WorkbookSection {...props} history={[]} />);
    expect(
      screen.getByText("아직 저장 이력이 없습니다. 워크북을 변경하고 저장하면 기록됩니다.")
    ).toBeInTheDocument();
    const savedAt = "2026-10-03T01:00:00.000Z";
    rerender(
      <WorkbookSection
        {...props}
        history={[
          {
            id: "1",
            userId: "1",
            savedAt,
            workbook: {
              ...workbook,
              targetRole: "Java 백엔드",
              weeklyGoal: "지원서 두 곳 제출",
              resumeReady: true
            }
          }
        ]}
      />
    );
    expect(screen.queryByText(/아직 저장 이력이 없습니다/)).not.toBeInTheDocument();
    const history = screen.getByRole("region", { name: "워크북 저장 이력" });
    expect(within(history).getByText("지원서 두 곳 제출")).toBeInTheDocument();
    expect(within(history).getAllByText("Java 백엔드")).toHaveLength(2);
    expect(within(history).getByText("준비 완료")).toBeInTheDocument();
    expect(history.querySelector("time")).toHaveAttribute("datetime", savedAt);
  });
});

describe("프로젝트 README 미리보기와 다운로드", () => {
  const project = {
    id: "2",
    name: "취업 프로젝트",
    summary: "저장한 프로젝트 설명",
    status: "완료",
    stack: ["React"],
    repoUrl: "",
    deployUrl: "",
    highlight: "사용자별 데이터 분리"
  };

  function openPreview() {
    render(<ProjectSection token="token" projects={[project]} onChanged={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "취업 프로젝트 README 생성" }));
  }

  it("저장된 프로젝트 Markdown을 미리 보고 파일로 다운로드한 뒤 Blob URL을 해제한다", async () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:test-readme");
    const revokeObjectURL = vi.fn();
    class DownloadURL extends URL {}
    DownloadURL.createObjectURL = createObjectURL;
    DownloadURL.revokeObjectURL = revokeObjectURL;
    vi.stubGlobal("URL", DownloadURL);
    const clicks = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
      clicks.push({ download: this.download, href: this.href });
    });
    openPreview();
    const preview = screen.getByLabelText("README Markdown");
    expect(preview).toHaveAttribute("readonly");
    expect(preview.value).toContain("저장한 프로젝트 설명");
    expect(preview.value).toContain("사용자별 데이터 분리");
    fireEvent.click(screen.getByRole("button", { name: "README 파일 다운로드" }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/markdown;charset=utf-8");
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    expect(text).toBe(preview.value);
    expect(clicks).toEqual([{ download: "취업 프로젝트-README.md", href: "blob:test-readme" }]);
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-readme"));
    fireEvent.click(screen.getByRole("button", { name: "미리보기 닫기" }));
    expect(screen.queryByLabelText("README Markdown")).not.toBeInTheDocument();
  });

  it("다운로드 실패 시 오류를 표시하고 만들어진 Blob URL도 해제한다", async () => {
    const revokeObjectURL = vi.fn();
    class DownloadURL extends URL {}
    DownloadURL.createObjectURL = vi.fn().mockReturnValue("blob:failed-readme");
    DownloadURL.revokeObjectURL = revokeObjectURL;
    vi.stubGlobal("URL", DownloadURL);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("다운로드 실패");
    });
    openPreview();
    fireEvent.click(screen.getByRole("button", { name: "README 파일 다운로드" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "파일을 다운로드하지 못했습니다. 미리보기 내용을 복사해 저장하세요."
    );
    expect(screen.getByLabelText("README Markdown")).toBeInTheDocument();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:failed-readme"));
  });
});
