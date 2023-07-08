import { defineConfig } from "vite";
import path from "path";
import { resolve } from "path";

const TOPLEVEL = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "./dist/browser",
    lib: {
      entry: {
        "jsx-runtime": path.join(TOPLEVEL, "src/jsx-runtime.ts"),
        lib: path.join(TOPLEVEL, "src/lib.ts"),
      },
      name: "twrl",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
