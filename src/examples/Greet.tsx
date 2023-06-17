import { dyn } from "../lib";

const names = ["Alice", "Bob", "Chuck"];

export const Greet = dyn(
  (ix) => (
    <div>
      <p>Hello, {ix.map((ix) => names[ix])} !</p>
      <button onclick={() => ix.update((ix) => (ix + 1) % names.length)}>
        next
      </button>
    </div>
  ),
  0
);
