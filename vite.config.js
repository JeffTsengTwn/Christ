import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Christ/" : "/",
  server: {
    port: 5173,
    strictPort: false,
  },
}));
