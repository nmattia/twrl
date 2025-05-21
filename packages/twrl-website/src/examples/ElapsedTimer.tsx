import { Trigger } from "twrl";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ElapsedTimer = () => {
  const t = Trigger.gen(() => wait(1000));
  return <div>Elapsed: {t.track((acc, _) => acc + 1, 0)} </div>;
};
