import { Dyn, Trigger } from "twrl";

export const GreetInputButton = () => {
  const name = new Dyn("World");
  const click = new Trigger();

  return (
    <div>
      <p>Hello, {name.block(click)}!</p>
      <input inputDyn={name} />
      <button clickTrigger={click}>Update</button>
    </div>
  );
};
