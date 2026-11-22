import { defineConfig } from "vite";
import path from "path";
import { resolve } from "path";

const DIRNAME = import.meta.dirname;
const TOPLEVEL = resolve(DIRNAME);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "./dist/browser",
    lib: {
      entry: {
        "jsx-runtime": path.join(TOPLEVEL, "src/jsx-runtime.ts"),
        "jsx-dev-runtime": path.join(TOPLEVEL, "src/jsx-dev-runtime.ts"),
        lib: path.join(TOPLEVEL, "src/lib.ts"),
      },
      name: "twrl",
      formats: ["es"] /* only generate .js, not eg .cjs */,
    },
  },
  /* necessary for jsxImportSource in tsconfig */
  resolve: {
    alias: {
      "@": resolve(DIRNAME, "./src"),
    },
  },
});
