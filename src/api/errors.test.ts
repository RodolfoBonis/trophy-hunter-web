import { describe, expect, it } from "vitest";
import { ApiError, CLIENT_ERROR, isUnsupported, toApiError } from "./errors";

function problem(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });
}

describe("toApiError (RFC 7807)", () => {
  it("lê o problem+json e deriva o code do type", async () => {
    const error = await toApiError(
      problem(
        { type: "https://trophy.rb.lab/errors/needs_reconnect", title: "needs_reconnect", status: 409, detail: "reconecte a PSN" },
        409,
      ),
    );
    expect(error.code).toBe("needs_reconnect");
    expect(error.message).toBe("reconecte a PSN");
    expect(error.status).toBe(409);
    expect(error.isConflict).toBe(true);
  });

  it("prefere o `code` de negócio do problem ao derivado do type", async () => {
    const error = await toApiError(
      problem({ type: "about:blank", title: "Forbidden", status: 403, detail: "peça um convite", code: "not_invited" }, 403),
    );
    expect(error.code).toBe("not_invited");
  });

  it("mapeia errors[] por campo (422)", async () => {
    const error = await toApiError(
      problem(
        {
          type: "about:blank",
          title: "validation_error",
          status: 422,
          errors: [{ field: "api_key", code: "required" }],
        },
        422,
      ),
    );
    expect(error.isValidation).toBe(true);
    expect(error.fields.api_key).toBe("required");
  });

  it("reconhece o 404 de rota do chi como unsupported", async () => {
    const res = new Response("404 page not found", { status: 404, headers: { "Content-Type": "text/plain" } });
    const error = await toApiError(res);
    expect(error.code).toBe(CLIENT_ERROR.routeNotFound);
    expect(isUnsupported(error)).toBe(true);
  });

  it("cai num erro HTTP genérico quando o corpo não é problem+json", async () => {
    const error = await toApiError(new Response("", { status: 500 }));
    expect(error.status).toBe(500);
    expect(error.isReportable).toBe(true);
  });
});

describe("ApiError flags", () => {
  it("classifica 401/422/429", () => {
    expect(new ApiError(401, "unauthorized", "").isUnauthorized).toBe(true);
    expect(new ApiError(422, "invalid", "").isValidation).toBe(true);
    expect(new ApiError(429, "rate_limited", "").isRetryable).toBe(true);
  });
});
