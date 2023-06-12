import { Dyn } from "./lib";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import type { Component } from "./lib";

const Counter = ({}: {}): Component => {
  const value = new Dyn(0);
  return (
    <button onclick={() => value.update((x) => x + 1)} type="button">
      Count is {value}
    </button>
  );
};

export const page: Component = (
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src={viteLogo} class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src={typescriptLogo} class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <Counter />
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
);
