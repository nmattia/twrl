import { trigger } from "twrl";

export const GreetInput = trigger<string>((name) => (
  <div>
    <p>Hello, {name.track((_, x) => x, "World")}!</p>
    <input inputTrigger={name} />
  </div>
));
