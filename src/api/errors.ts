import { z } from "zod";

/**
 * Erros da API Go no formato RFC 7807 (`application/problem+json`): ver `Problem` no openapi.yaml.
 * `code` é sintético (derivado de `type` ou do status) para a UI ramificar sem depender da string.
 */
const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  trace_id: z.string().optional(),
  errors: z
    .array(z.object({ field: z.string().optional(), code: z.string().optional() }))
    .nullish(),
});

/** Corpo do 404 do chi para rota inexistente — só isso significa "feature ainda não publicada". */
const CHI_ROUTE_NOT_FOUND = "404 page not found";

/** Códigos sintéticos do client (não vêm da API). */
export const CLIENT_ERROR = {
  routeNotFound: "route_not_found",
  network: "network_error",
  invalidResponse: "invalid_response",
} as const;

export class ApiError extends Error {
  override readonly name = "ApiError";

  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Erros por campo (RFC 7807 `errors[]`): field → code. */
    readonly fields: Record<string, string> = {},
    readonly requestId?: string,
    readonly retryAfter?: number,
  ) {
    super(message || code);
  }

  /** Endpoint/método inexistente nesta versão da API → a UI esconde/desabilita o recurso, sem quebrar. */
  get isUnsupported(): boolean {
    return this.code === CLIENT_ERROR.routeNotFound || this.status === 405 || this.status === 501;
  }

  get isNotFound(): boolean {
    return this.status === 404 && !this.isUnsupported;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidation(): boolean {
    return this.status === 422 || this.status === 400;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isRetryable(): boolean {
    return this.status === 429 || this.status === 503;
  }

  /** Erros que vale reportar (falhas do servidor/contrato — não 4xx de negócio). */
  get isReportable(): boolean {
    return this.status >= 500 || this.code === CLIENT_ERROR.invalidResponse;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isUnsupported(error: unknown): boolean {
  return isApiError(error) && error.isUnsupported;
}

/** Código curto a partir do `type` (último segmento da URN/URL) ou `http_<status>`. */
function codeFromType(type: string, status: number): string {
  const last = type.split(/[/:]/).filter(Boolean).pop();
  return last && last !== "about:blank" && !/^https?$/.test(last) ? last : `http_${status}`;
}

/** Converte uma resposta não-OK em ApiError, entendendo problem+json e o 404 de rota do chi. */
export async function toApiError(response: Response): Promise<ApiError> {
  const requestId = response.headers.get("X-Request-ID") ?? undefined;
  const retryHeader = Number(response.headers.get("Retry-After"));
  const headerRetry = Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : undefined;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("json")) {
    const body: unknown = await response.json().catch(() => undefined);
    const problem = problemSchema.safeParse(body);
    if (problem.success) {
      const p = problem.data;
      const fields: Record<string, string> = {};
      for (const e of p.errors ?? []) if (e.field) fields[e.field] = e.code ?? "invalid";
      return new ApiError(p.status || response.status, codeFromType(p.type, p.status || response.status), p.detail ?? p.title, fields, p.trace_id ?? requestId, headerRetry);
    }
  }
  if (response.status === 404 && !contentType.includes("json")) {
    const text = await response.text().catch(() => "");
    if (text.trim() === CHI_ROUTE_NOT_FOUND) {
      return new ApiError(404, CLIENT_ERROR.routeNotFound, "Recurso indisponível nesta versão da API.", {}, requestId);
    }
  }
  return new ApiError(response.status, `http_${response.status}`, response.statusText, {}, requestId, headerRetry);
}
