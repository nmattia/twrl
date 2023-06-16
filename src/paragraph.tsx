import { dyn } from "./lib";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import type { Component } from "./lib";

const Counter = dyn(
  (value) => (
    <button onclick={() => value.update((x) => x + 1)} type="button">
      Count is {value}
    </button>
  ),
  0
);

const names = ["Alice", "Bob", "Chuck"];
const Greet = dyn(
  (ix) => (
    <div>
      <h1>Hello, {ix.map((ix) => names[ix])} !</h1>
      <button onclick={() => ix.update((ix) => (ix + 1) % names.length)}>
        next
      </button>
    </div>
  ),
  0
);

export const page: Component = (
  <div>
    <Greet />
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
