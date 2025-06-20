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
    "on:input"?: Trigger<string> | Dyn<string>;
  };
  button: {
    "on:click"?: Trigger<null>;
  };
};

declare global {
  namespace JSX {
    type Element = HTMLElement; /* return type for 'jsx()' */

    /* accepted element tags & attributes */
    type IntrinsicElements = {
      /* All HTML elements */
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

    if (key === "on:input") {
      const eventName = key.substring(3);
      /* XXX: this relies on the JSX typing to "ensure" this is the correct type */
      if (val instanceof Trigger || val instanceof Dyn) {
        elem.addEventListener(eventName, () => {
          if (elem instanceof HTMLInputElement) {
            val.send(elem.value);
          }
        });
      }
      continue;
    }

    if (key === "on:click") {
      const eventName = key.substring(3);
      /* XXX: this relies on the JSX typing to "ensure" this is the correct type */
      if (val instanceof Trigger || val instanceof Dyn) {
        elem.addEventListener(eventName, () => {
          if (elem instanceof HTMLButtonElement) {
            val.send(null);
          }
        });
      }
      continue;
    }

    if (["string", "number"].includes(typeof val)) {
      // @ts-ignore
      elem[key] = val; /* TODO: carry proof */
      continue;
    }

    if (val instanceof Dyn) {
      const setAttr = (a: unknown) => {
        if (!["string", "number"].includes(typeof a)) {
          throw new Error(
            "Don't know how to handle value of type " + typeof val,
          );
        }
        try {
          // @ts-ignore
          elem[key] = a; /* TODO: carry proof */
        } catch {
          console.error("Could not set value " + key, elem);
        }
      };
      val.addListener(setAttr);
      continue;
    }

    throw new Error("Unknown attribute: " + key + ", " + val);
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
  args: Record<string, unknown /* not correct */>,
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

export function jsx<Tag extends keyof JSX.IntrinsicElements = "div">(
  f: Tag | undefined | (() => JSX.Element),
  props: Record<HTMLElementStringAttributes<Tag>, string> &
    Record<HTMLElementNumberAttributes<Tag>, number> & {
      children?: Children;
    },
): Node {
  /* if f is undefined then this is a text node */
  if (f === undefined) {
    if (!props.children) {
      throw new Error("Fragment does not have children");
    }
    /* a fragment with multiple children means returning a list of HTML elements,
     * which would need to be checked for on every invocation -- at least until
     * tsc allows more fine-grained return types */
    if (Array.isArray(props.children)) {
      throw new Error(
        "Fragment does not support children: " +
          JSON.stringify(props.children),
      );
    }
    if (typeof props.children !== "string") {
      throw new Error(
        "Fragment only supports strings, got: " + JSON.stringify(props),
      );
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
