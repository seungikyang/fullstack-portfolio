// Note Hub 프론트엔드 Vite 설정. 5174에서 띄우고 /api 요청은 5200 API 서버로 프록시한다.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:5200",
        changeOrigin: true
      }
    }
  }
});
