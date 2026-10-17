# Trophy Hunter — web (PWA)

Front do **Trophy Hunter**: app pessoal (single-user) para acompanhar conquistas Steam e troféus PSN,
saber o que falta para platinar/100% e (depois) ter guias de IA. SPA em React servida como PWA, atrás
do nginx, com SSO no Keycloak (realm `platform`) e deploy no cluster rblab em `https://trophy.rb.lab`.

> **Status:** fundação + app shell (Fase 1). As telas finais aguardam a aprovação do *style tile*
> (paleta/tipografia/refs). O visual atual é neutro/escuro de propósito — ver `src/design-system/tokens.css`.

## Stack

Vite 8 · React 19 · react-router 7 · TanStack Query 5 · zod 4 · oidc-client-ts + react-oidc-context ·
Tailwind v4 · Radix (estilo shadcn, `cva` + `tailwind-merge`) · `motion` · lucide-react · vite-plugin-pwa
(injectManifest + Workbox) · Vitest + Testing Library + MSW · Playwright. **Sem Sentry** (observabilidade
é Prometheus/Grafana no cluster).

## Como rodar

```bash
pnpm install

# Dev contra a API Go local (VITE_API_BASE=http://localhost:8080/api; a API libera o CORS de localhost:5173).
# Copie .env.example → .env.local e ajuste OIDC/API se precisar.
pnpm dev

# Dev com tudo mockado (MSW + sessão fake) — não precisa de Keycloak nem da API.
pnpm dev:mock
```

### Modo mock

`pnpm dev:mock` (e o build de e2e) usa `.env.mock`: a API é interceptada pelo MSW (`src/mocks/`) com
fixtures realistas (`src/mocks/data/fixtures.ts`) e a sessão é fake (`src/auth/MockSessionProvider`).
Cenários via `?scenario=...` ou `localStorage["mock:scenario"]` — ex.: `integrations-needs-reconnect`,
`library-empty`, `no-access`.

O worker do MSW (`public/mockServiceWorker.js`) é gerado por `pnpm exec msw init public --save`.

## Scripts

| Script | O quê |
|---|---|
| `pnpm dev` / `pnpm dev:mock` | dev server (real / mockado) |
| `pnpm build` | typecheck + build de produção |
| `pnpm preview` | serve o build |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm test:e2e` | Playwright (build `--mode mock` + preview) |
| `pnpm gen:api` | gera `src/api/generated/schema.ts` do contrato OpenAPI (ver abaixo) |
| `pnpm gen:icons` | gera PNGs dos ícones a partir dos SVGs (requer `sharp`) |

### `pnpm gen:api` — contrato

Lê `../trophy-hunter-api/api/openapi.yaml` (padrão do plano) e gera os tipos em `src/api/generated/`.
**O contrato ainda não foi publicado pela API**, então por ora os schemas de runtime provisórios estão
em `src/api/schemas.ts` (modelados a partir do plano). Quando o `openapi.yaml` existir: rode `pnpm gen:api`,
faça os schemas zod espelharem o contrato e commite a saída gerada.

## Build e imagem

```bash
pnpm build                              # dist/ estático
docker build -t trophy-hunter-web .     # node:22-alpine → nginxinc/nginx-unprivileged (porta 8080)
```

Colima: `export DOCKER_HOST=unix:///Users/<você>/.colima/default/docker.sock`.

## Configuração de runtime

Uma imagem serve qualquer ambiente. No start do container, `docker/05-app-config.envsh` gera
`/config.js` (`window.__APP_CONFIG__`, validado por zod em `src/config/env.ts`) e a CSP do nginx a
partir destas envs:

| Env | Obrigatória | Default | Uso |
|---|---|---|---|
| `OIDC_AUTHORITY` | sim | — | issuer do Keycloak (ex.: `https://auth.rb.lab/realms/platform`) |
| `OIDC_CLIENT_ID` | não | `trophy-hunter-web` | client público PKCE |
| `OIDC_SCOPE` | não | `openid profile email trophy-hunter-api` | scopes; `trophy-hunter-api` é o *audience scope* (injeta `aud` no token) |
| `API_BASE_URL` | sim | — | origem da API, no padrão `api.<app>.<domínio>` (ex.: `https://api.trophy.rb.lab`) — **sem caminho** |
| `APP_ALLOW_HTTP` | não | `false` | permite `http://` na authority (só dev) |

`apiBase` = `API_BASE_URL` + `/api`. O SPA chama a API direto (cross-origin, CORS na API); o nginx
só serve estáticos. A CSP `connect-src` inclui essa origem.
Em dev usamos os `VITE_*` (`.env.local` / `.env.mock`).

## Decisões

- **Tokens em memória (`InMemoryWebStorage`).** Nem access nem refresh token tocam o disco — menor
  superfície para XSS. Ao recarregar a aba os tokens somem; o app então redireciona ao Keycloak, que
  (com a sessão SSO no cookie) devolve na hora, sem pedir login. O `automaticSilentRenew` usa o
  refresh token (em memória) durante a vida da aba. Ver `src/auth/OidcSessionProvider.tsx`.
- **Scope `trophy-hunter-api`.** É um *client scope* de audiência no Keycloak (keycloak-audience-scope):
  injeta `aud=trophy-hunter-api` no access token, que a API valida. O acesso vem da realm role
  `trophy-hunter-user` (concedida via `/admins`), não do scope.
- **Sem Sentry.** `src/lib/observability.ts` concentra o reporte de erros num ponto só (hoje
  `console.error` + breadcrumbs em memória), pronto para exportar métricas ao Prometheus depois.

## Testes

- `pnpm test` — unit/componente (config, client HTTP 401→renew→retry + contrato, guard de auth,
  biblioteca e integrações com MSW).
- `pnpm test:e2e` — smoke em mock mode (carrega a biblioteca, navegação por teclado, skip link).

## Deploy

- CI (`.github/workflows/ci.yaml`): lint, typecheck, test, build, e2e e build da imagem (runner ARC
  `arc-trophy-hunter-web`).
- Release (`.github/workflows/image-release.yaml`): tag `v*` → build/push no ECR
  `718446585908.dkr.ecr.sa-east-1.amazonaws.com/rodolfobonis/trophy-hunter-web` e bump da tag em
  `RodolfoBonis/k3s-apps` → `apps/trophy-hunter/values-web-prod.yaml` (ArgoCD sincroniza).
