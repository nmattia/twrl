# Twirl

Twirl is an experimental UI framework.

Twirl focuses on performance and correctness. It leverages TypeScript & tsx, no transpiling required.

Work in progress :)

[twirljs.dev](https://twirljs.dev)

## Examples

Here is an example, written in tsx:

```tsx
const Counter = trigger(click =>
  <button clickTrigger={click}>
    Count is {click.track((x) => x + 1, 0)}
  </button>
);


document.body.append(<div>Here is a counter: <Counter/></div>)
```

For more examples, see [./src/examples](./src/examples) and [twirljs.dev](https://twirljs.dev).


## Hacking

```
npm ci
npm run dev
```
