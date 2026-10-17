import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { ConnectSteamForm } from "./IntegrationsPage";
import { integrationsRoutes } from "./routes";

const PATH = "/settings/integrations";

describe("IntegrationsPage", () => {
  it("mostra o banner de reconexão da PSN", async () => {
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    expect(await screen.findByText("Reconexão necessária", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("lista as duas contas Steam pelo apelido", async () => {
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    expect(await screen.findByRole("heading", { name: "Principal" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alt" })).toBeInTheDocument();
  });

  it("adiciona outra conta Steam sem API key (reaproveita a existente)", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    await screen.findByText("Adicionar conta Steam");
    expect(screen.getByLabelText(/Steam Web API key/)).not.toBeRequired();
    await user.type(screen.getByLabelText("Apelido (opcional)"), "Smurf");
    await user.type(screen.getByLabelText("SteamID64 ou vanity"), "76561198000000099");
    await user.click(screen.getByRole("button", { name: "Adicionar conta" }));
    expect(await screen.findByText(/Conta conectada/, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Smurf" })).toBeInTheDocument();
  });

  it("renomeia e remove uma conta", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: integrationsRoutes, path: PATH });
    await user.click(await screen.findByRole("button", { name: "Renomear a conta Alt" }));
    const input = screen.getByLabelText("Apelido da conta");
    await user.clear(input);
    await user.type(input, "Secundária{Enter}");
    expect(await screen.findByRole("heading", { name: "Secundária" })).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: /Remover$/ });
    await user.click(removeButtons[1]!);
    const confirm = screen.getByRole("group", { name: "Confirmar remoção" });
    await user.click(within(confirm).getByRole("button", { name: "Remover conta" }));
    await expect(screen.findByRole("heading", { name: "Secundária" }, { timeout: 1500 })).rejects.toThrow();
  });
});

describe("ConnectSteamForm", () => {
  it("exige a API key na 1ª conta Steam", () => {
    renderRoutes({ routes: [{ path: "/", element: <ConnectSteamForm hasSteamAccount={false} /> }], path: "/" });
    expect(screen.getByText("Conectar Steam")).toBeInTheDocument();
    expect(screen.getByLabelText("Steam Web API key")).toBeRequired();
  });
});
