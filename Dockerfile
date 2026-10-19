# syntax=docker/dockerfile:1.7
# Trophy Hunter web (Vite SPA/PWA) → nginx não-root. Uma imagem serve qualquer ambiente: a
# configuração (OIDC, API) é injetada no start via /config.js (ver docker/05-app-config.envsh), e o
# a origem da API (subdomínio próprio) vem de API_BASE_URL no start do container.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- deps: manifests primeiro para cache ----------------------------------------------------------
FROM base AS deps
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- build -----------------------------------------------------------------------------------------
FROM base AS build
ARG VERSION=dev
COPY --from=deps /app/ ./
COPY . .
RUN VITE_APP_RELEASE=${VERSION} pnpm build \
    # O worker do MSW só existe para o modo mock (dev/e2e) — não vai para a imagem.
    && rm -f dist/mockServiceWorker.js

# --- runtime: nginx sem root (uid 101), porta 8080 --------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
ARG VERSION=dev
ENV APP_RELEASE=${VERSION} \
    NGINX_ENVSUBST_OUTPUT_DIR=/tmp/nginx-conf.d
USER root
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker/05-app-config.envsh /docker-entrypoint.d/05-app-config.envsh
COPY --from=build /app/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
