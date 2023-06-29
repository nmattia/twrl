import logo from "/logo.png";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?shiki";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?shiki";

import { GreetInput } from "./examples/GreetInput";
import greetInputSrc from "./examples/GreetInput.tsx?shiki";

import { GreetInputButton } from "./examples/GreetInputButton";
import greetInputButtonSrc from "./examples/GreetInputButton.tsx?shiki";

type Example = {
  component: () => HTMLElement;
  src: string;
};

const showcasedComponents: Example[] = [
  { component: Counter, src: counterSrc },
  { component: Greet, src: greetSrc },
  { component: GreetInput, src: greetInputSrc },
  { component: GreetInputButton, src: greetInputButtonSrc },
];

export const page: HTMLElement = (
  <div>
    <a href={import.meta.env.BASE_URL}>
      <img src={logo} class="logo" alt="Twirl logo" />
    </a>
    <h1>Twirl</h1>
    <p class="read-the-docs">0% magic, 100% performance</p>
    <div>
      {showcasedComponents.map(({ component: C, src }) => (
        <div class="snippet">
          <div class="showcase">
            <C />
          </div>
          <div style="text-align: left;" innerHTML={src}></div>
        </div>
      ))}
    </div>
  </div>
);
