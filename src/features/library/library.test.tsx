import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { libraryRoutes } from "./routes";

describe("LibraryPage", () => {
  it("lista os jogos vindos da API mockada", async () => {
    renderRoutes({ routes: libraryRoutes, path: "/library" });
    expect(await screen.findByText("ELDEN RING")).toBeInTheDocument();
    expect(await screen.findByText("God of War Ragnarök")).toBeInTheDocument();
  });
});
