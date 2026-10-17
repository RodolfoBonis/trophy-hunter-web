import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { syncLogRoutes } from "./routes";

describe("SyncLogPage", () => {
  it("mostra o progresso do fan-out (concluídos/total), falhas e barra enquanto roda", async () => {
    renderRoutes({ routes: syncLogRoutes, path: "/sync" });
    // run-0 (fixture) está rodando: 41/73 jogos, 2 falhas, com progressbar.
    expect(await screen.findByText("41/73 jogos", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/2 falhas/)).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
  });
});
