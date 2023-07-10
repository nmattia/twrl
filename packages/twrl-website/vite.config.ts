import { defineConfig } from "vite";
import { resolve } from "path";
import shiki from "./plugins/shiki";
import reload from "./plugins/reload";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [shiki(), reload()],
});
