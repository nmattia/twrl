import logo from "/logo.png";

import { dyngen } from "./lib";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?shiki";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?shiki";

import { GreetInput } from "./examples/GreetInput";
import greetInputSrc from "./examples/GreetInput.tsx?shiki";

import { GreetInputButton } from "./examples/GreetInputButton";
import greetInputButtonSrc from "./examples/GreetInputButton.tsx?shiki";

import { ElapsedTimer } from "./examples/ElapsedTimer";
import elapsedTimerSrc from "./examples/ElapsedTimer.tsx?shiki";

type Example = {
  component: () => HTMLElement;
  src: string;
};

const showcasedComponents: Example[] = [
  { component: Counter, src: counterSrc },
  { component: Greet, src: greetSrc },
  { component: GreetInput, src: greetInputSrc },
  { component: GreetInputButton, src: greetInputButtonSrc },
  { component: ElapsedTimer, src: elapsedTimerSrc },
];

export const Changing = () => {
  const words = ["Performance.", "Correctness.", "Magical."];

  const fn = async ({
    current,
    ix,
  }: {
    current: string;
    ix: number;
  }): Promise<{ current: string; ix: number }> => {
    const target = words[ix];
    const wait = (ms: number) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    if (current === target) {
      await wait(2000);
      return {
        current: current.slice(0, -1),
        ix: (ix + 1) % words.length,
      };
    } else if (target.startsWith(current)) {
      await wait(150 + (Math.random() - 0.5) * 50);
      return {
        current: current + target[current.length],
        ix,
      };
    } else {
      await wait(50);
      return {
        current: current.slice(0, -1),
        ix,
      };
    }
  };

  const state = dyngen(fn, { current: "", ix: 0 });

  return <span>0% Magic, 100% {state.map(({ current }) => current)}</span>;
};

export const page: HTMLElement = (
  <main>
    <article class="wrapper flow">
      <a href={import.meta.env.BASE_URL}>
        <img
          style="max-width: 200px; margin: auto;"
          src={logo}
          class="logo"
          alt="Twirl logo"
        />
      </a>
      <h1 class="title__container">
        <span class="title__text">
          &lt;Twir<span style="font-style: oblique;">l</span>&gt;
        </span>
      </h1>
      <p class="blink"></p>

      <p>
        <a href="https://github.com/nmattia/twirl">Twirl</a> is a JavaScript
        framework for building highly reactive apps and components.
      </p>
      <p class="blink">
        <Changing />
      </p>

      <h2>Examples</h2>
      <div class="flow">
        {showcasedComponents.map(({ component: C, src }) => (
          <div class="snippet">
            <div class="showcase">
              <C />
            </div>
            <div style="text-align: left;" innerHTML={src}></div>
          </div>
        ))}
      </div>
    </article>
  </main>
);
