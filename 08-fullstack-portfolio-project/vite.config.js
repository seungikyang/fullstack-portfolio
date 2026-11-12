// Vite는 개발 중 화면을 보여주고, 배포할 화면 파일을 만들어주는 도구다. 여기서 실행 방법을 정한다.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 화면은 문 번호(포트) 3000, 서버는 5100을 쓴다. /api 요청은 Vite가 서버로 대신 전달한다.
// 이런 전달을 프록시라고 한다. 브라우저는 같은 화면 주소로 요청하고 Vite가 뒤에서 연결한다.
const API_TARGET = process.env.VITE_API_URL || "http://localhost:5100";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // 3000번이 비어 있지 않으면 다른 번호로 바꾸지 않고 오류를 알린다.
    // host:true는 localhost만이 아니라 이 컴퓨터의 다른 네트워크 주소로도 접속할 수 있게 한다.
    host: true,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  },
  // preview는 개발용 화면이 아니라 build로 만든 배포용 화면을 미리 보는 실행 방법이다.
  preview: {
    host: true,
    port: 3000,
    strictPort: true
  }
});
