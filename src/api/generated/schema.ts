/* eslint-disable */
/** Gerado por `pnpm gen:api` a partir de /Users/rodolfodebonis/Documents/projects/trophy-hunter-api/api/openapi.yaml. Não edite à mão. */

export interface paths {
    "/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Troféus que faltam marcados como perdíveis/online/dificuldade (ou com risco de servidor fechar). */
        get: operations["getAlerts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
        /** Marcações do usuário no jogo (abandonado, prioridade, notas, tags). */
        patch: operations["patchGame"];
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
    "/integrations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove a conta e os jogos/troféus dela. */
        delete: operations["deleteIntegration"];
        options?: never;
        head?: never;
        /** Renomeia a conta e/ou troca a API key. */
        patch: operations["updateIntegration"];
        trace?: never;
    };
    "/integrations/{id}/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enfileira uma sincronização da conta. */
        post: operations["syncIntegration"];
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
        put?: never;
        /**
         * Conecta uma nova conta Steam.
         * @description Várias contas por plataforma são suportadas. Valida o SteamID64/vanity contra a Steam, grava as credenciais cifradas e enfileira um full sync. api_key é opcional quando já existe outra conta Steam (a Steam Web API key lê qualquer perfil público e é reaproveitada). O perfil e os detalhes de jogos devem ser públicos. Nunca retorna a API key.
         */
        post: operations["connectSteam"];
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
    "/next": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fila "Próxima Platina" (ranking) e a sugestão "o que fazer hoje". */
        get: operations["getNext"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Resumo do dashboard (cada jogo conta uma vez, pela conta mais avançada). */
        get: operations["getStats"];
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
    "/timeline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Desbloqueios de todas as contas, do mais recente (paginação por cursor). */
        get: operations["getTimeline"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trophies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Marcações do usuário no troféu (tags, notas, prioridade, risco de servidor). */
        patch: operations["patchTrophy"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Alert: {
            /** Format: uuid */
            game_id: string;
            game_title: string;
            hidden: boolean;
            icon: string;
            name: string;
            platform: components["schemas"]["Platform"];
            rarity_pct?: number | null;
            server_shutdown_risk: boolean;
            tags: components["schemas"]["TrophyTag"][];
            /** Format: uuid */
            trophy_id: string;
            type: components["schemas"]["TrophyType"];
        };
        /** @description Só os campos enviados mudam. abandoned só vale para jogos. */
        Annotations: {
            abandoned?: boolean;
            notes?: string;
            priority?: number;
            server_shutdown_risk?: boolean;
            tags?: components["schemas"]["TrophyTag"][];
        };
        ConnectSteamRequest: {
            /** @description Steam Web API key (https://steamcommunity.com/dev/apikey). Obrigatória só na primeira conta Steam; nas seguintes, omitida → reaproveita a key existente. Nunca é retornada. */
            api_key?: string;
            /** @description Apelido da conta. Vazio → nome do perfil na Steam. */
            label?: string;
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
            /** @description Arte horizontal (Steam header). Vazio → use cover. */
            hero?: string;
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
        /** @description Uma conta que possui o jogo, com o progresso dela. */
        GameAccount: {
            display_name: string;
            /**
             * Format: uuid
             * @description Linha do jogo nesta conta (GET /games/{id}).
             */
            game_id: string;
            /** Format: uuid */
            integration_id: string;
            label: string;
            progress: components["schemas"]["ProgressSummary"];
        };
        GameDetail: components["schemas"]["Game"] & {
            account_label: string;
            /** @description Todas as contas que possuem o jogo (mais avançada primeiro). */
            accounts: components["schemas"]["GameAccount"][];
            groups: components["schemas"]["TrophyGroup"][];
            /**
             * Format: uuid
             * @description Conta desta linha do jogo.
             */
            integration_id: string;
            progress: components["schemas"]["ProgressDetail"];
        };
        /** @description Um item por jogo (platform + external_id). Game/progress são da conta MAIS AVANÇADA (id = game_id dela); accounts lista todas as contas que possuem o jogo, mais avançada primeiro. */
        GameListItem: components["schemas"]["Game"] & {
            accounts: components["schemas"]["GameAccount"][];
            counts: components["schemas"]["TypeCounts"];
            /**
             * Format: date-time
             * @description Desbloqueio mais recente (conta best).
             */
            last_unlock_at?: string | null;
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
            /** Format: uuid */
            id: string;
            /** @description Apelido da conta no app (ex.: Principal, Alt). */
            label: string;
            last_error?: string;
            /** Format: date-time */
            last_synced_at?: string | null;
            platform: components["schemas"]["Platform"];
            status: components["schemas"]["IntegrationStatus"];
        };
        /** @enum {string} */
        IntegrationStatus: "connected" | "needs_reconnect" | "error_private" | "error" | "disabled";
        NextPlatinum: {
            items: {
                avg_remaining_rarity: number;
                completion_pct: number;
                cover: string;
                earned: number;
                external_id: string;
                factors: {
                    completion: number;
                    ease: number;
                    priority: number;
                    remaining: number;
                    urgency: number;
                };
                /** Format: uuid */
                game_id: string;
                hero: string;
                /** Format: date-time */
                last_unlock_at?: string | null;
                min_remaining_rarity: number;
                platform: components["schemas"]["Platform"];
                priority: number;
                remaining: number;
                remaining_missable: number;
                remaining_online: number;
                score: number;
                title: string;
                total: number;
            }[];
            today?: {
                /** Format: uuid */
                game_id: string;
                trophies: components["schemas"]["RemainingTrophy"][];
            } | null;
        };
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
        /** @description Troféus GANHOS por tier — lendário < 1%, épico 1–5%, raro 5–20%, incomum 20–50%, comum ≥ 50%. */
        RarityEarned: {
            common: number;
            epic: number;
            legendary: number;
            rare: number;
            uncommon: number;
        };
        RemainingTrophy: {
            description?: string | null;
            hidden: boolean;
            icon: string;
            icon_locked: string;
            /** Format: uuid */
            id: string;
            name: string;
            rarity_pct?: number | null;
            tags: components["schemas"]["TrophyTag"][];
            type: components["schemas"]["TrophyType"];
        };
        Stats: {
            completions: {
                /** Format: date-time */
                completed_at?: string | null;
                cover: string;
                external_id: string;
                /** Format: uuid */
                game_id: string;
                hero: string;
                platform: components["schemas"]["Platform"];
                title: string;
                total: number;
            }[];
            evolution: {
                cumulative: number;
                earned: number;
                /** @description YYYY-MM */
                month: string;
            }[];
            games: {
                abandoned: number;
                almost: number;
                completed: number;
                in_progress: number;
                not_started: number;
                total: number;
            };
            rarest: {
                /** Format: date-time */
                earned_at?: string | null;
                /** Format: uuid */
                game_id: string;
                game_title: string;
                icon: string;
                /** Format: uuid */
                id: string;
                name: string;
                platform: components["schemas"]["Platform"];
                rarity_pct: number;
                type: components["schemas"]["TrophyType"];
            }[];
            trophies: {
                bronze: components["schemas"]["TypeCount"];
                earned: number;
                gold: components["schemas"]["TypeCount"];
                platinum: components["schemas"]["TypeCount"];
                rarity: components["schemas"]["RarityEarned"];
                silver: components["schemas"]["TypeCount"];
                total: number;
            };
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
            /**
             * Format: uuid
             * @description Conta do run (null se removida).
             */
            integration_id?: string | null;
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
        TimelinePage: {
            items: {
                account_label: string;
                /** @description Este desbloqueio fechou o jogo (platina/100%) na conta. */
                completes_game: boolean;
                cover: string;
                description?: string | null;
                /** Format: date-time */
                earned_at?: string | null;
                external_id: string;
                /** Format: uuid */
                game_id: string;
                game_title: string;
                hero: string;
                icon: string;
                name: string;
                platform: components["schemas"]["Platform"];
                rarity_pct?: number | null;
                /** Format: uuid */
                trophy_id: string;
                type: components["schemas"]["TrophyType"];
            }[];
            next_cursor?: string | null;
        };
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
        /** @description Troféus ganhos/total por tipo (PSN) e ganhos por tier de raridade — contadores do card. */
        TypeCounts: {
            bronze: components["schemas"]["TypeCount"];
            gold: components["schemas"]["TypeCount"];
            platinum: components["schemas"]["TypeCount"];
            rarity: components["schemas"]["RarityEarned"];
            silver: components["schemas"]["TypeCount"];
        };
        UpdateIntegrationRequest: {
            /** @description Nova Steam Web API key (validada contra a conta). */
            api_key?: string;
            label?: string;
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
        IntegrationIDPath: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getAlerts: {
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
                    "application/json": components["schemas"]["Alert"][];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    listGames: {
        parameters: {
            query?: {
                /** @description Filtra por jogos com/sem conquistas. Default true. Use "all" para não filtrar. */
                has_achievements?: "true" | "false" | "all";
                /** @description Restringe a biblioteca a UMA conta (default — todas, um item por jogo). */
                integration_id?: string;
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
    patchGame: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["GameIDPath"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Annotations"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Game"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
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
                id: components["parameters"]["IntegrationIDPath"];
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
    updateIntegration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["IntegrationIDPath"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateIntegrationRequest"];
            };
        };
        responses: {
            /** @description Conta atualizada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Integration"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            /** @description A Steam rejeitou a nova API key. */
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
    syncIntegration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["IntegrationIDPath"];
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
            /** @description Conta conectada; full sync enfileirado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Integration"];
                };
            };
            401: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
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
    getNext: {
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
                    "application/json": components["schemas"]["NextPlatinum"];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    getStats: {
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
                    "application/json": components["schemas"]["Stats"];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    listSyncRuns: {
        parameters: {
            query?: {
                integration_id?: string;
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
    getTimeline: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
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
                    "application/json": components["schemas"]["TimelinePage"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
        };
    };
    patchTrophy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["GameIDPath"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Annotations"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Trophy"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
        };
    };
}
