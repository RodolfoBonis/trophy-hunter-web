import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./Markdown";

describe("Markdown do chat", () => {
  it("renderiza parágrafos, listas e ênfases sem HTML cru", () => {
    const { container } = render(
      <Markdown
        text={
          "# Título\nTexto **forte** e `x`.\n\n- um\n- *dois*\n\n1. a\n2. b\n<img src=x onerror=alert(1)>"
        }
      />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("Título");
    expect(container.querySelectorAll("ul li")).toHaveLength(2);
    expect(container.querySelectorAll("ol li")).toHaveLength(2);
    expect(container.querySelector("em")?.textContent).toBe("dois");
    expect(container.querySelector("code")?.textContent).toBe("x");
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });
});
