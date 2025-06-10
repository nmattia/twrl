export type Component = HTMLElement;

export type Pop<As> = As extends []
  ? []
  : As extends [Dyn<infer A0>, ...infer More]
    ? [A0, ...Pop<More>]
    : never;

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

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

  static sequence<Ds, As extends Pop<Mutable<Ds>>>(vs: Ds): Dyn<As> {
    // @ts-ignore
    const seqed = new Dyn(vs.map((x) => x.latest)) as Dyn<As>;
    // @ts-ignore
    vs.forEach((v, ix) => {
      // @ts-ignore
      v.addListener((v) => {
        // @ts-ignore
        const vals = vs.map((x) => x.latest);
        // @ts-ignore
        vals[ix] = v;
        // @ts-ignore
        seqed.send(vals);
      });
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
    this.listeners.forEach((listener) => listener(a));

    // and set as latest
    this.latest = a;
  }

  update(f: (a: A) => A) {
    this.send(f(this.latest));
  }

  map<B>(f: (a: A) => B): Dyn<B> {
    const d = new Dyn<B>(f(this.latest));
    this.addListener((x) => {
      d.send(f(x));
    });
    return d;
  }
}

export function dyn<T>(
  f: (value: Dyn<T>) => Component,
  initial: T,
): () => Component {
  const value = new Dyn(initial);
  return () => {
    return f(value);
  };
}

export function dyn_<T>(
  f: (value: Dyn<T>) => Component,
  initial: T,
): Component {
  const value = new Dyn(initial);
  return f(value);
}

export function trigger<T = null>(
  f: (value: Trigger<T>) => Component,
): () => Component {
  return () => {
    const t = new Trigger<T>();
    return f(t);
  };
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

  static watch<B>(d: Dyn<B>): Trigger<B> {
    const t = new Trigger<B>();

    t.addListener((v) => {
      d.send(v);
    });

    return t;
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
