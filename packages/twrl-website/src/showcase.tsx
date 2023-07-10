/** @jsxImportSource twrl */
import { dyngen } from "twrl";

import logo from "/logo.svg";

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
  <div>
    <nav>
      <ul style="padding: 1em; list-style: none; display: flex; gap: 2em; align-items: center;">
        <li>
          <a href={import.meta.env.BASE_URL}>
            <img
              style="min-width: 4em; max-height: 40px;"
              src={logo}
              alt="Twrl logo"
            />
          </a>
        </li>
        <li>
          <a href="#examples">Examples</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
      </ul>
    </nav>
    <main>
      <article class="wrapper flow">
        <a href={import.meta.env.BASE_URL}>
          <img
            style="max-width: 200px; margin: auto; margin-top: 2em;"
            src={logo}
            alt="Twrl logo"
          />
        </a>
        <div
          style="font-size: 0.8em; text-align: center; max-width: 20em; margin: auto; margin-top: 2em; color: var(--clr-primary); "
          class="blink"
        >
          <Changing />
        </div>
        <p style="margin: auto; margin-top: 2em; max-width: 20em; text-align: center;">
          <a href="https://github.com/nmattia/twrl" target="_blank">
            Twrl
          </a>{" "}
          is a JavaScript framework for building highly reactive apps and
          components.
        </p>

        <h2 id="examples">Examples</h2>
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
        <h2 id="about">About</h2>
        <p style="margin-bottom: 5em;">
          <a href="https://github.com/nmattia/twrl" target="_blank">
            Twrl
          </a>
          is an experimental JS framework by
          <a href="https://nmattia.com">Nicolas Mattia</a>. Twrl is a work in
          progress.
        </p>
      </article>
    </main>
  </div>
);
