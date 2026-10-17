import type { z } from "zod";
import { reportError } from "@/lib/observability";
import { ApiError, CLIENT_ERROR, toApiError } from "./errors";

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions<TSchema extends z.ZodType | undefined> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Schema zod da resposta — a fronteira de runtime: o que não bate com o contrato vira erro. */
  schema?: TSchema;
  signal?: AbortSignal;
  /** Não tenta renovar/relogar em 401 — o erro volta direto para quem chamou. */
  skipAuthRetry?: boolean;
}

export interface ApiClientDeps {
  /** Base da API, mesma origem (ex.: "/api"). O client acrescenta "/v1" + o caminho. */
  baseUrl: string;
  getAccessToken: () => string | undefined;
  /**
   * Chamado em 401. `true` = token renovado (a requisição é repetida uma vez); `false` = a sessão
   * vai para o login. 5xx nunca chamam isto — erro do upstream não desloga ninguém.
   */
  onUnauthorized: () => Promise<boolean>;
}

/**
 * Client HTTP fino da API do Trophy Hunter (`<base>/v1`): injeta o Bearer, valida a resposta com
 * zod (fronteira de contrato), normaliza erros em `ApiError` e reporta só o que é falha de
 * servidor/contrato. Em 401, tenta renovar o token em silêncio e repete a requisição uma única vez.
 */
export class ApiClient {
  constructor(private readonly deps: ApiClientDeps) {}

  url(path: string, query?: Record<string, QueryValue>): string {
    const url = new URL(`${this.deps.baseUrl}/v1${path}`, window.location.origin);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  async request<TSchema extends z.ZodType | undefined = undefined>(
    path: string,
    options: RequestOptions<TSchema> = {},
  ): Promise<TSchema extends z.ZodType ? z.infer<TSchema> : unknown> {
    const response = await this.send(path, options);
    if (response.status === 204) return undefined as never;
    const body: unknown = await response.json().catch(() => undefined);
    if (!options.schema) return body as never;
    const parsed = options.schema.safeParse(body);
    if (!parsed.success) {
      const error = new ApiError(response.status, CLIENT_ERROR.invalidResponse, "Resposta fora do contrato da API.");
      reportError(error, { api_path: path, issues: parsed.error.issues.slice(0, 10) });
      throw error;
    }
    return parsed.data as never;
  }

  private async send(
    path: string,
    options: Omit<RequestOptions<z.ZodType | undefined>, "schema">,
    retried = false,
  ): Promise<Response> {
    const { method = "GET", query, body, signal } = options;
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = this.deps.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let response: Response;
    try {
      response = await fetch(this.url(path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
      throw new ApiError(0, CLIENT_ERROR.network, "Sem conexão com a API.");
    }

    if (!response.ok) {
      const error = await toApiError(response);
      if (error.isUnauthorized && !retried && !options.skipAuthRetry) {
        // Token expirou entre renovações: renova em silêncio e repete uma única vez.
        if (await this.deps.onUnauthorized()) return this.send(path, options, true);
      }
      if (error.isReportable) {
        reportError(error, { api_path: path, api_status: error.status, api_code: error.code, requestId: error.requestId });
      }
      throw error;
    }
    return response;
  }
}
