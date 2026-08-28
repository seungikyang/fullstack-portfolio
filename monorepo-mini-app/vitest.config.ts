// Note Hub 모노레포 루트 Vitest 설정. packages별로 환경(node vs jsdom)을 분리해 한 명령으로 모두 돌린다.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        // 공통 타입/함수 테스트는 DOM이 필요 없는 빠른 Node 환경에서 실행한다.
        test: {
          name: "shared",
          environment: "node",
          include: ["packages/shared/src/**/*.test.ts"]
        }
      },
      {
        // API 통합 테스트도 Node 환경이며 DB 대기 가능성을 고려해 제한 시간을 늘린다.
        test: {
          name: "api",
          environment: "node",
          include: ["packages/api/src/**/*.test.ts"],
          testTimeout: 10000
        }
      },
      {
        // React 컴포넌트 테스트에는 브라우저 DOM을 흉내 내는 jsdom과 React 플러그인이 필요하다.
        plugins: [react()],
        test: {
          name: "web",
          environment: "jsdom",
          include: ["packages/web/src/**/*.test.{ts,tsx}"],
          setupFiles: ["./packages/web/src/test/setup.ts"]
        }
      }
    ]
  }
});
