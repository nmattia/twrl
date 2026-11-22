import { Trigger } from "twrl";

const name = new Trigger<string>();

export const GreetInput = () => (
  <div>
    <p>Hello, {name.track((_, x) => x, "World")}!</p>
    <input on:input={name} />
  </div>
);
