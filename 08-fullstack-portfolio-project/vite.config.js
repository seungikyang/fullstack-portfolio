// React 포트폴리오 앱을 Vite로 실행하기 위한 설정 파일
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 중에는 프론트엔드(5173)에서 보낸 /api 요청을 백엔드(5100)로 프록시한다.
// 이렇게 하면 브라우저 입장에서는 같은 주소라서 CORS 문제가 생기지 않는다.
const API_TARGET = process.env.VITE_API_URL || "http://localhost:5100";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  }
});

