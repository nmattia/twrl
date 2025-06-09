import { Trigger } from "twrl";

export const CounterMinMax = () => {
  const plus = new Trigger();
  const minus = new Trigger();
  const plusf = plus.map((_) => (x: number) => x + 1);
  const minusf = minus.map((_) => (x: number) => x - 1);
  const MAX = 5,
    MIN = 1;
  const clamp = (x: number) => Math.min(Math.max(x, MIN), MAX);
  const value = Trigger.any(plusf, minusf).track(
    (acc, f) => clamp(f(acc)),
    MIN,
  );
  return (
    <div>
      <button on:click={minus}>-</button>
      {value}
      <button on:click={plus}>+</button>
    </div>
  );
};
