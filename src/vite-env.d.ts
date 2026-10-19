/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_OIDC_AUTHORITY?: string;
  readonly VITE_OIDC_CLIENT_ID?: string;
  readonly VITE_OIDC_SCOPE?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_AUTH_MODE?: "oidc" | "mock";
  readonly VITE_API_MOCK?: "true" | "false";
  /** Versão da imagem (tag do release), injetada no build do Dockerfile. */
  readonly VITE_APP_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
