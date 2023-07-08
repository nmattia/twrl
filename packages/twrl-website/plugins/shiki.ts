import { readFile } from "node:fs/promises";
import { getHighlighter } from "shiki";

export default function shiki() {
  return {
    name: "shiki",
    resolveId(source: string) {
      if (source.endsWith("?shiki")) {
        return source;
      }

      return null;
    },
    async load(id: string) {
      if (id.endsWith("?shiki")) {
        const filename = id.slice(0, id.length - "?shiki".length);

        const ext = filename.split(".").pop();
        const content = await readFile(filename);

        const highlighter = await getHighlighter({
          theme: "github-light",
        });

        const lightContent = content
          .toString()
          .split("\n")
          .filter((line) => !line.includes("prettier-ignore"))
          .join("\n");
        const highlighted = await highlighter.codeToHtml(
          lightContent.toString(),
          {
            lang: ext,
          }
        );

        return `export default ${JSON.stringify(highlighted)}`;
      }
      return null;
    },
  };
}
