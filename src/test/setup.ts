import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setConfigForTests } from "@/config/env";
import { resetMockDb } from "@/mocks/data/db";
import { server } from "@/mocks/node";

setConfigForTests({
  oidcAuthority: "https://auth.test/realms/platform",
  oidcClientId: "trophy-hunter-web",
  oidcScope: "openid profile email",
  apiBase: "/api",
  authMode: "mock",
  apiMock: true,
});

// jsdom não implementa matchMedia; o app usa para breakpoints e reduced-motion (default: desktop).
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("min-width: 1280px"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
  cleanup();
  if (typeof window !== "undefined") window.localStorage.clear();
});
afterAll(() => server.close());

// jsdom não implementa ResizeObserver nem scrollIntoView (usados pelo cmdk da paleta de comandos).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function scrollIntoView() {};

// jsdom não implementa window.scrollTo (o AppShell rola para o topo a cada troca de rota).
window.scrollTo = (() => {}) as typeof window.scrollTo;
