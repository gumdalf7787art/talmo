import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "talmotalk",
  brand: {
    displayName: "탈모톡", // ❗앱 정보등록에 제출된 이름(예: 탈모톡)과 정확히 동일해야 합니다.
    primaryColor: "#F06292", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://static.toss.im/appsintoss/58661/06ce620c-7a7e-496f-85c3-c8a0266cbab5.png",
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
