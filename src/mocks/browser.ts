import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** Liga a API mockada no navegador (só em `--mode mock`). */
export async function startMockWorker(): Promise<void> {
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}
