import { dyn } from "../lib";

const names = ["Alice", "Bob", "Chuck"];

export const Greet = dyn(
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
