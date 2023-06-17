declare global {
  namespace JSX {
    type IntrinsicElements = {
      pre: { style?: string };
      code: {};
      div: { id?: string; class?: string | Dyn<string> };
      span: { class?: string };
      a: { href: string; target: string };
      img: { src: string; class: string; alt: string };
      h1: {};
      button: {
        onclick?: () => void; // XXX: @ is not allowed in jsx
        id?: string;
        type?: "button";
      };
      p: { class: string };
    };
  }
}

export type Component = HTMLElement;

/** A channel (Chan) between two execution environments.
 * Values can be sent (`send()`) and received (`recv()`) asynchronously
 * on the other end.
 */
export class Chan<A> implements AsyncIterable<A> {
  /* The `recv` function will read values both from a blocking `snd` function
   * and from a buffer. We always _first_ write to `snd` and _then_ write
   * to `buffer` and _first_ read from the buffer and _then_ read from `snd`
   * to maintain a correct ordering.
   *
   * `snd` is a set by `recv` as `resolve` from a promise that `recv` blocks
   * on.
   */

  // Write to `recv`'s blocking promise
  private snd?: (value: A) => void;

  // Buffer where values are stored in between direct writes
  // to the promise
  private buffer: A[] = [];

  // A list of other channels to which we forward (`send()`) the values
  // sent to us
  // We use weak references to the channels so that they do not need to deregister explicitely,
  // but instead we simply drop them when they're gone.
  private listeners: WeakRef<{ notify: (a: A) => void }>[] = [];

  // Reference to a parent (whose listeners we've added ourselves to) to prevent garbage collection of parent (necessary if parent itself is a listener, to prevent dropping the listener).
  // This is a bit of a hack, but much cleaner and way less error prone than deregistering listeners by hand.
  protected parent?: unknown;

  public latest: A;

  // Constructor with latest which is "initial" and then latest
  constructor(initial: A) {
    this.latest = initial;
  }

  send(a: A): void {
    if (this.snd !== undefined) {
      this.snd(a);
      // After the promise was resolved, set as undefined so that
      // future `send`s go to the buffer.
      this.snd = undefined;
    } else {
      this.buffer.push(a);
    }

    // Finally, broadcast and prune listeners if they're gone
    this.listeners = this.listeners.reduce<typeof this.listeners>(
      (acc, ref) => {
        const listener = ref.deref();
        if (listener !== undefined) {
          listener.notify(a);
          acc.push(ref);
        }
        return acc;
      },
      []
    );

    // and set as latest
    this.latest = a;
  }

  // Receive all values sent to this `Chan`. Note that this effectively
  // consumes the values: if you need to read the value from different
  // places use `.values()` instead.
  protected async *recv(): AsyncIterable<A> {
    yield this.latest;

    // Forever loop, yielding entire buffers and then blocking
    // on `snd` (which prevents hot looping)
    while (true) {
      // Yield the buffer first
      while (this.buffer.length >= 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield this.buffer.shift()!;
      }

      // then block and yield a value when received
      yield await new Promise((resolve: (value: A) => void) => {
        this.snd = resolve;
      });
    }
  }

  // Signal to `map` that the element should remain unchanged
  static readonly unchanged = Symbol("unchanged");

  // Return a new Chan mapped with `f`.
  // In the simplest case, a mapping function is provided.
  // For advanced cases, the mapping function may return 'Chan.unchanged' signalling
  // that the element shouldn't be changed, in which case a default (initial) value
  // also needs to be provided.
  map<B>(
    opts: ((a: A) => B) | { f: (a: A) => B | typeof Chan.unchanged; def: B }
  ): Chan<B> {
    const { handleValue, latest } = this.__handleMapOpts(opts);

    // Create a chan that the WeakRef can hang on to, but that automatically
    // translates As into Bs
    class MappedChan extends Chan<B> {
      notify(value: A) {
        handleValue({ send: (a: B) => this.send(a), value });
      }
    }
    const input = new MappedChan(latest);
    this.listeners.push(new WeakRef(input));
    this.parent = input; // keep a ref to prevent parent being garbage collected
    return input;
  }

  // How the mapped chan should handle the value
  protected __handleMapOpts<B>(
    opts: ((a: A) => B) | { f: (a: A) => B | typeof Chan.unchanged; def: B }
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
        if (result !== Chan.unchanged) {
          send(result);
        }
      },
      latest: result === Chan.unchanged ? opts.def : result,
    };
  }

  // Read all the values sent to this `Chan`.
  values(): AsyncIterable<A> {
    const dup = this.map((x) => x);
    return dup.recv();
  }

  // When used directly as an async iterator, return values()
  [Symbol.asyncIterator](): AsyncIterator<A> {
    return this.values()[Symbol.asyncIterator]();
  }
}

export class Dyn<A> {
  public latest: A;

  private listeners: ((a: A) => void)[] = [];

  protected parent?: unknown;

  static readonly unchanged = Symbol("unchanged");

  // Constructor with latest which is "initial" and then latest
  constructor(initial: A) {
    this.latest = initial;
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
    this.parent = input; // keep a ref to prevent parent being garbage collected
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
