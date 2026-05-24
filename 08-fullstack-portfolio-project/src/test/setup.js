// 프론트엔드 테스트가 시작될 때 한 번 실행되는 셋업 파일.
// jest-dom의 toBeInTheDocument 같은 사용자 친화적 matcher를 등록한다.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
