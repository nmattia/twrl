import { trigger } from "../lib";

export const GreetInput = trigger<string>((name) => (
  <div>
    <p>Hello, {name.hold("World")}!</p>
    <input inputTrigger={name} />
  </div>
));
