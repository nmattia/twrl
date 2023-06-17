import logo from "/logo.png";
import { getHighlighter } from "shiki";
import { dyn_ } from "./lib";

import themeJson from "shiki/themes/github-light.json?url";
import tsxJson from "shiki/languages/tsx.tmLanguage.json?url";
import onigWasm from "shiki/dist/onig.wasm?url";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?raw";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?raw";

type Example = {
  component: () => HTMLElement;
  src: string;
};

const showcasedComponents: Example[] = [
  { component: Counter, src: counterSrc },
  { component: Greet, src: greetSrc },
];

export const page: HTMLElement = (
  <div>
    <a href={/* TODO: base url */ "/"}>
      <img src={logo} class="logo" alt="Twirl logo" />
    </a>
    <h1>Twirl</h1>
    <p class="read-the-docs">0% magic, 100% performance</p>
    {showcasedComponents.map(({ component: C, src }) =>
      dyn_<HTMLElement>(
        ($src) => {
          getHighlighter({
            theme: "github-light",
            paths: {
              themes: themeJson.replace("github-light.json", ""),
              languages: tsxJson.replace("tsx.tmLanguage.json", ""),
              wasm: onigWasm.replace("onig.wasm", ""),
            },
          }).then((highlighter) => {
            const html = highlighter.codeToHtml(src, { lang: "tsx" });
            const node = new DOMParser().parseFromString(html, "text/html")
              .body.firstChild as HTMLElement;
            $src.send(node);
          });
          return (
            <div class="snippet">
              <div class="showcase">
                <C />
              </div>
              {$src}
            </div>
          );
        },
        <pre style="text-align: left;">
          <code>{src}</code>
        </pre>
      )
    )}
  </div>
);
