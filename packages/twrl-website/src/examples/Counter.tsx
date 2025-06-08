import { trigger } from "twrl";

// prettier-ignore
export const Counter = trigger((click) => (
  <button on:click={click}>
    Count is {click.track((x) => x + 1, 0)}
  </button>
));
