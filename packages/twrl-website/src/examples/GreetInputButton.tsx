import { Dyn, Trigger } from "twrl";

export const GreetInputButton = () => {
  const name = new Dyn("World");
  const click = new Trigger();

  return (
    <div>
      <p>Hello, {name.block(click)}!</p>
      <input on:input={name} />
      <button on:click={click}>Update</button>
    </div>
  );
};
