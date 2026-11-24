export type Component = HTMLElement;

export function dyngen<A>(
  update: (args: A) => Promise<A>,
  initial: A,
): Dyn<A> {
  const d = new Dyn(initial);

  (async () => {
    while (true) {
      const val = await update(d.latest);
      d.send(val);
    }
  })();

  return d;
}

export class Dyn<A> {
  public latest: A;

  private listeners: ((a: A) => void)[] = [];

  static readonly unchanged = Symbol("unchanged");

  static sequence<As extends readonly unknown[]>(vs: {
    readonly [K in keyof As]: Dyn<As[K]>;
  }): Dyn<As> {
    // typescript loses track of element types when mapping heterogeneous arrays:
    // https://github.com/microsoft/TypeScript/issues/29841
    const latests = () => vs.map((d) => d.latest) as unknown as As;

    const seqed = new Dyn<As>(latests());
    vs.forEach((d) => {
      d.addListener(() => seqed.send(latests()));
    });

    return seqed;
  }

  // Constructor with latest which is "initial" and then latest
  constructor(initial: A, listeners?: Dyn<A>["listeners"]) {
    if (listeners !== undefined) {
      this.listeners = listeners;
    }
    this.latest = initial;
    this.send(initial); // latest will be set twice but we don't care
  }

  /// NOTE: addListener will call `f` immediately as well as once for every future Dyn update
  addListener<R = undefined>(f: (a: A) => R) {
    this.listeners.push(f);
    return f(this.latest);
  }

  block(t: Trigger<null>): Dyn<A> {
    const d = new Dyn<A>(this.latest);

    t.addListener(() => {
      d.send(this.latest);
    });

    return d;
  }

  send(a: A) {
    // set as latest
    this.latest = a;

    // then notify listeners
    this.listeners.forEach((listener) => listener(a));
  }

  update(f: (a: A) => A) {
    this.send(f(this.latest));
  }

  /// NOTE: `f` should not have side effects. It may be called an arbitrary number of times.
  // (in practice, `f` will be called once with the latest value, and then once for every future update)
  map<B>(f: (a: A) => B): Dyn<B> {
    // for all calls _except_ the initial one, we want the event to be propagated and that's all.
    // On the first call however, we want to create Dyn. Instead of having an if-condition used
    // on every update, we replace the function after the first call.
    const ref = {
      onUpdate: (x: A) => {
        const latest = f(x);
        const d = new Dyn<B>(latest);
        ref.onUpdate = (y) => {
          d.send(f(y));
          return d; /* actual value does not matter */
        };
        d.send(latest);
        return d;
      },
    };

    const d = this.addListener<Dyn<B>>((x) => {
      return ref.onUpdate(x);
    });
    return d;
  }
}

export class Trigger<A = null> {
  private listeners: ((a: A) => void)[] = [];

  static asyncTrigger<A>(gen: AsyncGenerator<A>) {
    const n = new Trigger<A>();
    (async () => {
      while (true) {
        const result = await gen.next();

        if (result.done) {
          return;
        }

        n.send(result.value);
      }
    })();

    return n;
  }

  static gen<A>(f: () => Promise<A>): Trigger<A> {
    return Trigger.asyncTrigger<A>(
      (async function* () {
        while (true) {
          yield await f();
        }
      })(),
    );
  }

  static any<A1, A2>(t1: Trigger<A1>, t2: Trigger<A2>): Trigger<A1 | A2> {
    const t3 = new Trigger<A1 | A2>();

    t1.addListener((x) => t3.send(x));
    t2.addListener((x) => t3.send(x));

    return t3;
  }

  addListener(f: (a: A) => void) {
    this.listeners.push(f);
  }

  send(a: A) {
    this.listeners.forEach((listener) => listener(a));
  }

  set<B>(v: B): Trigger<B> {
    const t = new Trigger<B>();
    this.addListener(() => {
      t.send(v);
    });
    return t;
  }

  map<B>(f: (a: A) => B): Trigger<B> {
    const t = new Trigger<B>();
    this.addListener((x) => {
      t.send(f(x));
    });
    return t;
  }

  track<B>(f: (b: B, a: A) => B, initial: B): Dyn<B> {
    const d = new Dyn<B>(initial);
    this.addListener((v) => {
      const prev = d.latest;
      const next = f(prev, v);
      d.send(next);
    });
    return d;
  }
}
