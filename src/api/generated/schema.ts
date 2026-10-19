/* eslint-disable */
/** Gerado por `pnpm gen:api` a partir de /Users/rodolfodebonis/Documents/projects/trophy-hunter-api/api/openapi.yaml. Não edite à mão. */

export interface paths {
    "/admin/invites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Convites ainda válidos. Só o dono. */
        get: operations["listInvites"];
        put?: never;
        /** Cria um link de convite (uso único, válido por 7 dias). Só o dono. */
        post: operations["createInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/invites/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoga um convite. Só o dono. */
        delete: operations["revokeInvite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Quem já entrou (ativos e removidos), dono primeiro. Só o dono. */
        get: operations["listMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/members/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoga o acesso de um membro; com purge=true apaga a pessoa e todos os dados dela. */
        delete: operations["removeMember"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/client-errors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Erro do app no navegador (aberto, sem token; limite por origem). Vira log e métrica. */
        post: operations["reportClientError"];
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
    "/games/{id}/compare/{friendId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Seus troféus deste jogo contra os de um amigo que compartilha. */
        get: operations["compareGame"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/games/{id}/friends": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Progresso dos amigos (que compartilham) no mesmo jogo — Steam × PSN pelo título. */
        get: operations["getGameFriends"];
        put?: never;
        post?: never;
        delete?: never;
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
    "/invites/{code}/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Aceita um convite — quem está "pending" (ou foi removido sem purge) vira membro ativo. */
        post: operations["acceptInvite"];
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
    "/me/sharing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Liga/desliga "compartilhar meu progresso com os amigos" (opt-in). */
        put: operations["putSharing"];
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
    "/recap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrospectiva ("Wrapped") de um mês ou ano. */
        get: operations["getRecap"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recap/weekly": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Resumo semanal da IA mais recente (recap null = nunca houve). */
        get: operations["getWeeklyRecap"];
        put?: never;
        /** Gera o resumo desta semana agora (se ainda não houver). Não conta no teto diário. */
        post: operations["generateWeeklyRecap"];
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
    "/social/challenges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Desafios de que você participa (abertos primeiro). */
        get: operations["listChallenges"];
        put?: never;
        /** Cria um desafio e convida amigos que compartilham (push para os convidados). */
        post: operations["createChallenge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/social/challenges/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Desafio com o placar ao vivo (só participantes). */
        get: operations["getChallenge"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/social/challenges/{id}/{action}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** accept/decline (convidado) ou cancel (quem criou, só aberto). */
        post: operations["actChallenge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/social/feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Platinas, jogos fechados e troféus raros (< 5%) dos membros que compartilham. */
        get: operations["getFeed"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/social/friends/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Perfil de um membro que compartilha (resumo igual ao /stats). */
        get: operations["getFriend"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/social/friends/{id}/games": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Biblioteca de um membro que compartilha (só leitura; mesmos filtros do GET /games). */
        get: operations["listFriendGames"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/social/leaderboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Placar entre os membros que compartilham (inclui você). */
        get: operations["getLeaderboard"];
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
        ChallengeDetail: components["schemas"]["ChallengeSummary"] & {
            /** Format: date-time */
            finished_at: string | null;
            standings: components["schemas"]["ChallengeStanding"][];
            winner: components["schemas"]["SocialUser"] | null;
        };
        ChallengeGame: {
            cover: string;
            external_id: string;
            platform: components["schemas"]["Platform"];
            title: string;
        };
        ChallengeStanding: {
            /** Format: date-time */
            completed_at: string | null;
            completion_pct: number;
            earned: number;
            has_game: boolean;
            /** @description most_*: troféus (ou raros) obtidos na janela. */
            score: number;
            /** @enum {string} */
            state: "invited" | "accepted" | "declined";
            total: number;
            user: components["schemas"]["SocialUser"];
        };
        ChallengeSummary: {
            accepted_count: number;
            /**
             * Format: date-time
             * @description null = sem prazo (só first_to_complete).
             */
            ends_at: string | null;
            game: components["schemas"]["ChallengeGame"] | null;
            /** Format: uuid */
            id: string;
            is_creator: boolean;
            /** @enum {string} */
            kind: "first_to_complete" | "most_trophies" | "most_rare";
            /** @enum {string} */
            my_state: "invited" | "accepted" | "declined";
            /** Format: date-time */
            starts_at: string | null;
            /** @enum {string} */
            status: "open" | "finished" | "canceled";
            title: string;
            winner_name: string | null;
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
        CompareTrophy: {
            description: string | null;
            friend: boolean;
            /** Format: date-time */
            friend_earned_at: string | null;
            hidden: boolean;
            icon: string;
            /** @description O troféu existe na versão do amigo (Steam × PSN casam pelo nome). */
            matched: boolean;
            mine: boolean;
            /** Format: date-time */
            mine_earned_at: string | null;
            name: string;
            rarity_pct: number | null;
            /** Format: uuid */
            trophy_id: string;
            type: components["schemas"]["TrophyType"];
        };
        ConnectPSNRequest: {
            /** @description Apelido; vazio → online ID. */
            label?: string;
            /** @description Cookie npsso do login em playstation.com. Nunca é gravado. */
            npsso: string;
        };
        ConnectSteamRequest: {
            /** @description Steam Web API key (https://steamcommunity.com/dev/apikey). Opcional: omitida → usa a key de outra conta Steam da mesma pessoa ou a key do servidor (basta informar o perfil). Nunca é retornada. */
            api_key?: string;
            /** @description Apelido da conta. Vazio → nome do perfil na Steam. */
            label?: string;
            /** @description SteamID64 (17 dígitos) ou a vanity URL (nome do perfil). */
            steam_id_or_vanity: string;
        };
        CreateChallengeRequest: {
            /** @description most_*: 7, 14 ou 30 (padrão 7). first_to_complete: prazo opcional 7/14/30/60/90. */
            days?: number;
            friend_ids: string[];
            /**
             * Format: uuid
             * @description Seu jogo (first_to_complete).
             */
            game_id?: string;
            /** @enum {string} */
            kind: "first_to_complete" | "most_trophies" | "most_rare";
            title?: string;
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
        FeedItem: {
            completes_game: boolean;
            cover: string;
            /** @description null em troféu oculto (spoiler). */
            description: string | null;
            /** Format: date-time */
            earned_at: string | null;
            external_id: string;
            game_title: string;
            hero: string;
            hidden: boolean;
            icon: string;
            /** @enum {string} */
            kind: "platinum" | "completion" | "rare";
            name: string;
            platform: components["schemas"]["Platform"];
            rarity_pct: number | null;
            /** Format: uuid */
            trophy_id: string;
            type: components["schemas"]["TrophyType"];
            user: components["schemas"]["SocialUser"];
        };
        FeedPage: {
            items: components["schemas"]["FeedItem"][];
            next_cursor: string | null;
        };
        FriendProfile: {
            stats: components["schemas"]["Stats"];
            user: components["schemas"]["SocialUser"];
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
        GameCompare: {
            friend: components["schemas"]["SocialUser"];
            friend_completion_pct: number;
            friend_earned: number;
            friend_platform: components["schemas"]["Platform"];
            friend_total: number;
            same_platform: boolean;
            trophies: components["schemas"]["CompareTrophy"][];
        };
        GameDetail: components["schemas"]["Game"] & {
            account_label: string;
            /** @description Todas as contas que possuem o jogo (mais avançada primeiro). */
            accounts: components["schemas"]["GameAccount"][];
            /** @description O mesmo jogo na outra plataforma (conta mais avançada), para ver lado a lado. */
            cross_platform: components["schemas"]["CrossPlatformGame"][];
            estimate: components["schemas"]["GameEstimate"] | null;
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
        /** @description Tempos do HowLongToBeat para o título (horas). Preenchido em segundo plano. */
        GameEstimate: {
            /** @description 100% (platina). */
            completionist_h: number | null;
            /** @description História + extras. */
            extra_h: number | null;
            /** @description Quanto falta para 100% (proporcional ao progresso). */
            hours_left: number | null;
            /** @description História principal. */
            main_h: number | null;
            source_url: string;
        };
        GameFriend: {
            completion_pct: number;
            earned: number;
            has_platinum: boolean;
            /** Format: date-time */
            last_unlock_at: string | null;
            platform: components["schemas"]["Platform"];
            total: number;
            user: components["schemas"]["SocialUser"];
        };
        GameFriends: {
            items: components["schemas"]["GameFriend"][];
            /** @description false = quem pede não compartilha (items vazio). */
            sharing: boolean;
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
        Invite: {
            /** Format: date-time */
            created_at: string | null;
            /** Format: date-time */
            expires_at: string | null;
            /** Format: uuid */
            id: string;
            max_uses: number;
            /** @description Link do convite — só na criação (o código não fica guardado). */
            url?: string;
            used_count: number;
        };
        Leaderboard: {
            items: components["schemas"]["LeaderboardItem"][];
            /** @enum {string} */
            period: "month" | "year" | "all";
        };
        LeaderboardItem: {
            /** @description Jogos fechados (platina/100%) no período. */
            completed: number;
            /** @description Troféus/conquistas obtidos no período. */
            earned: number;
            /** Format: date-time */
            last_unlock_at: string | null;
            platinum: number;
            /** @description Pontos PSN (15/30/90/300) no período. */
            psn_points: number;
            /** @description Obtidos com raridade < 5%. */
            rare: number;
            user: components["schemas"]["SocialUser"];
        };
        LinkGameRequest: {
            /**
             * Format: uuid
             * @description Jogo da outra plataforma.
             */
            other_game_id: string;
        };
        Member: {
            /** @description Contas Steam/PSN conectadas. */
            accounts: number;
            /** Format: date-time */
            created_at: string | null;
            email: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            last_seen_at: string | null;
            name: string;
            /** @enum {string} */
            role: "owner" | "member";
            /** @enum {string} */
            status: "pending" | "active" | "removed";
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
                    /** @description Bônus de poucas horas restantes (0 sem estimativa). */
                    time: number;
                    urgency: number;
                };
                /** Format: uuid */
                game_id: string;
                hero: string;
                /** @description Horas que faltam (proporcional ao progresso). */
                hours_left: number | null;
                /** @description Horas para 100% (HowLongToBeat); null = sem estimativa. */
                hours_total: number | null;
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
            /** @description Desafios entre amigos (convite, avanço, resultado). */
            challenges: boolean;
            /** @description Platina / 100%. */
            completions: boolean;
            /** @description Conta precisa de ação (reautenticar a PSN, perfil Steam privado). */
            reconnect: boolean;
            /** @description Troféus novos. */
            unlocks: boolean;
            /** @description Resumo semanal da IA (domingo à noite). Opt-in: liga a geração e o aviso. */
            weekly_recap: boolean;
        };
        /** @enum {string} */
        Platform: "steam" | "psn";
        Problem: {
            /** @description Código estável para a UI reagir: not_invited (sem convite aceito), member_removed (acesso revogado), invite_invalid, ai_daily_limit (teto diário de IA do membro). */
            code?: string;
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
        /** @description Retrospectiva do período (calculada na hora; fuso de Brasília; jogos pela conta mais avançada). */
        Recap: {
            achievements: number;
            active_days: number;
            /** Format: date-time */
            best_day: string | null;
            best_day_count: number;
            bronze: number;
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
            earned: number;
            favorite_weekday: string;
            games: number;
            gold: number;
            /** @example outubro de 2026 */
            label: string;
            longest_streak: number;
            /** @description O período ainda não acabou. */
            partial: boolean;
            /** @example 2026-10 */
            period: string;
            platinum: number;
            /** @description Mesmo total no período anterior. */
            previous_earned: number;
            rare: number;
            rarest: {
                /** Format: date-time */
                earned_at: string | null;
                game_title: string;
                hidden: boolean;
                icon: string;
                name: string;
                platform: components["schemas"]["Platform"];
                rarity_pct: number;
                type: components["schemas"]["TrophyType"];
            }[];
            silver: number;
            top_games: {
                cover: string;
                earned: number;
                external_id: string;
                /** Format: uuid */
                game_id: string;
                hero: string;
                platform: components["schemas"]["Platform"];
                title: string;
                total: number;
                unlocked: number;
            }[];
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
        SocialUser: {
            /** Format: uuid */
            id: string;
            is_me: boolean;
            name: string;
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
        /** @description Usuário do app. status pending = logou mas ainda não aceitou convite (só /me e o aceite funcionam; o resto responde 403 code not_invited); removed = acesso revogado pelo dono. */
        User: {
            email: string;
            /** Format: uuid */
            id: string;
            name: string;
            /** @enum {string} */
            role: "owner" | "member";
            /** @description Compartilha o progresso com os outros membros (e vê o deles). Opt-in, começa false. */
            share_progress: boolean;
            /** @enum {string} */
            status: "pending" | "active" | "removed";
            subject: string;
        };
        WeeklyRecap: {
            content: components["schemas"]["WeeklyRecapContent"] | null;
            error: string | null;
            /** @enum {string} */
            status: "pending" | "ready" | "error";
            /** Format: date-time */
            updated_at: string | null;
            /**
             * Format: date
             * @description Segunda-feira da semana.
             */
            week: string;
        };
        WeeklyRecapContent: {
            encouragement: string;
            headline: string;
            highlights: string[];
            suggestions: {
                game: string;
                trophies: string[];
                why: string;
            }[];
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
    listInvites: {
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
                    "application/json": components["schemas"]["Invite"][];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    createInvite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Convite criado (url só aparece aqui) */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Invite"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    revokeInvite: {
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
            /** @description Revogado */
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
    listMembers: {
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
                    "application/json": components["schemas"]["Member"][];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    removeMember: {
        parameters: {
            query?: {
                purge?: boolean;
            };
            header?: never;
            path: {
                id: components["parameters"]["GameIDPath"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Removido */
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
    reportClientError: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    kind?: "render" | "unhandled" | "api_contract" | "network" | "other";
                    message: string;
                    /** @description Versão do web. */
                    release?: string;
                    /** @description Path da tela (sem query). */
                    route?: string;
                    stack?: string;
                    user_agent?: string;
                };
            };
        };
        responses: {
            /** @description Registrado */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Problem"];
            /** @description Limite por origem excedido */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
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
    compareGame: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                friendId: string;
                id: string;
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
                    "application/json": components["schemas"]["GameCompare"];
                };
            };
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    getGameFriends: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
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
                    "application/json": components["schemas"]["GameFriends"];
                };
            };
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
    acceptInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Membro ativo */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            401: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
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
    putSharing: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    share_progress: boolean;
                };
            };
        };
        responses: {
            /** @description Usuário atualizado */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            400: components["responses"]["Problem"];
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
    getRecap: {
        parameters: {
            query?: {
                /** @description AAAA-MM ou AAAA (padrão: mês corrente). */
                period?: string;
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
                    "application/json": components["schemas"]["Recap"];
                };
            };
            400: components["responses"]["Problem"];
        };
    };
    getWeeklyRecap: {
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
                    "application/json": {
                        recap: components["schemas"]["WeeklyRecap"] | null;
                    };
                };
            };
        };
    };
    generateWeeklyRecap: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pendente ou já existente */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        recap: components["schemas"]["WeeklyRecap"];
                    };
                };
            };
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
    listChallenges: {
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
                    "application/json": components["schemas"]["ChallengeSummary"][];
                };
            };
            403: components["responses"]["Problem"];
        };
    };
    createChallenge: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateChallengeRequest"];
            };
        };
        responses: {
            /** @description Criado */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChallengeDetail"];
                };
            };
            400: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
        };
    };
    getChallenge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
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
                    "application/json": components["schemas"]["ChallengeDetail"];
                };
            };
            404: components["responses"]["Problem"];
        };
    };
    actChallenge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                action: "accept" | "decline" | "cancel";
                id: string;
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
                    "application/json": components["schemas"]["ChallengeDetail"];
                };
            };
            404: components["responses"]["Problem"];
            409: components["responses"]["Problem"];
        };
    };
    getFeed: {
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
                    "application/json": components["schemas"]["FeedPage"];
                };
            };
            400: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
        };
    };
    getFriend: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
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
                    "application/json": components["schemas"]["FriendProfile"];
                };
            };
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    listFriendGames: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                q?: string;
                sort?: "completion" | "remaining" | "last_played" | "title" | "rarity";
                status?: components["schemas"]["GameStatus"];
            };
            header?: never;
            path: {
                id: string;
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
                    "application/json": components["schemas"]["GameListPage"];
                };
            };
            403: components["responses"]["Problem"];
            404: components["responses"]["Problem"];
        };
    };
    getLeaderboard: {
        parameters: {
            query?: {
                period?: "month" | "year" | "all";
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
                    "application/json": components["schemas"]["Leaderboard"];
                };
            };
            400: components["responses"]["Problem"];
            403: components["responses"]["Problem"];
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
