import { Trigger } from "twrl";

const names = ["Alice", "Bob", "Chuck"];

const inc = (ix: number) => (ix + 1) % names.length;
const getName = (ix: number) => names[ix];

const click = new Trigger();

export const Greet = () => (
  <div>
    <p>Hello, {click.track((acc, _) => inc(acc), 0).map(getName)}!</p>
    <button on:click={click}>next</button>
  </div>
);
