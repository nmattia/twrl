import type { HmrContext } from "vite";

// Vite plugin that performs a full reload on svg file updates
// (by default, an svg asset update doesn't do anything)
export default function reload() {
  return {
    name: "reload",
    enforce: "post",
    handleHotUpdate({ file, server }: HmrContext) {
      if (file.endsWith(".svg")) {
        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      }
    },
  };
}
