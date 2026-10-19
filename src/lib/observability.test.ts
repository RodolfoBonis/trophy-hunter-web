import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureErrorReporting, reportError } from "./observability";

describe("reportError → API", () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockClear();
  });
  afterEach(() => {
    configureErrorReporting(null);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sem configurar (testes/mock) não envia nada", () => {
    reportError(new Error("x"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia com tipo, rota e versão; repete a mesma mensagem só 1×/min", () => {
    configureErrorReporting({ endpoint: "https://api.test/trophy/v1/client-errors", release: "0.13.2" });
    reportError(new TypeError("quebrou"), { boundary: "route" });
    reportError(new TypeError("quebrou"), { boundary: "route" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/trophy/v1/client-errors");
    expect(init.keepalive).toBe(true);
    const body = JSON.parse(String(init.body)) as Record<string, string>;
    expect(body).toMatchObject({ kind: "render", message: "TypeError: quebrou", release: "0.13.2", route: window.location.pathname });
  });

  it("classifica contrato da API e para no teto da sessão", () => {
    configureErrorReporting({ endpoint: "https://api.test/v1/client-errors", release: "x" });
    reportError(new Error("fora do contrato"), { api_path: "/games" });
    expect(JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body)).kind).toBe("api_contract");
    for (let i = 0; i < 40; i++) reportError(new Error(`erro ${i}`));
    expect(fetchMock).toHaveBeenCalledTimes(20);
  });
});
