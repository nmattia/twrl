import { Trigger, Dyn } from "./lib";

type Child =
  | string
  | number
  | HTMLElement
  | Dyn<string>
  | Dyn<number>
  | Dyn<HTMLElement>;
type Children = Child | Child[];

type TwrlOverrides = {
  input: {
    inputTrigger?: Trigger<string>;
    inputDyn?: Dyn<string>;
  };
  button: {
    clickTrigger?: Trigger<null>;
  };
};

declare global {
  namespace JSX {
    type Element = HTMLElement; /* return type for 'jsx()' */
    type ElementType = keyof HTMLElementTagNameMap | (() => HTMLElement);

    /* accepted element tags & attributes */
    type IntrinsicElements = {
      [Tag in keyof HTMLElementTagNameMap]: {
        [T in HTMLElementStringAttributes<Tag>]?: string | Dyn<string>;
      } & {
        [T in HTMLElementNumberAttributes<Tag>]?: number | Dyn<number>;
      } & (Tag extends keyof TwrlOverrides ? TwrlOverrides[Tag] : {}) & {
          style?: string /* note: This should probably be CSSStyleDeclaration */;
        };
    };
  }
}

export function createIntrinsicComponent(
  tag: string,
  attrs: Record<string, unknown>,
): HTMLElement {
  const elem = document.createElement(tag);

  for (const key in attrs) {
    const val = attrs[key];
    if (key === "inputTrigger" && elem instanceof HTMLInputElement) {
      const val = attrs[key];
      if (val instanceof Trigger) {
        elem.addEventListener("input", () => {
          // TODO: ensure val has correct type
          // https://github.com/microsoft/TypeScript/issues/17473
          val.send(elem.value);
        });
      }
    } else if (key === "clickTrigger" && elem instanceof HTMLButtonElement) {
      if (val instanceof Trigger) {
        elem.addEventListener("click", () => {
          val.send(elem.value);
        });
      }
    } else if (key === "inputDyn" && elem instanceof HTMLInputElement) {
      const val = attrs[key];
      if (val instanceof Dyn) {
        elem.addEventListener("input", () => {
          val.send(elem.value);
        });
      }
    } else {
      // TODO: remove casts
      const val = attrs[key];

      if (["string", "number"].includes(typeof val)) {
        // @ts-ignore
        elem[key] = val; /* TODO: carry proof */
      } else if (val instanceof Dyn) {
        const setAttr = (a: unknown) => {
          if (["string", "number"].includes(typeof a)) {
            // @ts-ignore
            elem[key] = a; /* TODO: carry proof */
          } else {
            throw new Error(
              "Don't know how to handle value of type " + typeof val,
            );
          }
        };
        val.addListener(setAttr);
      } else if (typeof val === "function") {
        // TODO: use triggers everywhere for events
        const eventName = key.slice(2); // drop "on"
        elem.addEventListener(eventName, val as any);
      } else {
        throw new Error("Unknown attribute: " + key + ", " + val);
      }
    }
  }

  return elem;
}

function staticNode(value: string | number | HTMLElement): Node {
  if (typeof value === "string") {
    return document.createTextNode(value);
  } else if (typeof value === "number") {
    return document.createTextNode(String(value));
  } else if (value instanceof HTMLElement) {
    return value;
  } else {
    value satisfies never;
    // For ts errors & pure js
    throw new Error("Unsupported value for child: " + value);
  }
}

function dynNode(dynVal: Dyn<string> | Dyn<number> | Dyn<HTMLElement>): Node {
  let node: Node = staticNode(dynVal.latest);
  dynVal.addListener((a: string | number | HTMLElement) => {
    const oldNode = node;
    node = staticNode(a);
    oldNode.parentNode?.replaceChild(node, oldNode);
  });

  return node;
}

export function createComponent(
  f: string | Function,
  args: Record<string, string | Dyn<string>>,
  children: Child[],
): HTMLElement {
  let elem;
  if (typeof f === "string") {
    elem = createIntrinsicComponent(f, args);
  } else if (f instanceof Dyn || f instanceof Trigger) {
    throw new Error("not implemented");
    // TODO: handle
  } else {
    elem = f(args); // TODO: how to ensure this is actually a Component?
  }

  for (const child of children) {
    let ret: Node;
    if (child instanceof Dyn) {
      ret = dynNode(child);
    } else {
      ret = staticNode(child);
    }
    elem.appendChild(ret);
  }

  return elem;
}

/* All HTML attributes with string values: "id" | "name" | ... */
type HTMLElementStringAttributes<Tag extends keyof HTMLElementTagNameMap> = {
  [Attr in keyof HTMLElementTagNameMap[Tag]]: HTMLElementTagNameMap[Tag][Attr] extends string
    ? Attr
    : never;
}[keyof HTMLElementTagNameMap[Tag]];

/* All HTML attributes with number values: "tabIndex" | ... */
type HTMLElementNumberAttributes<Tag extends keyof HTMLElementTagNameMap> = {
  [Attr in keyof HTMLElementTagNameMap[Tag]]: HTMLElementTagNameMap[Tag][Attr] extends number
    ? Attr
    : never;
}[keyof HTMLElementTagNameMap[Tag]];

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

export function jsx<Tag extends keyof HTMLElementTagNameMap = "div">(
  f: Tag | undefined | (() => JSX.Element),
  props: Record<HTMLElementStringAttributes<Tag>, string> &
    Record<HTMLElementNumberAttributes<Tag>, number> & {
      children?: Children;
    },
): Node {
  /* if f is undefined then this is a text node */
  if (f === undefined) {
    if (!props.children || !(typeof props.children === "string")) {
      throw new Error("Could not infer text node: " + f + props);
    }
    return new Text(props.children);
  }

  const { children: children_, ...attrs } = props;

  const children = homogenizeChildren(children_);
  return createComponent(f, attrs, children);
}

// Create a consistent array of children
function homogenizeChildren(children_: undefined | Child | Child[]): Child[] {
  if (children_ === undefined) {
    return [];
  }

  if (!Array.isArray(children_)) {
    return [children_];
  }

  return children_;
}

export const jsxs = jsx;
