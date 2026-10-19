import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/mocks/node";
import { ApiClient } from "./client";
import { CLIENT_ERROR, isApiError } from "./errors";
import { userSchema } from "./schemas";

function makeClient(onUnauthorized: () => Promise<boolean>, token = { value: "old" }) {
  return new ApiClient({ baseUrl: "/api", getAccessToken: () => token.value, onUnauthorized });
}

function problem(status: number, title: string) {
  return HttpResponse.json(
    { type: `about:blank`, title, status },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

async function caught(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("esperava erro");
}

describe("ApiClient", () => {
  it("401 → renova em silêncio e repete a requisição com o token novo", async () => {
    const token = { value: "old" };
    server.use(
      http.get("*/api/v1/me", ({ request }) =>
        request.headers.get("Authorization") === "Bearer new"
          ? HttpResponse.json({ id: "id1", subject: "u1", name: "Rodolfo", email: "r@rb.lab", role: "owner", status: "active", share_progress: false })
          : problem(401, "unauthorized"),
      ),
    );
    const onUnauthorized = vi.fn(async () => {
      token.value = "new";
      return true;
    });
    const me = await makeClient(onUnauthorized, token).request("/me", { schema: userSchema });
    expect(me.subject).toBe("u1");
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("401 sem renovação possível → propaga o erro (o provider cuida do redirect)", async () => {
    server.use(http.get("*/api/v1/me", () => problem(401, "unauthorized")));
    const onUnauthorized = vi.fn(async () => false);
    const error = await caught(makeClient(onUnauthorized).request("/me"));
    expect(isApiError(error) && error.status).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("401 depois do retry não entra em loop", async () => {
    server.use(http.get("*/api/v1/me", () => problem(401, "unauthorized")));
    const onUnauthorized = vi.fn(async () => true);
    await caught(makeClient(onUnauthorized).request("/me"));
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("5xx do upstream não desloga", async () => {
    server.use(http.get("*/api/v1/games", () => problem(502, "upstream_error")));
    const onUnauthorized = vi.fn(async () => true);
    const error = await caught(makeClient(onUnauthorized).request("/games"));
    expect(isApiError(error) && error.status).toBe(502);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("falha de rede vira network_error", async () => {
    server.use(http.get("*/api/v1/me", () => HttpResponse.error()));
    const error = await caught(makeClient(async () => false).request("/me"));
    expect(isApiError(error) && error.code).toBe(CLIENT_ERROR.network);
  });

  it("resposta fora do contrato vira invalid_response", async () => {
    server.use(http.get("*/api/v1/me", () => HttpResponse.json({ nope: true })));
    const error = await caught(makeClient(async () => false).request("/me", { schema: userSchema }));
    expect(isApiError(error) && error.code).toBe(CLIENT_ERROR.invalidResponse);
  });
});
