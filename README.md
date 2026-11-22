# Twrl

Twrl is an experimental UI framework.

Twrl focuses on performance and correctness. It leverages TypeScript & tsx, no transpiling required.

Work in progress :)

To the [website]

## Examples

Here is an example, written in tsx:

```tsx
import { Trigger } from "twrl";

const click = new Trigger(); // used by component to propagate event

// actual component
export const Counter = () => (
  <button on:click={click}>Count is {click.track((x) => x + 1, 0)}</button>
);

// can be displayed like any other HTMLElement
document.body.append(
  <div>
    Here is a counter: <Counter />
  </div>,
);
```

For more examples, see the [website].

[website]: https://nmattia.github.io/twrl
