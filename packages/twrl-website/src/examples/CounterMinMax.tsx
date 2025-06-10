import { Trigger } from "twrl";

// Constants
const MIN = 1;
const MAX = 5;
const START = MIN;

// Helpers
const clamp = (x: number) => Math.min(Math.max(x, MIN), MAX);
const inc = (x: number) => x + 1;
const dec = (x: number) => x - 1;

// Component
// prettier-ignore
export const CounterMinMax = () => {
  const plus = new Trigger(), plusf = plus.set(inc);
  const minus = new Trigger(), minusf = minus.set(dec);
  const value = Trigger.any(plusf, minusf).track(
    (acc, f) => clamp(f(acc)),
    START,
  );
  return (
    <div>
      <button on:click={minus}>-</button>
      {value}
      <button on:click={plus}>+</button>
    </div>
  );
};
