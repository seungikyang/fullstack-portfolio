// Note Hub 모노레포 루트 Vitest 설정. packages별로 환경(node vs jsdom)을 분리해 한 명령으로 모두 돌린다.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "shared",
          environment: "node",
          include: ["packages/shared/src/**/*.test.ts"]
        }
      },
      {
        test: {
          name: "api",
          environment: "node",
          include: ["packages/api/src/**/*.test.ts"],
          testTimeout: 10000
        }
      },
      {
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
