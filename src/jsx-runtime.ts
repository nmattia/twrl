import { Dyn } from "./lib";

type Child = string | Dyn<string> | HTMLElement;

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
): HTMLElement {
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

// function called by jsx.
//  arg0:
//     - string for intrinsic elements ("div", "span", etc)
//     - undefined for fragment (<>hello</>)
//     - the (function) component itself for components (<Greet/>)
//
//  arg1:
//     - always an object
//     - .children may be:
//          - undefined if no children
//          - a single element for a single child
//          - an array for many children
//     - .children elements are either:
//          - 'string's for text nodes (<div>hello</div>)
//          - the result of jsx call for components/tags (<div><Greet/><img/></div>)
//              ^ in our case, an HTML element
//          - the value itself for raw values (<div>{ foo() }</div>)
//
export function jsx(...params: unknown[]): Node {
  const [f, props] = params;

  if (f === undefined) {
    console.log(f, props);
    throw new Error("undefined!");
  }

  if (typeof f !== "string" && typeof f !== "function") {
    console.log(props);
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
