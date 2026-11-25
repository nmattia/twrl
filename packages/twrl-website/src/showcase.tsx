/** @jsxImportSource twrl */
import { dyngen } from "twrl";

import logo from "/logo.svg";

import { Counter } from "./examples/Counter";
import counterSrc from "./examples/Counter.tsx?shiki";

import { CounterMinMax } from "./examples/CounterMinMax";
import counterMinMaxSrc from "./examples/CounterMinMax.tsx?shiki";

import { Greet } from "./examples/Greet";
import greetSrc from "./examples/Greet.tsx?shiki";

import { GreetInput } from "./examples/GreetInput";
import greetInputSrc from "./examples/GreetInput.tsx?shiki";

import { GreetInputButton } from "./examples/GreetInputButton";
import greetInputButtonSrc from "./examples/GreetInputButton.tsx?shiki";

import { ElapsedTimer } from "./examples/ElapsedTimer";
import elapsedTimerSrc from "./examples/ElapsedTimer.tsx?shiki";

type Example = {
  description: string;
  component: () => HTMLElement;
  src: string;
};

const showcasedComponents: Example[] = [
  {
    description: "Tracking single events",
    component: Counter,
    src: counterSrc,
  },
  {
    description: "Merging events from multiple sources",
    component: CounterMinMax,
    src: counterMinMaxSrc,
  },
  {
    description: "Using events to modify data",
    component: Greet,
    src: greetSrc,
  },
  {
    description: "Carrying input data via events",
    component: GreetInput,
    src: greetInputSrc,
  },
  {
    description: "Holding a value back until an event fires",
    component: GreetInputButton,
    src: greetInputButtonSrc,
  },
  {
    description: "Generating events from async functions",
    component: ElapsedTimer,
    src: elapsedTimerSrc,
  },
];

const GITHUB = "https://github.com/nmattia/twrl";

// NOTE: the hero heading is sized so that it fits with the longest word
// (see .hero__text in style.css); update it when changing the words.
export const Changing = () => {
  const words = ["Fast.", "Correct.", "Magical."];

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
      await wait(4000);
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

  return (
    <span className="cursor" aria-hidden="true">
      {state.map(({ current }) => current)}
    </span>
  );
};

export const page: HTMLElement = (
  <div>
    <header className="nav">
      <nav className="container">
        <a href={import.meta.env.BASE_URL}>
          <img src={logo} alt="Twrl" />
        </a>
        <a href="#examples">Examples</a>
        <a href={GITHUB} target="_blank" rel="noopener">
          GitHub
        </a>
      </nav>
    </header>

    <main>
      <section className="hero container">
        <div className="hero__text">
          <h1>
            0% Magic, 100% <Changing />
            <span className="hero__static">Fast, Correct, Magical.</span>
          </h1>
          <p>
            Twrl is a JavaScript framework for building highly reactive apps
            and components.
          </p>
        </div>
        <div className="hero__image">
          <img src={logo} alt="" />
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="container">
          <h2>How it works</h2>
          <div className="prose">
            <p>
              Twrl borrows concepts from Functional Reactive Programming (FRP)
              frameworks like Elm and Reflex, while staying very close to the
              browser APIs. State is modeled with two primitives:
            </p>
            <ul>
              <li>
                <code>Trigger</code>: a stream of discrete events, like clicks
                or input changes. Triggers can be mapped, merged, and folded
                into a <code>Dyn</code> to hold state.
              </li>
              <li>
                <code>Dyn</code>: a value that changes over time. Dyns can be
                mapped, combined, or held back until a trigger fires.
              </li>
            </ul>
            <p>
              Components are written in TypeScript with TSX and return standard{" "}
              <code>HTMLElement</code> objects; there is no virtual DOM. When a{" "}
              <code>Dyn</code> changes, only the nodes and attributes that
              depend on it are updated.
            </p>
            <p>
              Twrl is experimental and a work in progress. It has no runtime
              dependencies; the source is on{" "}
              <a href={GITHUB} target="_blank" rel="noopener">
                GitHub
              </a>{" "}
              and the package is published on npm as <code>twrl</code>. See
              below for examples.
            </p>
          </div>
        </div>
      </section>

      <section id="examples" className="section">
        <div className="container">
          <h2>Examples</h2>
          <p className="lead">
            These are some example components built with Twrl.
          </p>
          <div>
            {showcasedComponents.map(({ description, component: C, src }) => (
              <article className="example">
                <h3>{description}</h3>
                <div innerHTML={src}></div>
                <div className="example__rendered">
                  <C />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>

    <footer className="footer">
      Twrl · an experiment by <a href="https://nmattia.com">Nicolas Mattia</a>
    </footer>
  </div>
);
