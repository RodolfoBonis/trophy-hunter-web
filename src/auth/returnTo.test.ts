import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./returnTo";

describe("safeReturnTo", () => {
  const origin = "https://trophy.rb.lab";
  it("mantém caminhos do mesmo origin", () => {
    expect(safeReturnTo("/library?q=elden", origin)).toBe("/library?q=elden");
  });
  it("rejeita outros origins e esquemas perigosos", () => {
    expect(safeReturnTo("https://evil.com/x", origin)).toBe("/");
    expect(safeReturnTo("//evil.com", origin)).toBe("/");
    expect(safeReturnTo("javascript:alert(1)", origin)).toBe("/");
  });
  it("cai em / para valores vazios/inválidos", () => {
    expect(safeReturnTo(undefined, origin)).toBe("/");
    expect(safeReturnTo("", origin)).toBe("/");
  });
});
