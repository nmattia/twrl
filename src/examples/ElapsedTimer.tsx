import { Trigger } from "../lib";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ElapsedTimer = () => {
  const t = Trigger.gen(() => wait(1000));
  return <div>Elapsed: {t.track((x) => x + 1, 0)} </div>;
};
