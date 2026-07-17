// Vitest 설정. 서버(Node) 테스트와 프론트엔드(jsdom) 테스트를 환경별 projects로 분리한다.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    globals: false,
    coverage: {
      reporter: ["text", "html"],
      include: ["server/**/*.js", "src/**/*.{js,jsx}"],
      exclude: ["server/**/*.test.js", "src/**/*.test.{js,jsx}"]
    },
    projects: [
      {
        plugins: [],
        test: {
          name: "server",
          environment: "node",
          include: ["server/**/*.test.js", "scripts/**/*.test.js"],
          testTimeout: 10000
        }
      },
      {
        plugins: [react()],
        test: {
          name: "web",
          environment: "jsdom",
          include: ["src/**/*.test.{js,jsx}"],
          setupFiles: ["./src/test/setup.js"]
        }
      }
    ]
  }
});
