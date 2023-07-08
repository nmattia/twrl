# Twrl

Twrl is an experimental UI framework.

Twrl focuses on performance and correctness. It leverages TypeScript & tsx, no transpiling required.

Work in progress :)

[twrl.dev](https://twrl.dev)

## Examples

Here is an example, written in tsx:

```tsx
const Counter = trigger((click) => (
  <button clickTrigger={click}>Count is {click.track((x) => x + 1, 0)}</button>
));

document.body.append(
  <div>
    Here is a counter: <Counter />
  </div>
);
```

For more examples, see [twrl.dev](https://twrl.dev).

## Hacking

```
npm ci

# and

cd packages/twrl
npm run watch

# or

cd packages/website
npm run dev
```
