import { defineConfig } from "vite";
import shiki from "./plugins/shiki.ts";
import reload from "./plugins/reload.ts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [shiki(), reload()],
});
