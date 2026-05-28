import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 로컬 dev에서 /api/* 호출은 배포된 Vercel로 보냄 (Vercel Functions가 거기서만 동작)
      '/api': {
        target: 'https://dog-walk-weather-delta.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
