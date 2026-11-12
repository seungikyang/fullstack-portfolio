// Vitest는 '코드가 예상대로 동작하는가?'를 자동으로 확인하는 도구다. 검사할 파일과 환경을 정한다.
// 서버 검사는 Node에서, 화면 검사는 브라우저의 문서 구조를 흉내 내는 jsdom에서 실행한다.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    globals: false,
    // coverage는 검사가 코드의 어느 부분을 실행했는지 보여주는 보고서의 설정이다.
    coverage: {
      reporter: ["text", "html"],
      include: ["server/**/*.js", "src/**/*.{js,jsx}"],
      exclude: ["server/**/*.test.js", "src/**/*.test.{js,jsx}"]
    },
    // **는 여러 단계의 폴더, *는 파일 이름 일부를 뜻한다. 예: server/**/*.test.js는 서버 검사 파일들이다.
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
