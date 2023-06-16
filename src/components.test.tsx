// @vitest-environment jsdom

import { vi, expect, it } from "vitest";
import { Dyn, render } from "./lib";

import { afterEach } from "vitest";

afterEach(async () => {
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

it("renders a div", () => {
  render(<div></div>, document.body);
  expect(document.body.innerHTML).toBe("<div></div>");
});

it("renders a div with children", () => {
  render(
    <div>
      <div class="first">
        <span class="second">hello</span>
      </div>
    </div>,
    document.body
  );
  expect(document.body.innerHTML).toBe(
    '<div><div class="first"><span class="second">hello</span></div></div>'
  );
});

it("updates reactive text nodes", () => {
  const name = new Dyn("Alice");

  render(
    <div>
      <h1>Hello, {name}!</h1>
    </div>,
    document.body
  );

  expect(document.querySelector("h1")!.innerHTML).toBe("Hello, Alice!");
  name.send("Bob");
  expect(document.querySelector("h1")!.innerHTML).toBe("Hello, Bob!");
});

it("updates reactive attributes", () => {
  const clazz = new Dyn("nice");

  render(<div class={clazz}></div>, document.body);
  expect(document.querySelector("div")!.classList.contains("nice")).toBe(true);
  expect(document.querySelector("div")!.classList.contains("ugly")).toBe(false);
  clazz.send("ugly");
  expect(document.querySelector("div")!.classList.contains("ugly")).toBe(true);
  expect(document.querySelector("div")!.classList.contains("nice")).toBe(false);
});

it("updates reactive tree", () => {
  const tab1 = (
    <div id="tab1">
      <h1>Tab 1</h1>
    </div>
  );
  const tab2 = (
    <div id="tab2">
      <h1>Tab 2</h1>
    </div>
  );
  const tab = new Dyn(tab1);

  render(<div>{tab}</div>, document.body);

  expect(document.querySelector("#tab1")).not.toBe(null);
  expect(document.querySelector("#tab2")).toBe(null);

  tab.send(tab2);

  expect(document.querySelector("#tab1")).toBe(null);
  expect(document.querySelector("#tab2")).not.toBe(null);
});

it("triggers click handlers", () => {
  const fn = vi.fn();

  render(<button onclick={() => fn()}></button>, document.body);
  expect(fn).toHaveBeenCalledTimes(0);
  document.querySelector("button")!.click();
  expect(fn).toHaveBeenCalledTimes(1);
});
