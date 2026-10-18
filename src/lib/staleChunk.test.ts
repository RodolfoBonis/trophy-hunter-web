import { afterEach, describe, expect, it, vi } from "vitest";
import { isStaleChunkError, reloadOnceForNewVersion } from "./staleChunk";

describe("staleChunk", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("reconhece falhas de import dinâmico dos navegadores", () => {
    expect(isStaleChunkError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/GamePage-abc.js"))).toBe(true);
    expect(isStaleChunkError(new TypeError("Importing a module script failed."))).toBe(true);
    expect(isStaleChunkError(new Error("Cannot read properties of undefined"))).toBe(false);
  });

  it("recarrega uma vez e não entra em laço", () => {
    const reload = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, reload } as Location);
    expect(reloadOnceForNewVersion()).toBe(true);
    expect(reloadOnceForNewVersion()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
