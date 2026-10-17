import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { integrationsRoutes } from "./routes";

const PATH = "/settings/integrations";

describe("IntegrationsPage", () => {
  it("mostra o banner de reconexão da PSN", async () => {
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    expect(await screen.findByText("Reconexão necessária", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("conecta a Steam pelo formulário", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    await screen.findByText("Conectar Steam");
    await user.type(screen.getByLabelText("Steam Web API key"), "ABCDEF0123456789ABCDEF0123456789");
    await user.type(screen.getByLabelText("SteamID64 ou vanity"), "76561198000000000");
    await user.click(screen.getByRole("button", { name: "Conectar" }));
    expect(await screen.findByText("Steam conectada.", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("marca a API key como obrigatória", async () => {
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    expect(await screen.findByLabelText("Steam Web API key")).toBeRequired();
  });
});
