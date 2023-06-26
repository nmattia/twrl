declare global {
  namespace JSX {
    type IntrinsicElements = {
      pre: { style?: string };
      code: {};
      div: {
        style?: string;
        innerHTML?: string;
        id?: string;
        class?: string | Dyn<string>;
      };
      span: { class?: string };
      a: { href: string; target?: "_blank" };
      img: { src: string; class: string; alt: string };
      h1: {};
      button: {
        onclick?: () => void; // XXX: @ is not allowed in jsx
        id?: string;
        type?: "button";
      };
      p: { class?: string };
      input: { inputTrigger: Trigger<string> };
    };
  }
}

export type Component = HTMLElement;

export class Dyn<A> {
  public latest: A;

  private listeners: ((a: A) => void)[] = [];

  static readonly unchanged = Symbol("unchanged");

  // Constructor with latest which is "initial" and then latest
  constructor(initial: A, listeners?: Dyn<A>["listeners"]) {
    if (listeners !== undefined) {
      this.listeners = listeners;
    }
    this.latest = initial;
    this.send(initial); // latest will be set twice but we don't care
  }

  addListener(f: (a: A) => void) {
    this.listeners.push(f);
  }

  send(a: A) {
    this.listeners.forEach((listener) => listener(a));

    // and set as latest
    this.latest = a;
  }

  map<B>(
    opts: ((a: A) => B) | { f: (a: A) => B | typeof Dyn.unchanged; def: B }
  ): Dyn<B> {
    const { handleValue, latest } = this.__handleMapOpts(opts);

    const input = new Dyn<B>(latest);

    this.listeners.push((value: A) =>
      handleValue({ send: (a: B) => input.send(a), value })
    );

    return input;
  }

  update(f: (a: A) => A) {
    this.send(f(this.latest));
  }

  // How the mapped chan should handle the value
  protected __handleMapOpts<B>(
    opts: ((a: A) => B) | { f: (a: A) => B | typeof Dyn.unchanged; def: B }
  ): {
    handleValue: (arg: { send: (b: B) => void; value: A }) => void;
    latest: B;
  } {
    if (typeof opts === "function") {
      // Case of a simple mapper
      const f = opts;
      return {
        handleValue: ({ send, value }) => send(f(value)),
        latest: f(this.latest),
      };
    }

    // Advanced case with "unchanged" handling, where sending is skipped on "unchanged" (and initial/latest value may
    // be set to "def")
    const result = opts.f(this.latest);

    return {
      handleValue: ({ send, value }) => {
        const result = opts.f(value);
        if (result !== Dyn.unchanged) {
          send(result);
        }
      },
      latest: result === Dyn.unchanged ? opts.def : result,
    };
  }
}

export function dyn<T>(
  f: (value: Dyn<T>) => Component,
  initial: T
): () => Component {
  const value = new Dyn(initial);
  return () => {
    return f(value);
  };
}

export function dyn_<T>(
  f: (value: Dyn<T>) => Component,
  initial: T
): Component {
  const value = new Dyn(initial);
  return f(value);
}

export function trigger<T>(
  f: (value: Trigger<T>) => Component
): () => Component {
  return () => {
    const t = new Trigger<T>(undefined);
    return f(t);
  };
}

export class Trigger<A> extends Dyn<A | undefined> {
  read<B>(d: Dyn<B>): Trigger<B> {
    const n = new Trigger<B>(undefined);

    this.addListener(() => {
      n.send(d.latest);
    });

    return n;
  }

  hold(a: A): Dyn<A> {
    const d = new Dyn<A>(this.latest ?? a);

    this.addListener((x) => {
      d.send(x ?? a); // TODO: this is wrong: TODO: differentiate input from output
    });
    return d;
  }
}
