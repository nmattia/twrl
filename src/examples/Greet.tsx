import { trigger } from "../lib";

const names = ["Alice", "Bob", "Chuck"];

const inc = (ix: number) => (ix + 1) % names.length;
const getName = (ix: number) => names[ix];

export const Greet = trigger((click) => (
  <div>
    <p>Hello, {click.track(inc, 0).map(getName)}!</p>
    <button clickTrigger={click}>next</button>
  </div>
));
