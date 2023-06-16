import { Dyn } from "./lib";
import type { Component } from "./lib";

type Child = string | Dyn<string> | Component;

export function createIntrinsicComponent(
  tag: string,
  attrs: Record<string, string | (() => void) | Dyn<string>>
): HTMLElement {
  const elem = document.createElement(tag);

  for (const key in attrs) {
    const val = attrs[key];
    if (typeof val === "string") {
      elem.setAttribute(key, val);
    } else if (val instanceof Dyn) {
      const setAttr = (a: unknown) => {
        if (typeof a === "string") {
          elem.setAttribute(key, a);
        } // TODO: else: handle
      };
      setAttr(val.latest);
      val.addListener((a) => {
        setAttr(a);
      });
    } else {
      const eventName = key.slice(2); // drop "on"
      elem.addEventListener(eventName, val);
    }
  }

  return elem;
}

export function createComponent(
  f: string | Function,
  args: Record<string, string | (() => void) | Dyn<string>>,
  children: Child[]
): Component {
  let elem;
  if (typeof f === "string") {
    elem = createIntrinsicComponent(f, args);
  } else if (f instanceof Dyn) {
    throw new Error("not implemented");
    // TODO: handle
  } else {
    elem = f(args); // TODO: how to ensure this is actually a Component?
  }

  for (const child of children) {
    if (typeof child === "string") {
      const newNode = document.createTextNode(child);
      elem.appendChild(newNode);
    } else if (child instanceof Dyn) {
      const getNodeValue = (value: unknown): Node => {
        if (typeof value === "string") {
          return document.createTextNode(value);
        } else if (typeof value === "number") {
          return document.createTextNode(value.toString());
        } else if (value instanceof HTMLElement) {
          return value;
        } else {
          throw new Error("Unsupported value for child: " + value);
        }
      };
      let node = getNodeValue(child.latest);

      elem.appendChild(node);
      child.addListener((a: unknown) => {
        const oldNode = node;
        node = getNodeValue(a);
        oldNode.parentNode?.replaceChild(node, oldNode);
      });
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

  const newOpts: Record<string, string | (() => void) | Dyn<string>> = {};

  for (const key of Object.keys(attrs)) {
    const val: unknown = attrs[key];
    if (typeof key === "string" && typeof val === "string") {
      newOpts[key] = val;
    } else if (typeof key === "string" && val instanceof Dyn) {
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
