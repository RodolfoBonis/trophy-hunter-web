import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderRoutes } from "@/test/render";
import * as browserPush from "./browserPush";
import { NotificationsPanel } from "./NotificationsPanel";

// Push API do navegador: fake controlável (jsdom não tem PushManager).
let subscribed = false;
vi.mock("./browserPush", async (orig) => {
  const real = await orig<typeof browserPush>();
  return {
    ...real,
    pushSupport: vi.fn(() => ({ ok: true })),
    permission: vi.fn(() => "default"),
    currentSubscription: vi.fn(async () =>
      subscribed
        ? ({ endpoint: "https://push.test/1" } as PushSubscription)
        : null,
    ),
    subscribe: vi.fn(async () => {
      subscribed = true;
      return {
        endpoint: "https://push.test/1",
        keys: { p256dh: "k", auth: "a" },
      };
    }),
    unsubscribe: vi.fn(async () => {
      subscribed = false;
      return "https://push.test/1";
    }),
  };
});

const T = { timeout: 4000 };
const route = [{ path: "/", element: <NotificationsPanel /> }];

beforeEach(() => {
  subscribed = false;
});
afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Notificações", () => {
  it("ativa neste aparelho, envia teste e desativa", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: route, path: "/" });
    await user.click(
      await screen.findByRole("button", { name: "Ativar notificações" }, T),
    );
    expect(browserPush.subscribe).toHaveBeenCalledWith("BFakeKey_-");
    expect(
      await screen.findByText("Ativas neste aparelho", {}, T),
    ).toBeInTheDocument();
    expect(screen.getByText("1 aparelho inscrito")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Enviar teste" }));
    expect(
      await screen.findByText("Teste enviado para 1 aparelho.", {}, T),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Desativar neste aparelho" }),
    );
    expect(
      await screen.findByText("Desligadas neste aparelho", {}, T),
    ).toBeInTheDocument();
  });

  it("salva as preferências por tipo", async () => {
    const user = userEvent.setup();
    const { client } = renderRoutes({ routes: route, path: "/" });
    const ai = await screen.findByRole("checkbox", { name: /Guia pronto/ }, T);
    await waitFor(() => expect(ai).toBeChecked());
    await user.click(ai);
    await waitFor(
      () =>
        expect(client.getQueryData(["push", "preferences"])).toMatchObject({
          ai_ready: false,
        }),
      T,
    );
    expect(ai).not.toBeChecked();
  });

  it("explica quando o iPhone precisa do app instalado", async () => {
    vi.mocked(browserPush.pushSupport).mockReturnValueOnce({
      ok: false,
      reason: "ios-install",
    });
    renderRoutes({ routes: route, path: "/" });
    expect(
      await screen.findByText(/Adicionar à Tela de Início/, {}, T),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ativar notificações" }),
    ).not.toBeInTheDocument();
  });

  it("avisa quando o servidor não tem push configurado", async () => {
    window.localStorage.setItem("mock:scenario", "push-off");
    renderRoutes({ routes: route, path: "/" });
    expect(
      await screen.findByText(/servidor ainda não está configurado/, {}, T),
    ).toBeInTheDocument();
  });

  it("converte a chave VAPID base64url", () => {
    expect([...browserPush.base64UrlToBytes("AQID_-8")]).toEqual([
      1, 2, 3, 255, 239,
    ]);
  });
});

describe("service worker ainda não ativo", () => {
  it("useLocalSubscription devolve null (desconhecido), não erro", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { QueryClientProvider } = await import("@tanstack/react-query");
    const { createTestQueryClient } = await import("@/test/render");
    const { useLocalSubscription } = await import("./queries");
    vi.mocked(browserPush.currentSubscription).mockRejectedValueOnce(new browserPush.ServiceWorkerUnavailableError());
    const client = createTestQueryClient();
    const { result } = renderHook(() => useLocalSubscription(true), {
      wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });
});
