import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary.jsx";

function Boom() {
  throw new Error("렌더링 중 실패");
}

function Ok() {
  return <p>정상 화면</p>;
}

describe("ErrorBoundary", () => {
  it("자식이 정상이면 자식을 그대로 보여준다", () => {
    render(
      <ErrorBoundary>
        <Ok />
      </ErrorBoundary>
    );

    expect(screen.getByText("정상 화면")).toBeInTheDocument();
  });

  it("자식이 throw하면 폴백 UI를 보여준다", () => {
    // React 19는 에러를 콘솔에 두 번 기록하므로 테스트 출력만 일시적으로 숨긴다.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/렌더링 중 실패/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();

    errorSpy.mockRestore();
  });

  it("다시 시도 버튼을 누르면 에러 상태가 초기화된다", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    function Toggle({ shouldThrow }) {
      if (shouldThrow) {
        throw new Error("실패");
      }
      return <p>복구 화면</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Toggle shouldThrow />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    rerender(
      <ErrorBoundary>
        <Toggle shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("복구 화면")).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
