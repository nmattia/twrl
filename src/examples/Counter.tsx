import { dyn } from "../lib";

export const Counter = dyn(
  (count) => (
    <button onclick={() => count.update((x) => x + 1)}>Count is {count}</button>
  ),
  0
);
