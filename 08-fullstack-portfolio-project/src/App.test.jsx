// 취업 워크북 화면의 입력과 저장 흐름을 검증하는 프론트엔드 테스트
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkbookSection } from "./App.jsx";

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
});

describe("WorkbookSection", () => {
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
        dashboard={{ readinessDone: 0, readinessTotal: 6, readinessPercent: 0 }}
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
});
