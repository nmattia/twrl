// @vitest-environment jsdom

import { vi, expect, it } from "vitest";
import { Dyn, Trigger } from "./lib";

import { afterEach } from "vitest";

afterEach(async () => {
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

it("renders a div", () => {
  document.body.append(<div></div>);
  expect(document.body.innerHTML).toBe("<div></div>");
});

it("renders a div with children", () => {
  document.body.appendChild(
    <div>
      <div className="first">
        <span className="second">hello</span>
      </div>
    </div>,
  );
  expect(document.body.innerHTML).toBe(
    '<div><div class="first"><span class="second">hello</span></div></div>',
  );
});

it("renders a fragment -- simple", () => {
  document.body.appendChild(<>hello</>);
  expect(document.body.innerHTML).toBe("hello");
});

it.skip("renders a fragment", () => {
  document.body.appendChild(
    <>
      <span>hello</span>
      <span>world</span>
    </>,
  );
  expect(document.body.innerHTML).toBe("hello");
});

it("renders a list of components", () => {
  document.body.appendChild(
    <div>
      {["hello", "world"].map((str) => (
        <span>{str}</span>
      ))}
    </div>,
  );
  expect(document.querySelectorAll("span").length).toBe(2);
});

it("updates reactive text nodes", () => {
  const name = new Dyn("Alice");

  document.body.appendChild(
    <div>
      <h1>Hello, {name}!</h1>
    </div>,
  );

  expect(document.querySelector("h1")!.innerHTML).toBe("Hello, Alice!");
  name.send("Bob");
  expect(document.querySelector("h1")!.innerHTML).toBe("Hello, Bob!");
});

it.skip("updates reactive text nodes - top level", () => {
  const name = new Dyn("Alice");

  document.body.appendChild(<>{name}</>);

  expect(document.body.innerHTML).toBe("Alice");
  name.send("Bob");
  expect(document.body.innerHTML).toBe("Bob");
});

it("updates reactive attributes", () => {
  const clazz = new Dyn("nice");

  document.body.appendChild(<div className={clazz}></div>);
  expect(document.querySelector("div")!.classList.contains("nice")).toBe(true);
  expect(document.querySelector("div")!.classList.contains("ugly")).toBe(
    false,
  );
  clazz.send("ugly");
  expect(document.querySelector("div")!.classList.contains("ugly")).toBe(true);
  expect(document.querySelector("div")!.classList.contains("nice")).toBe(
    false,
  );
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

  document.body.appendChild(<div>{tab}</div>);

  expect(document.querySelector("#tab1")).not.toBe(null);
  expect(document.querySelector("#tab2")).toBe(null);

  tab.send(tab2);

  expect(document.querySelector("#tab1")).toBe(null);
  expect(document.querySelector("#tab2")).not.toBe(null);
});

it("triggers click handlers", () => {
  const fn = vi.fn();

  const click = new Trigger();
  click.addListener(() => fn());

  document.body.appendChild(<button clickTrigger={click}></button>);
  expect(fn).toHaveBeenCalledTimes(0);
  document.querySelector("button")!.click();
  expect(fn).toHaveBeenCalledTimes(1);
});
