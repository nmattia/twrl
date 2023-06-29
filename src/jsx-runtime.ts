import { Trigger, Dyn } from "./lib";

type Child =
  | string
  | number
  | HTMLElement
  | Dyn<string>
  | Dyn<number>
  | Dyn<HTMLElement>;
type Children = Child | Child[];

type HTMLGlobalAttributes = ["id", "itemprop", "lang", "class", "style"];

type TwirlGlobalAttributes = {
  innerHTML?: string | Dyn<string>;
  children?: Children; // TODO: not all tags should have children
};

type TwirlCustomAttributes = {
  input: {
    inputTrigger: Trigger<string>;
  };
  button: {
    onclick: () => void;
  };
  img: {
    src: string;
    alt: string;
  };
  a: {
    href: string;
  };
};

type Elements = {
  [Tag in keyof HTMLElementTagNameMap]: {
    elementType: HTMLElementTagNameMap[Tag];
    attributes: {
      [Attr in HTMLGlobalAttributes[number]]?: string | Dyn<string>;
    } & TwirlGlobalAttributes &
      (Tag extends keyof TwirlCustomAttributes
        ? TwirlCustomAttributes[Tag]
        : {});
  };
};

declare global {
  namespace JSX {
    type Element = HTMLElement;
    type ElementChildrenAttribute = { children: {} };
    type ElementType = keyof HTMLElementTagNameMap | (() => HTMLElement);

    type IntrinsicElements = {
      [Tag in keyof Elements]: Elements[Tag]["attributes"];
    };
  }
}

(<Elements["div"]["elementType"]>(undefined as any)) satisfies HTMLElement;
(<Elements["div"]["elementType"]>(undefined as any)) satisfies HTMLDivElement;

// @ts-expect-error
// prettier-ignore
(<Elements["div"]["elementType"]>( (undefined as any))) satisfies HTMLInputElement;

(<Elements["div"]["attributes"]["innerHTML"]>(undefined as any)) satisfies
  | undefined
  | string
  | Dyn<string>;
(<Elements["input"]["attributes"]["inputTrigger"]>(
  (undefined as any)
)) satisfies Trigger<string> | undefined;

type Tags = JSX.IntrinsicElements;

type TagsWithProperty<P extends string> = keyof {
  [Key in keyof Tags as Tags[Key] extends Record<P, {}> ? Key : never]: any;
};

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

// Look up property type based on property name
type PropType<P extends string> = {
  [Tag in keyof Elements]: Elements[Tag]["attributes"] extends {
    [_ in P]?: infer T;
  }
    ? T
    : never;
}[keyof Elements];
(<PropType<"innerHTML">>(undefined as any)) satisfies string | Dyn<string>;

// @ts-expect-error
(<PropType<"innerHTML">>(undefined as any)) satisfies never;

(<string>(undefined as any)) satisfies PropType<"innerHTML">;

(<PropType<"innerHTML">>(undefined as any)) satisfies unknown;

(<Equals<PropType<"innerHTML">, string | Dyn<string>>>(
  (undefined as any)
)) satisfies true;

// @ts-expect-error
(<PropType<"innerHTML">>(undefined as any)) satisfies number;

// Look up element type based on property name
type ElemType<P extends string> = {
  [Tag in keyof Elements]: Elements[Tag]["attributes"] extends {
    [_ in P]?: any;
  }
    ? HTMLElementTagNameMap[Tag]
    : never;
}[keyof Elements];

// 'innerHTML' should be available on all element types
(<ElemType<"innerHTML">>(undefined as any)) satisfies HTMLElement;
(<HTMLElement>(undefined as any)) satisfies ElemType<"innerHTML">;

// 'href' should only be available on anchor elements (<a></a>)
(<ElemType<"href">>(undefined as any)) satisfies HTMLAnchorElement;
(<HTMLAnchorElement>(undefined as any)) satisfies ElemType<"href">;

export function createIntrinsicComponent(
  tag: string,
  // TODO: Record<string, unknown> and assert locally
  attrs: Record<string, string | (() => void) | Dyn<string>>
): HTMLElement {
  const elem_ = document.createElement(tag);
  const elem = elem_;

  (<TagsWithProperty<"innerHTML">>(undefined as any)) satisfies "div";

  for (const key in attrs) {
    // const val = attrs[key];
    if (key === "innerHTML") {
      const elem = elem_ as ElemType<typeof key>;
      const val = attrs[key] as PropType<typeof key>;
      if (val instanceof Dyn) {
        elem.innerHTML = val.latest;
        val.addListener((a) => {
          elem.innerHTML = a;
        });
      } else {
        elem.innerHTML = val;
      }
    } else if (key === "inputTrigger") {
      const elem = elem_ as ElemType<typeof key>;
      const val = attrs[key] as PropType<typeof key>;

      elem.addEventListener("input", () => {
        val.send(elem.value);
      });
    } else {
      const elem = elem_ as ElemType<typeof key>;
      const val = attrs[key] as PropType<typeof key>;

      if (typeof val === "string") {
        if (key === "innerHTML") {
          elem.innerHTML = val;
        } else {
          elem.setAttribute(key, val);
        }
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
      } else if (typeof val === "function") {
        // TODO: use triggers everywhere for events
        const eventName = key.slice(2); // drop "on"
        elem.addEventListener(eventName, val);
      } else {
        throw new Error("Unknown attribute: " + key + ", " + val);
      }
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
    if (Array.isArray(child)) {
      child.forEach(addChild);
      return;
    }
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

export const jsxs = jsx;
