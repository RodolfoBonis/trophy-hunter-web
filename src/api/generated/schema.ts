/* eslint-disable */
/** Gerado por `pnpm gen:api` a partir de /Users/rodolfodebonis/Documents/projects/trophy-hunter-api/api/openapi.yaml. Não edite à mão. */

export interface paths {
    "/games": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista a biblioteca com filtros, ordenação e paginação. */
        get: operations["listGames"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/games/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalhe do jogo com grupos, troféus e progresso. */
        get: operations["getGame"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/games/{id}/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enfileira a sincronização de um único jogo. */
        post: operations["syncGame"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/integrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista as integrações conectadas (nunca retorna segredos). */
        get: operations["listIntegrations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/integrations/{platform}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove a integração de uma plataforma. */
        delete: operations["deleteIntegration"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/integrations/{platform}/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enfileira uma sincronização da plataforma. */
        post: operations["syncPlatform"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/integrations/steam": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Conecta/atualiza a integração Steam.
         * @description Valida a API key e o SteamID64/vanity contra a Steam, grava as credenciais cifradas e enfileira um full sync. O perfil deve ser público. Nunca retorna a API key.
         */
        put: operations["connectSteam"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Dados do usuário autenticado. */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sync-runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Log de execuções de sincronização. */
        get: operations["listSyncRuns"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ConnectSteamRequest: {
            /** @description Steam Web API key (https://steamcommunity.com/dev/apikey). Nunca é retornada. */
            api_key: string;
            /** @description SteamID64 (17 dígitos) ou a vanity URL (nome do perfil). */
            steam_id_or_vanity: string;
        };
        EnqueueResponse: {
            /** @description false quando já havia um job idêntico pendente (dedupe). */
            enqueued: boolean;
            /** Format: uuid */
            job_id?: string | null;
        };
        Game: {
            abandoned?: boolean;
            cover?: string;
            external_id: string;
            has_achievements: boolean;
            has_platinum?: boolean;
            icon?: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            last_played_at?: string | null;
            notes?: string;
            np_service_name?: string | null;
            platform: components["schemas"]["Platform"];
            platforms?: string[];
            playtime_minutes?: number;
            priority?: number;
            tags?: components["schemas"]["TrophyTag"][];
            title: string;
        };
        GameDetail: components["schemas"]["Game"] & {
            groups: components["schemas"]["TrophyGroup"][];
            progress: components["schemas"]["ProgressDetail"];
        };
        GameListItem: components["schemas"]["Game"] & {
            progress: components["schemas"]["ProgressSummary"];
        };
        GameListPage: {
            items: components["schemas"]["GameListItem"][];
            limit: number;
            offset: number;
            total: number;
        };
        /** @enum {string} */
        GameStatus: "completed" | "platinum" | "almost" | "in_progress" | "not_started" | "abandoned";
        Integration: {
            account_id?: string;
            avatar?: string;
            display_name?: string;
            last_error?: string;
            /** Format: date-time */
            last_synced_at?: string | null;
            platform: components["schemas"]["Platform"];
            status: components["schemas"]["IntegrationStatus"];
        };
        /** @enum {string} */
        IntegrationStatus: "connected" | "needs_reconnect" | "error_private" | "error" | "disabled";
        /** @enum {string} */
        Platform: "steam" | "psn";
        Problem: {
            detail?: string;
            errors?: {
                code?: string;
                field?: string;
            }[];
            instance?: string;
            status: number;
            title: string;
            trace_id?: string;
            type: string;
        };
        ProgressBucket: {
            earned: number;
            remaining: number;
            total: number;
        };
        ProgressDetail: components["schemas"]["ProgressSummary"] & {
            base?: components["schemas"]["ProgressBucket"];
            by_type?: {
                [key: string]: components["schemas"]["TypeCount"];
            };
            dlc?: components["schemas"]["ProgressBucket"];
        };
        ProgressSummary: {
            /**
             * Format: double
             * @description Fração concluída por contagem (0..1).
             */
            completion_pct: number;
            earned: number;
            has_platinum?: boolean;
            platinum_earned?: boolean;
            remaining: number;
            status: components["schemas"]["GameStatus"];
            total: number;
        };
        SyncRequest: {
            /** @default incremental */
            scope: components["schemas"]["SyncScope"];
        };
        SyncRun: {
            error?: string;
            /** Format: date-time */
            finished_at?: string | null;
            /** @description Jogos cujo sync terminou (sucesso ou falha). */
            games_done?: number;
            /** @description Jogos cujo sync falhou. */
            games_failed?: number;
            /** @description Jogos a sincronizar no run (fan-out). */
            games_total?: number;
            /** Format: uuid */
            id: string;
            items_changed?: number;
            platform: components["schemas"]["Platform"];
            /** @enum {string} */
            scope: "full" | "incremental" | "game";
            /** Format: date-time */
            started_at: string;
            /** @enum {string} */
            status: "running" | "ok" | "error";
            /** @enum {string} */
            trigger: "schedule" | "manual";
        };
        /** @enum {string} */
        SyncScope: "full" | "incremental";
        Trophy: {
            /** @description Null em troféus ocultos sem descrição (spoiler guard). */
            description?: string | null;
            earned: boolean;
            /** Format: date-time */
            earned_at?: string | null;
            external_id: string;
            hidden: boolean;
            icon?: string;
            icon_locked?: string;
            /** Format: uuid */
            id: string;
            name: string;
            notes?: string;
            priority?: number;
            progress?: number | null;
            /** Format: double */
            rarity_pct?: number | null;
            server_shutdown_risk?: boolean;
            tags?: components["schemas"]["TrophyTag"][];
            target?: number | null;
            type: components["schemas"]["TrophyType"];
        };
        TrophyGroup: {
            external_id: string;
            icon?: string;
            /** Format: uuid */
            id: string;
            is_base: boolean;
            name: string;
            trophies: components["schemas"]["Trophy"][];
        };
        /** @enum {string} */
        TrophyTag: "missable" | "online" | "grind" | "difficulty" | "collectible" | "buggy";
        /** @enum {string} */
        TrophyType: "platinum" | "gold" | "silver" | "bronze" | "achievement";
        TypeCount: {
            earned: number;
            total: number;
        };
        User: {
            email?: string;
            name?: string;
            subject: string;
        };
    };
    responses: {
        /** @description Erro no formato application/problem+json (RFC 7807). */
        Problem: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["Problem"];
            };
        };
    };
    parameters: {
        GameIDPath: string;
        PlatformPath: components["schemas"]["Platform"];
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listGames: {
        parameters: {
            query?: {
                /** @description Filtra por jogos com/sem conquistas. Default true. Use "all" para não filtrar. */
                has_achievements?: "true" | "false" | "all";
                limit?: number;
                offset?: number;
                platform?: components["schemas"]["Platform"];
                /** @description Busca por título (case-insensitive, substring). */
                q?: string;
                sort?: "completion" | "remaining" | "last_played" | "title" | "rarity";
                status?: components["schemas"]["GameStatus"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GameListPage"];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    getGame: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["GameIDPath"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GameDetail"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    syncGame: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["GameIDPath"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sincronização do jogo enfileirada. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnqueueResponse"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    listIntegrations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Integration"][];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    deleteIntegration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                platform: components["parameters"]["PlatformPath"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Removida. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    syncPlatform: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                platform: components["parameters"]["PlatformPath"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SyncRequest"];
            };
        };
        responses: {
            /** @description Sincronização enfileirada (ou já havia uma pendente — ver enqueued). */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnqueueResponse"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    connectSteam: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConnectSteamRequest"];
            };
        };
        responses: {
            /** @description Integração conectada; full sync enfileirado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Integration"];
                };
            };
            401: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            /** @description Falha ao validar com a Steam (chave inválida, perfil privado, etc.). */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    listSyncRuns: {
        parameters: {
            query?: {
                limit?: number;
                platform?: components["schemas"]["Platform"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SyncRun"][];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
}
