import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { BootError } from "./app/BootError";
import { registerPwa } from "./app/pwa";
import { getConfig } from "./config/env";
import { installStaleChunkGuard } from "./lib/staleChunk";

async function enableApiMocks(): Promise<void> {
  // Import dinâmico: em produção (VITE_API_MOCK ausente) o MSW nem entra no bundle.
  if (import.meta.env.VITE_API_MOCK !== "true") return;
  const { startMockWorker } = await import("./mocks/browser");
  await startMockWorker();
}

async function boot(): Promise<void> {
  installStaleChunkGuard();
  const root = createRoot(document.getElementById("root")!);
  let config;
  try {
    config = getConfig();
  } catch (error) {
    root.render(<BootError error={error} />);
    return;
  }
  await enableApiMocks();
  root.render(
    <StrictMode>
      <App config={config} />
    </StrictMode>,
  );
  void registerPwa();
}

void boot();
