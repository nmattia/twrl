import { defineConfig } from "vite";
import { resolve } from "path";
import shiki from "./plugins/shiki";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [shiki()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
