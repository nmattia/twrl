import logo from "/logo.png";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?raw";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?raw";

const showcasedComponents: { component: () => HTMLElement; src: string }[] = [
  { component: Counter, src: counterSrc },
  { component: Greet, src: greetSrc },
];

export const page: HTMLElement = (
  <div>
    <a href={/* TODO: base url */ "/"}>
      <img src={logo} class="logo" alt="Twirl logo" />
    </a>
    <h1>Twirl</h1>
    <p class="read-the-docs">0% magic, 100% performance</p>
    {showcasedComponents.map(({ component: Component, src }) => (
      <div>
        <Component />
        <pre style="text-align: left;">
          <code>{src}</code>
        </pre>
      </div>
    ))}
  </div>
);
