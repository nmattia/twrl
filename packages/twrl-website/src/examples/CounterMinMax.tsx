import { Trigger } from "twrl";

// Constants
const MIN = 1;
const MAX = 5;
const START = MIN;

// Helpers
const clamp = (x: number) => Math.min(Math.max(x, MIN), MAX);

// Component
// prettier-ignore
export const CounterMinMax = () => {
  const plus = new Trigger(), minus = new Trigger();

  const value = Trigger.any(plus.set(1), minus.set(-1)).track(
    (acc, delta) => clamp(acc + delta),
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
