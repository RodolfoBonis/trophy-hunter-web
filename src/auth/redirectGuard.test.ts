import { describe, expect, it, vi } from "vitest";
import { canRedirectToLogin, markLoginRedirect, singleFlight } from "./redirectGuard";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe("redirectGuard", () => {
  it("permite o primeiro redirect e bloqueia dentro da janela de 30s", () => {
    const storage = memoryStorage();
    const t0 = 1_000_000;
    expect(canRedirectToLogin(t0, storage)).toBe(true);
    markLoginRedirect(t0, storage);
    expect(canRedirectToLogin(t0 + 10_000, storage)).toBe(false);
    expect(canRedirectToLogin(t0 + 31_000, storage)).toBe(true);
  });

  it("singleFlight compartilha a mesma promise entre chamadas concorrentes", async () => {
    const fn = vi.fn(async () => "ok");
    const guarded = singleFlight(fn);
    const [a, b] = await Promise.all([guarded(), guarded()]);
    expect(a).toBe("ok");
    expect(b).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
