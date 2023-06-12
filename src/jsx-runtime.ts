import { Dyn } from "./lib";
import type { Component } from "./lib";

type Child = string | Dyn<string> | Component;

export function createComponent(
  f: string | Function,
  args: Record<string, string | (() => void)>,
  children: Child[]
): Component {
  let elem;
  if (typeof f === "string") {
    elem = document.createElement(f);

    for (const key in args) {
      const val = args[key];
      if (typeof val === "string") {
        elem.setAttribute(key, val);
      } else {
        const eventName = key.slice(2); // drop "on"
        elem.addEventListener(eventName, val);
      }
    }
  } else if (f instanceof Dyn) {
    console.log("GOT A DYN!");
    // TODO: handle this
  } else {
    elem = f(args); // TODO: how to ensure this is actually a Component?
  }

  for (const child of children) {
    if (typeof child === "string") {
      const newNode = document.createTextNode(child);
      elem.appendChild(newNode);
    } else if (child instanceof Dyn) {
      let node = document.createTextNode(child.latest);
      elem.appendChild(node);
      const eee = elem;
      child.addListener((a) => {
        const oldNode = node;
        node = document.createTextNode(a);
        eee.replaceChild(node, oldNode);
      });
      // TODO: document.replaceNode(newNewNode, newNode) on update
    } else {
      elem.appendChild(child);
    }
  }

  return elem;
}

export function jsx(...params: unknown[]): Component {
  const [f, props] = params;

  // XXX: we don't accept constructor functions
  if (typeof f !== "string" && typeof f !== "function") {
    throw new Error("Expected string or function, got: " + typeof f);
  }

  if (typeof props !== "object") {
    throw new Error("Expected object, got: " + typeof props);
  }

  if (props === null) {
    throw new Error("Expected object, got null");
  }

  const { children: children_, ...attrs_ } =
    "children" in props ? props : { children: undefined, ...props };

  const attrs: Record<string, unknown> = attrs_;

  const newOpts: Record<string, string | (() => void)> = {};

  for (const key of Object.keys(attrs)) {
    const val: unknown = attrs[key];
    if (typeof key === "string" && typeof val === "string") {
      newOpts[key] = val;
    } else if (typeof key === "string" && typeof val === "function") {
      newOpts[key] = () => val();
    } else {
      throw new Error(
        "Expected string: string, got " + [typeof key, typeof val].join(": ")
      );
    }
  }

  const children: Child[] = [];

  const addChild = (child: unknown) => {
    if (
      !(child instanceof Dyn) &&
      !(child instanceof HTMLElement) &&
      typeof child !== "string"
    ) {
      throw new Error(
        "Expected child string or HTML, got " + typeof child + " " + child
      );
    }

    children.push(child);
  };

  if (Array.isArray(children_)) {
    for (const child of children_) {
      addChild(child);
    }
  } else if (children_ !== undefined) {
    addChild(children_);
  }

  return createComponent(f, newOpts, children);
}
