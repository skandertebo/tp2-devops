import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/tp2devops/",
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test/setup.js",
  },
});
