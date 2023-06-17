import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import type { Component } from "./lib";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?raw";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?raw";

const showcasedComponents: { component: () => HTMLElement; src: string }[] = [
  { component: Counter, src: counterSrc },
  { component: Greet, src: greetSrc },
];

export const page: Component = (
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src={viteLogo} class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src={typescriptLogo} class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
    {showcasedComponents.map(({ component: Component, src }) => (
      <div>
        <Component />
        <pre style="text-align: left;">
          <code>{src}</code>
        </pre>
      </div>
    ))}
  </div>
);