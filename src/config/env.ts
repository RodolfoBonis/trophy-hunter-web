import { z } from "zod";

/**
 * Configuração do app. Uma imagem serve qualquer ambiente: no container, `/config.js` é gerado no
 * start a partir das envs e define `window.__APP_CONFIG__`; em dev/test caímos nos `VITE_*` do build.
 * Validado com zod — configuração inválida falha cedo e de forma legível (ver `BootError`).
 */
const runtimeSchema = z.object({
  oidcAuthority: z.string().optional(),
  oidcClientId: z.string().optional(),
  oidcScope: z.string().optional(),
  apiBase: z.string().optional(),
});

const configSchema = z.object({
  oidcAuthority: z.url(),
  oidcClientId: z.string().min(1),
  /**
   * Scopes OIDC. Além de `openid profile email`, pedimos o audience scope `trophy-hunter-api`:
   * no Keycloak ele é um client scope do tipo "audience" (keycloak-audience-scope) que injeta
   * `aud=trophy-hunter-api` no access token — é o que a API valida. O acesso em si vem da realm role
   * `trophy-hunter-user` (concedida via /admins), não do scope.
   */
  oidcScope: z.string().min(1),
  /** Base da API (origem do subdomínio api.<app>.<domínio> + "/api"; o client acrescenta /v1/...). */
  apiBase: z.string().transform((value) => value.replace(/\/+$/, "")),
  /** Sessão fake (sem Keycloak) — só em `--mode mock` (dev local e e2e). */
  authMode: z.enum(["oidc", "mock"]),
  /** API mockada via MSW — só em `--mode mock`. */
  apiMock: z.boolean(),
});

export type AppConfig = z.infer<typeof configSchema>;

declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, unknown>;
  }
}

function blankToUndefined(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value.trim() : undefined;
}

/** Modo mock só existe em dev e no build `--mode mock` (e2e); em produção é erro de build. */
function assertNoMockInProduction(env: ImportMetaEnv): void {
  const mock = env.VITE_AUTH_MODE === "mock" || env.VITE_API_MOCK === "true";
  if (mock && env.PROD && env.MODE !== "mock") {
    throw new Error("VITE_AUTH_MODE/VITE_API_MOCK de mock num build de produção.");
  }
}

export function loadConfig(): AppConfig {
  const runtime = runtimeSchema.parse(typeof window === "undefined" ? {} : (window.__APP_CONFIG__ ?? {}));
  const env = import.meta.env;
  assertNoMockInProduction(env);
  const config = configSchema.parse({
    oidcAuthority: blankToUndefined(runtime.oidcAuthority) ?? env.VITE_OIDC_AUTHORITY,
    oidcClientId: blankToUndefined(runtime.oidcClientId) ?? env.VITE_OIDC_CLIENT_ID ?? "trophy-hunter-web",
    oidcScope: blankToUndefined(runtime.oidcScope) ?? env.VITE_OIDC_SCOPE ?? "openid profile email trophy-hunter-api",
    apiBase: blankToUndefined(runtime.apiBase) ?? env.VITE_API_BASE ?? "/api",
    // Os modos mock são decididos em build (não por runtime config) para nunca vazarem p/ produção.
    authMode: env.VITE_AUTH_MODE === "mock" ? "mock" : "oidc",
    apiMock: env.VITE_API_MOCK === "true",
  });
  assertHttps(config, env.DEV);
  return config;
}

/** Fora do dev local, Keycloak só por HTTPS (token nunca em texto claro). */
export function assertHttps(config: Pick<AppConfig, "oidcAuthority">, dev: boolean): void {
  if (dev) return;
  if (new URL(config.oidcAuthority).protocol !== "https:") {
    throw new Error("OIDC_AUTHORITY precisa ser https:// fora do ambiente de desenvolvimento.");
  }
}

let cached: AppConfig | undefined;

/** Config memoizada (lida uma vez no boot). */
export function getConfig(): AppConfig {
  cached ??= loadConfig();
  return cached;
}

/** Só para testes. */
export function setConfigForTests(config: AppConfig): void {
  cached = config;
}
