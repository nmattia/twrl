import "./style.css";
import { setupCounter } from "./counter.ts";
import { render } from "./lib";
import { page } from "./paragraph";

const anchor = document.querySelector<HTMLDivElement>("#app")!;

render(page, anchor);

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
