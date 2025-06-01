import { Trigger, Dyn } from "./lib";

type Child =
  | string
  | number
  | HTMLElement
  | Dyn<string>
  | Dyn<number>
  | Dyn<HTMLElement>;
type Children = Child | Child[];

type TwrlGlobalAttributes = {
  innerHTML?: string | Dyn<string>;
  children?: Children; // TODO: not all tags should have children
};

type TwrlOverrides = {
  input: {
    inputTrigger?: Trigger<string>;
    inputDyn?: Dyn<string>;
  };
  button: {
    clickTrigger?: Trigger<null>;
  };
};

type Elements = {
  [Tag in keyof HTMLElementTagNameMap]: {
    elementType: HTMLElementTagNameMap[Tag];
    attributes: TwrlGlobalAttributes & {
      [T in HTMLElementStringAttributes<Tag>]?: string | Dyn<string>;
    } & (Tag extends keyof TwrlOverrides ? TwrlOverrides[Tag] : {});
  };
};

declare global {
  namespace JSX {
    type Element = HTMLElement;
    type ElementType = keyof HTMLElementTagNameMap | (() => HTMLElement);

    type IntrinsicElements = {
      [Tag in keyof HTMLElementTagNameMap]: Elements[Tag]["attributes"];
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

export type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
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
    ? Elements[Tag]["elementType"]
    : never;
}[keyof Elements];

// 'innerHTML' should be available on all element types
(<ElemType<"innerHTML">>(undefined as any)) satisfies HTMLElement;
(<HTMLElement>(undefined as any)) satisfies ElemType<"innerHTML">;

const handleProperty = {
  inputTrigger: (elem: HTMLInputElement, val: Trigger<string>) => {
    elem.addEventListener("input", () => {
      val.send(elem.value);
    });
  },
  inputDyn: (elem: HTMLInputElement, val: Dyn<string>) => {
    elem.addEventListener("input", () => {
      val.send(elem.value);
    });
  },
  clickTrigger: (elem: HTMLButtonElement, val: Trigger<null>) => {
    elem.addEventListener("click", () => {
      val.send(null);
    });
  },
} as const;

export function createIntrinsicComponent(
  tag: string,
  attrs: Record<string, unknown>,
): HTMLElement {
  const elem_ = document.createElement(tag);

  for (const key in attrs) {
    if (key === "inputTrigger") {
      handleProperty["inputTrigger"](
        elem_ as ElemType<typeof key>,
        attrs[key] as PropType<typeof key>,
      );
    } else if (key === "clickTrigger") {
      handleProperty["clickTrigger"](
        elem_ as ElemType<typeof key>,
        attrs[key] as PropType<typeof key>,
      );
    } else if (key === "inputDyn") {
      handleProperty["inputDyn"](
        elem_ as ElemType<typeof key>,
        attrs[key] as PropType<typeof key>,
      );
    } else {
      // TODO: remove casts
      const elem = elem_ as ElemType<typeof key>;
      const val = attrs[key] as PropType<typeof key>;

      if (typeof val === "string") {
        // @ts-ignore
        elem[key] = val; /* TODO: carry proof */
      } else if (val instanceof Dyn) {
        const setAttr = (a: unknown) => {
          if (typeof a === "string") {
            // @ts-ignore
            elem[key] = a; /* TODO: carry proof */
          } // TODO: else: handle
        };
        val.addListener(setAttr);
      } else if (typeof val === "function") {
        // TODO: use triggers everywhere for events
        const eventName = key.slice(2); // drop "on"
        elem.addEventListener(eventName, val);
      } else {
        throw new Error("Unknown attribute: " + key + ", " + val);
      }
    }
  }

  return elem_;
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
  args: Record<
    string,
    string | (() => void) | Dyn<unknown> | Trigger<unknown>
  >,
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
type HTMLElementStringAttributes<Tag extends keyof HTMLElementTagNameMap> = {
  [Attr in keyof HTMLElementTagNameMap[Tag]]: HTMLElementTagNameMap[Tag][Attr] extends string
    ? Attr
    : never;
}[keyof HTMLElementTagNameMap[Tag]];

export function jsx<Tag extends keyof HTMLElementTagNameMap = "div">(
  f: Tag | undefined | (() => JSX.Element),
  props: Record<HTMLElementStringAttributes<Tag>, string> & {
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

  // assumes that anything that is not 'children' is an HTML attribute
  const { children: children_, ...attrs_ } =
    "children" in props ? props : { children: undefined, ...props };

  const attrs: Record<string, unknown> = attrs_;

  const newOpts: Record<
    string,
    string | (() => void) | Dyn<unknown> | Trigger<unknown>
  > = {};

  for (const key of Object.keys(attrs)) {
    const val: unknown = attrs[key];
    if (
      typeof val !== "string" &&
      !(val instanceof Dyn) &&
      !(val instanceof Trigger)
    ) {
      throw new Error(
        "Expected string: string, got " + [typeof key, typeof val].join(": "),
      );
    }
    newOpts[key] = val;
  }

  const children = homogenizeChildren(children_);
  return createComponent(f, newOpts, children);
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
