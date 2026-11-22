import { Trigger } from "twrl";

const click = new Trigger();

// prettier-ignore
export const Counter = () =>
  <button on:click={click}>
    Count is {click.track((x) => x + 1, 0)}
  </button>;
