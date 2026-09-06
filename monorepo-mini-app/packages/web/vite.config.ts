// Note Hub 프론트엔드 Vite 설정. 5174에서 띄우고 /api 요청은 5200 API 서버로 프록시한다.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // React JSX 변환과 Fast Refresh를 Vite에 연결한다.
  plugins: [react()],
  server: {
    // Career Hub(3000)와 겹치지 않는 Note Hub 전용 개발 포트다.
    port: 5174,
    host: true,
    // 브라우저의 /api 요청을 API 개발 서버로 전달해 CORS 없이 같은 주소처럼 호출한다.
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:5200",
        changeOrigin: true
      }
    }
  }
});
