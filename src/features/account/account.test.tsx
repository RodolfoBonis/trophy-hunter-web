import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appRoutes } from "@/app/router";
import { renderRoutes } from "@/test/render";
import { ACCOUNT_DELETED_URL } from "./AccountData";

const T = { timeout: 4000 };
afterEach(() => {
  window.localStorage.removeItem("mock:scenario");
  vi.restoreAllMocks();
});

describe("Seus dados (LGPD)", () => {
  it("baixa o export em JSON", async () => {
    const createURL = vi.fn(() => "blob:th");
    Object.assign(URL, { createObjectURL: createURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/settings/privacy" });
    await user.click(await screen.findByRole("button", { name: "Baixar meus dados" }, T));
    expect(await screen.findByText("Arquivo baixado.", {}, T)).toBeInTheDocument();
    expect(click).toHaveBeenCalledOnce();
    const blob = (createURL.mock.calls[0] as unknown as [Blob])[0];
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    expect(JSON.parse(text)).toMatchObject({ format: "trophy-hunter-export/1" });
  });

  it("o dono não vê o botão de excluir", async () => {
    renderRoutes({ routes: appRoutes, path: "/settings/privacy" });
    expect(await screen.findByText(/conta do dono não pode ser excluída/, {}, T)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir minha conta" })).not.toBeInTheDocument();
  });

  it("membro exclui a conta só depois de digitar EXCLUIR e sai sem passar pelo Keycloak", async () => {
    window.localStorage.setItem("mock:scenario", "member");
    const signOut = vi.fn(async () => {});
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/settings/privacy", session: { signOut } });
    await user.click(await screen.findByRole("button", { name: "Excluir minha conta" }, T));
    const confirm = screen.getByRole("button", { name: "Excluir tudo para sempre" });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText(/para confirmar/), "excluir");
    expect(confirm).toBeDisabled();
    await user.clear(screen.getByLabelText(/para confirmar/));
    await user.type(screen.getByLabelText(/para confirmar/), "EXCLUIR");
    await user.click(confirm);
    await vi.waitFor(() => expect(signOut).toHaveBeenCalledWith({ local: true, redirectTo: ACCOUNT_DELETED_URL }), T);
  });
});
