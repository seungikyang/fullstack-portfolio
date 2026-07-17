// 취업 워크북 화면의 입력과 저장 흐름을 검증하는 프론트엔드 테스트
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

  it("프로젝트 삭제 실패를 사용자에게 표시한다", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("네트워크 오류")));

    render(<ProjectSection token="test-token" projects={[project]} onChanged={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Career Hub 프로젝트 삭제" }));

    expect(
      await screen.findByText("프로젝트를 삭제하지 못했습니다. 네트워크 오류")
    ).toBeInTheDocument();
  });
});
