import { describe, expect, it } from "vitest";
import { routeGroup } from "./vitals";

describe("routeGroup", () => {
  it("agrupa as telas sem vazar ids", () => {
    expect(routeGroup("/")).toBe("home");
    expect(routeGroup("/games/1111/hunt")).toBe("hunt");
    expect(routeGroup("/games/1111")).toBe("game");
    expect(routeGroup("/friends/challenges/abc")).toBe("challenge");
    expect(routeGroup("/friends/u-1")).toBe("friend");
    expect(routeGroup("/friends")).toBe("friends");
    expect(routeGroup("/settings/privacy")).toBe("settings");
    expect(routeGroup("/qualquer")).toBe("other");
  });
});
