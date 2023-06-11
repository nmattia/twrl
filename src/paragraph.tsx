import { Dyn } from "./lib";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import type { Component } from "./lib";

type FC<Props = {}> = (props: Props & { children?: undefined }) => Component;

const Counter: FC<{ startAt: string }> = ({ startAt }) => {
  console.log(startAt);

  return <button foo={startAt} id="counter" type="button"></button>;
};

const changing: Dyn<string> = new Dyn("world");

export const page: Component = (
  <div>
    Hello {changing}
    <a href="https://vitejs.dev" target="_blank">
      <img src={viteLogo} class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src={typescriptLogo} class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <Counter startAt={"0"} />
      {/* TODO: counter here */}
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
);

setTimeout(() => {
  console.log("TRIGGER");
  changing.send("Nicolas");
}, 3000);
