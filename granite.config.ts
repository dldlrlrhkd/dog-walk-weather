import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "dog-walk-weather",
  brand: {
    displayName: "강아지 산책 날씨 지수",
    primaryColor: "#FF8C00",
    icon: "", // 로고 URL 확정 후 입력 예정
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
