import { describe, expect, it } from "vitest";
import { formatHours } from "./hours";

describe("formatHours", () => {
  it("formata em pt-BR", () => {
    expect(formatHours(0.4)).toBe("<1 h");
    expect(formatHours(4.25)).toBe("4,3 h");
    expect(formatHours(136.2)).toBe("136 h");
    expect(formatHours(null)).toBe("—");
  });
});
