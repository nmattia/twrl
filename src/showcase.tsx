import logo from "/logo.png";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?shiki";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?shiki";

type Example = {
  component: () => HTMLElement;
  src: string;
};

const showcasedComponents: Example[] = [
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
    {showcasedComponents.map(({ component: C, src }) => (
      <div class="snippet">
        <div class="showcase">
          <C />
        </div>
        <div style="text-align: left;" innerHTML={src}></div>
      </div>
    ))}
  </div>
);
