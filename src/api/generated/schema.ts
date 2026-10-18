/* eslint-disable */
/** Gerado por `pnpm gen:api` a partir de /Users/rodolfodebonis/Documents/projects/trophy-hunter-api/api/openapi.yaml. Não edite à mão. */

export interface paths {
    "/ai/guides/{id}": {
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
        /** Grava a correção do usuário (mesmo schema do guia) ou null para voltar ao gerado. */
        patch: operations["editGuide"];
        trace?: never;
    };
    "/ai/streams/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resposta da IA em tempo real (Server-Sent Events).
         * @description id = guia ou mensagem do assistente. Eventos (data = JSON {"data": string}): `text` (pedaço do chat), `json` (pedaço do JSON do guia), `tool` ("Pesquisando: …"), `status` (aviso), `ping` (heartbeat a cada 5 s) e os finais `done` (resultado no GET correspondente) e `error` (mensagem). Retoma do header Last-Event-ID. Use fetch (o header Authorization não cabe em EventSource).
         */
        get: operations["aiStream"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/events/seen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Marca avisos como exibidos. */
        post: operations["markUnlocksSeen"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/unseen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Troféus desbloqueados ainda não exibidos (avisos/cerimônia), mais antigos primeiro (até 100).
         * @description Só desbloqueios detectados DEPOIS do sync inicial de cada conta. completes_game = o troféu fechou o jogo (PSN: platina; Steam: 100%).
         */
        get: operations["listUnseenUnlocks"];
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
    "/games/{id}/chat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Conversa ativa do jogo. */
        get: operations["getChat"];
        put?: never;
        /** Envia uma pergunta; a resposta chega por /ai/streams/{assistant.id}. Uma por vez. */
        post: operations["sendChat"];
        /** Arquiva a conversa (a próxima pergunta começa do zero). */
        delete: operations["resetChat"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/games/{id}/link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Vincula o jogo ao mesmo título na OUTRA plataforma (Steam ↔ PSN).
         * @description Vale para todas as contas que possuem cada jogo e trava a decisão — a unificação automática (match exato de título normalizado) não desfaz nem refaz vínculos manuais.
         */
        post: operations["linkGame"];
        /** Desfaz o vínculo cross-platform do jogo (decisão travada). */
        delete: operations["unlinkGame"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/games/{id}/link-candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Jogos da OUTRA plataforma para vincular, por similaridade de título (até 10). */
        get: operations["linkCandidates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/games/{id}/roadmap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Roadmap de platina/100% do jogo (null se ainda não gerado). */
        get: operations["getRoadmap"];
        put?: never;
        /** Gera (ou regenera) o roadmap a partir do progresso atual. */
        post: operations["generateRoadmap"];
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
    "/integrations/{id}/reconnect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reconecta uma conta PSN expirada com um NPSSO novo (precisa ser a mesma conta). */
        post: operations["reconnectIntegration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
    "/integrations/psn": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Conecta uma conta PSN pelo NPSSO.
         * @description Troca o NPSSO (cookie do login em playstation.com; ver https://ca.account.sony.com/api/v1/ssocookie) por access/refresh tokens e enfileira um full sync. O NPSSO nunca é gravado nem retornado; as renovações usam só o refresh token.
         */
        post: operations["connectPSN"];
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
    "/notifications/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Quais tipos de notificação estão ligados (padrão = todos). */
        get: operations["getNotificationPreferences"];
        /** Grava as preferências (objeto completo). */
        put: operations["putNotificationPreferences"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/push/key": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Se o web push está ligado, a chave pública VAPID e quantos aparelhos estão inscritos. */
        get: operations["pushStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/push/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Grava (ou atualiza) a inscrição deste navegador (PushSubscription.toJSON()). */
        post: operations["subscribePush"];
        /** Remove a inscrição deste navegador. */
        delete: operations["unsubscribePush"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/push/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Envia agora uma notificação de teste para todos os aparelhos. */
        post: operations["testPush"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Busca da paleta de comandos — jogos (até 8) e troféus (até 12). Mínimo de 2 caracteres.
         * @description Só a conta mais avançada de cada jogo. Troféus ocultos ainda não obtidos não aparecem.
         */
        get: operations["search"];
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
    "/trophies/{id}/guide": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Guia de IA do troféu (null se ainda não gerado). */
        get: operations["getTrophyGuide"];
        put?: never;
        /** Gera (ou regenera) o guia do troféu. A edição do usuário é preservada. */
        post: operations["generateTrophyGuide"];
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
        /** @description Guia de IA. content = gerado (validado pelo schema do escopo); edited_content = correção do usuário (a UI mostra a editada quando existe). status pending/running = gerando. */
        AIGuide: {
            /** @description TrophyGuideContent (scope trophy) ou RoadmapContent (scope roadmap). */
            content: components["schemas"]["TrophyGuideContent"] | components["schemas"]["RoadmapContent"] | null;
            edited_content: components["schemas"]["TrophyGuideContent"] | components["schemas"]["RoadmapContent"] | null;
            /** @description Mensagem exibível quando status = error. */
            error: string;
            /** Format: date-time */
            generated_at: string | null;
            /** Format: uuid */
            id: string;
            model: string;
            /** @enum {string} */
            scope: "trophy" | "roadmap";
            /** @enum {string} */
            status: "pending" | "running" | "ready" | "error";
            /** Format: date-time */
            updated_at: string | null;
        };
        AIGuideEnvelope: {
            guide: components["schemas"]["AIGuide"] | null;
        };
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
        ChatMessage: {
            content: string;
            /** Format: date-time */
            created_at: string | null;
            error: string;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            role: "user" | "assistant";
            /** @enum {string} */
            status: "pending" | "running" | "done" | "error";
        };
        ChatThread: {
            messages: components["schemas"]["ChatMessage"][];
        };
        ConnectPSNRequest: {
            /** @description Apelido; vazio → online ID. */
            label?: string;
            /** @description Cookie npsso do login em playstation.com. Nunca é gravado. */
            npsso: string;
        };
        ConnectSteamRequest: {
            /** @description Steam Web API key (https://steamcommunity.com/dev/apikey). Obrigatória só na primeira conta Steam; nas seguintes, omitida → reaproveita a key existente. Nunca é retornada. */
            api_key?: string;
            /** @description Apelido da conta. Vazio → nome do perfil na Steam. */
            label?: string;
            /** @description SteamID64 (17 dígitos) ou a vanity URL (nome do perfil). */
            steam_id_or_vanity: string;
        };
        CrossPlatformGame: {
            /** @description 0–1, pelo critério da plataforma. */
            completion_pct: number;
            cover: string;
            earned: number;
            external_id: string;
            /** Format: uuid */
            game_id: string;
            hero: string;
            /** Format: date-time */
            last_unlock_at: string | null;
            platform: components["schemas"]["Platform"];
            title: string;
            total: number;
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
            /** @description O mesmo jogo na outra plataforma (conta mais avançada), para ver lado a lado. */
            cross_platform: components["schemas"]["CrossPlatformGame"][];
            groups: components["schemas"]["TrophyGroup"][];
            /**
             * Format: uuid
             * @description Conta desta linha do jogo.
             */
            integration_id: string;
            progress: components["schemas"]["ProgressDetail"];
            /** @description Vínculo decidido manualmente (a unificação automática não mexe). */
            unify_locked: boolean;
        };
        /** @description Um item por jogo: o jogo unificado (Steam + PSN, cross_platform = true) ou, sem vínculo, platform + external_id. Game/progress são da conta MAIS AVANÇADA — entre plataformas, quando unificado (id = game_id dela); accounts lista as contas da plataforma desse item, mais avançada primeiro. Com filtro de plataforma, aparece a versão daquela plataforma. */
        GameListItem: components["schemas"]["Game"] & {
            accounts: components["schemas"]["GameAccount"][];
            counts: components["schemas"]["TypeCounts"];
            /** @description O jogo está vinculado ao mesmo título na outra plataforma. */
            cross_platform: boolean;
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
        LinkGameRequest: {
            /**
             * Format: uuid
             * @description Jogo da outra plataforma.
             */
            other_game_id: string;
        };
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
        NotificationPreferences: {
            /** @description Guia/roadmap pronto. */
            ai_ready: boolean;
            /** @description Platina / 100%. */
            completions: boolean;
            /** @description Conta precisa de ação (reautenticar a PSN, perfil Steam privado). */
            reconnect: boolean;
            /** @description Troféus novos. */
            unlocks: boolean;
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
        PushStatus: {
            /** @description false = chaves VAPID não configuradas no servidor. */
            enabled: boolean;
            /** @description applicationServerKey (base64url). */
            public_key: string;
            subscriptions: number;
        };
        PushSubscriptionRequest: {
            /** @description URL https do push service do navegador. */
            endpoint: string;
            keys: {
                auth: string;
                p256dh: string;
            };
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
        RoadmapContent: {
            confidence: number;
            difficulty: number;
            estimated_total_time: string;
            missables_overview: string[];
            playthroughs: number;
            sources: string[];
            stages: components["schemas"]["RoadmapStage"][];
            summary: string;
            tips: string[];
            uncertainty_notes: string;
        };
        RoadmapStage: {
            description: string;
            missables: string[];
            title: string;
            trophies: string[];
        };
        SearchResult: {
            games: {
                completion_pct: number;
                cover: string;
                external_id: string;
                hero: string;
                /** Format: uuid */
                id: string;
                platform: components["schemas"]["Platform"];
                title: string;
            }[];
            trophies: {
                earned: boolean;
                /** Format: uuid */
                game_id: string;
                game_title: string;
                icon: string;
                /** Format: uuid */
                id: string;
                name: string;
                platform: components["schemas"]["Platform"];
                rarity_pct: number | null;
                type: components["schemas"]["TrophyType"];
            }[];
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
        TrophyGuideContent: {
            confidence: number;
            difficulty: number;
            estimated_time: string;
            missable: boolean;
            point_of_no_return: string;
            prerequisites: string[];
            sources: string[];
            steps: string[];
            summary: string;
            tips: string[];
            uncertainty_notes: string;
            /** @description Onde o troféu sai (capítulo/fase/área). Ausente em guias v1. */
            where?: string;
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
        UnlockEvent: {
            /** @description Fechou o jogo (platina/100%) → cerimônia. */
            completes_game: boolean;
            cover: string;
            description: string | null;
            /** Format: date-time */
            detected_at: string | null;
            /** Format: date-time */
            earned_at: string | null;
            external_id: string;
            /** Format: uuid */
            game_id: string;
            game_title: string;
            hero: string;
            icon: string;
            /** Format: uuid */
            id: string;
            name: string;
            platform: components["schemas"]["Platform"];
            rarity_pct: number | null;
            /** Format: uuid */
            trophy_id: string;
            type: components["schemas"]["TrophyType"];
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
    editGuide: {
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
                "application/json": {
                    edited_content: components["schemas"]["TrophyGuideContent"] | components["schemas"]["RoadmapContent"] | null;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIGuide"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
        };
    };
    aiStream: {
        parameters: {
            query?: never;
            header?: {
                "Last-Event-ID"?: string;
            };
            path: {
                id: components["parameters"]["GameIDPath"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stream SSE. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
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
    markUnlocksSeen: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    ids: string[];
                };
            };
        };
        responses: {
            /** @description Marcados */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
        };
    };
    listUnseenUnlocks: {
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
                    "application/json": components["schemas"]["UnlockEvent"][];
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
    getChat: {
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
                    "application/json": components["schemas"]["ChatThread"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    sendChat: {
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
                "application/json": {
                    message: string;
                };
            };
        };
        responses: {
            /** @description Na fila. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        assistant: components["schemas"]["ChatMessage"];
                        user: components["schemas"]["ChatMessage"];
                    };
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    resetChat: {
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
            /** @description Arquivada */
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
    linkGame: {
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
                "application/json": components["schemas"]["LinkGameRequest"];
            };
        };
        responses: {
            /** @description Vinculado */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
        };
    };
    unlinkGame: {
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
            /** @description Desvinculado */
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
    linkCandidates: {
        parameters: {
            query?: {
                /** @description Busca por título (padrão = título do jogo). */
                q?: string;
            };
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
                    "application/json": components["schemas"]["CrossPlatformGame"][];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    getRoadmap: {
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
                    "application/json": components["schemas"]["AIGuideEnvelope"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    generateRoadmap: {
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
            /** @description Na fila — acompanhe em /ai/streams/{guide.id}. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIGuide"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
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
    reconnectIntegration: {
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
                "application/json": {
                    npsso: string;
                };
            };
        };
        responses: {
            /** @description Reconectada; sync incremental enfileirado. */
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
            502: components["responses"]["Problem"];
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
    connectPSN: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConnectPSNRequest"];
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
            502: components["responses"]["Problem"];
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
    getNotificationPreferences: {
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
                    "application/json": components["schemas"]["NotificationPreferences"];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    putNotificationPreferences: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotificationPreferences"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreferences"];
                };
            };
            400: components["responses"]["Problem"];
            401: components["responses"]["Problem"];
        };
    };
    pushStatus: {
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
                    "application/json": components["schemas"]["PushStatus"];
                };
            };
            401: components["responses"]["Problem"];
        };
    };
    subscribePush: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushSubscriptionRequest"];
            };
        };
        responses: {
            /** @description Inscrito */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
        };
    };
    unsubscribePush: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    endpoint: string;
                };
            };
        };
        responses: {
            /** @description Removida */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
        };
    };
    testPush: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Resultado do envio */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        failed: number;
                        /** @description Inscrições expiradas (404/410) removidas. */
                        removed: number;
                        sent: number;
                    };
                };
            };
            401: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
    search: {
        parameters: {
            query: {
                q: string;
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
                    "application/json": components["schemas"]["SearchResult"];
                };
            };
            401: components["responses"]["Problem"];
            422: components["responses"]["Problem"];
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
    getTrophyGuide: {
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
                    "application/json": components["schemas"]["AIGuideEnvelope"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    generateTrophyGuide: {
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
            /** @description Na fila — acompanhe em /ai/streams/{guide.id}. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIGuide"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            503: components["responses"]["Problem"];
        };
    };
}
