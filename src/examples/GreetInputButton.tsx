import { Dyn, Trigger } from "../lib";

export const GreetInputButton = () => {
  const name = new Dyn("World");
  const click = new Trigger(null);

  return (
    <div>
      <p>Hello, {name.block(click)}!</p>
      <input inputDyn={name} />
      <button clickTrigger={click}>Update</button>
    </div>
  );
};
