import { delay, http, HttpResponse } from "msw";
import type {
  AIGuide,
  ChatMessage,
  RoadmapContent,
  TrophyGuideContent,
} from "@/api/schemas";
import { db } from "../data/db";
import { API, apiError } from "../http";
import { hasScenario } from "../scenario";

/* IA no modo mock: o POST cria o pedido (pending) e a "geração" acontece quando o browser abre a
 * stream SSE — pedaços de JSON/texto com pequenos atrasos, como o ai-worker real. Cenário
 * `ai-error` faz a geração falhar. */

const MOCK_GUIDE: TrophyGuideContent = {
  where: "Capítulo 7 — Castelo Tempestuoso (Stormveil Castle), arena do chefe",
  summary: "Derrote o chefe final na dificuldade Normal ou superior.",
  steps: [
    "Avance a campanha até o capítulo final.",
    "Antes da arena, equipe a armadura de fogo.",
    "Derrote o chefe — a segunda fase tem ataques de área.",
  ],
  prerequisites: ["Ter terminado o capítulo 6"],
  missable: false,
  point_of_no_return: "",
  difficulty: 6,
  estimated_time: "1–2 h",
  tips: ["Guarde as poções de cura para a segunda fase."],
  confidence: 0.55,
  uncertainty_notes: "Fontes divergem sobre a dificuldade mínima exigida.",
  sources: ["https://www.powerpyx.com/", "https://psnprofiles.com/"],
};

const MOCK_ROADMAP: RoadmapContent = {
  summary: "Uma jogada completa e uma limpeza curta pós-jogo.",
  difficulty: 5,
  estimated_total_time: "25–30 h",
  playthroughs: 1,
  stages: [
    {
      title: "Campanha",
      description: "Jogue a história explorando cada área.",
      trophies: ["Lorde Éldero"],
      missables: ["Diário do capitão (capítulo 3)"],
    },
    {
      title: "Pós-jogo",
      description: "Limpe colecionáveis e desafios restantes.",
      trophies: ["Mestre das Grandes Runas (perdível)", "Colecionador"],
      missables: ["Grandes Runas antes de enfrentar o chefe final"],
    },
  ],
  missables_overview: ["Diário do capitão (capítulo 3)"],
  tips: ["Use a seleção de capítulos para colecionáveis."],
  confidence: 0.8,
  uncertainty_notes: "",
  sources: ["https://www.powerpyx.com/"],
};

const now = () => new Date().toISOString();
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Math.random().toString(16).slice(2)}`;

function newGuide(scope: AIGuide["scope"], prev?: AIGuide): AIGuide {
  return {
    id: prev?.id ?? uid(),
    scope,
    status: "pending",
    content: prev?.content ?? null,
    edited_content: prev?.edited_content ?? null,
    model: "sonnet",
    error: "",
    generated_at: prev?.generated_at ?? null,
    updated_at: now(),
  };
}

function findGuide(id: string): AIGuide | undefined {
  return Object.values(db.aiGuides).find((g) => g.id === id);
}

function findAssistant(id: string): ChatMessage | undefined {
  return Object.values(db.chats)
    .flat()
    .find((m) => m.id === id && m.role === "assistant");
}

/** Resposta SSE que emite os eventos com atraso e chama `finish` antes do evento final. */
function sse(events: [string, string][], finish: () => void): Response {
  const enc = new TextEncoder();
  const step = hasScenario("ai-slow") ? 400 : 25;
  let n = 0;
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const [type, data] of events) {
        await delay(step);
        if (type === "done" || type === "error") finish();
        controller.enqueue(
          enc.encode(
            `id: ${++n}-0\nevent: ${type}\ndata: ${JSON.stringify({ data })}\n\n`,
          ),
        );
      }
      controller.close();
    },
  });
  return new HttpResponse(body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

const chunks = (s: string, size = 18) =>
  Array.from({ length: Math.ceil(s.length / size) }, (_, i) =>
    s.slice(i * size, (i + 1) * size),
  );

export const aiHandlers = [
  http.get(`${API}/trophies/:id/guide`, ({ params }) =>
    HttpResponse.json({ guide: db.aiGuides[`trophy:${params.id}`] ?? null }),
  ),
  http.post(`${API}/trophies/:id/guide`, ({ params }) => {
    const key = `trophy:${params.id}`;
    db.aiGuides[key] = newGuide("trophy", db.aiGuides[key]);
    return HttpResponse.json(db.aiGuides[key], { status: 202 });
  }),
  http.get(`${API}/games/:id/roadmap`, ({ params }) =>
    HttpResponse.json({ guide: db.aiGuides[`roadmap:${params.id}`] ?? null }),
  ),
  http.post(`${API}/games/:id/roadmap`, ({ params }) => {
    const key = `roadmap:${params.id}`;
    db.aiGuides[key] = newGuide("roadmap", db.aiGuides[key]);
    return HttpResponse.json(db.aiGuides[key], { status: 202 });
  }),
  http.patch(`${API}/ai/guides/:id`, async ({ params, request }) => {
    const g = findGuide(String(params.id));
    if (!g) return apiError(404, "not_found", "Guia não encontrado.");
    const body = (await request.json()) as { edited_content: unknown };
    g.edited_content = body.edited_content ?? null;
    g.updated_at = now();
    return HttpResponse.json(g);
  }),

  http.get(`${API}/games/:id/chat`, ({ params }) =>
    HttpResponse.json({ messages: db.chats[String(params.id)] ?? [] }),
  ),
  http.post(`${API}/games/:id/chat`, async ({ params, request }) => {
    const { message } = (await request.json()) as { message: string };
    if (!message?.trim())
      return apiError(422, "validation", "mensagem vazia", [
        { field: "message", code: "required" },
      ]);
    const list = (db.chats[String(params.id)] ??= []);
    if (
      list.some(
        (m) =>
          m.role === "assistant" &&
          (m.status === "pending" || m.status === "running"),
      )
    ) {
      return apiError(
        409,
        "conflict",
        "já há uma resposta em andamento nesta conversa",
      );
    }
    const user: ChatMessage = {
      id: uid(),
      role: "user",
      content: message.trim(),
      status: "done",
      error: "",
      created_at: now(),
    };
    const assistant: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
      status: "pending",
      error: "",
      created_at: now(),
    };
    list.push(user, assistant);
    return HttpResponse.json({ user, assistant }, { status: 202 });
  }),
  http.delete(`${API}/games/:id/chat`, ({ params }) => {
    delete db.chats[String(params.id)];
    return new HttpResponse(null, { status: 204 });
  }),

  /* Stream: gera ao conectar (guia → JSON em pedaços; chat → texto em pedaços). */
  http.get(`${API}/ai/streams/:id`, ({ params }) => {
    const id = String(params.id);
    const fail = hasScenario("ai-error");
    const guide = findGuide(id);
    if (guide) {
      if (guide.status === "ready") return sse([["done", ""]], () => {});
      if (guide.status === "error")
        return sse([["error", guide.error]], () => {});
      guide.status = "running";
      const content = guide.scope === "trophy" ? MOCK_GUIDE : MOCK_ROADMAP;
      const events: [string, string][] = [
        ["status", "Na fila"],
        ["tool", "Pesquisando: guia de troféus"],
        ...chunks(JSON.stringify(content)).map((c): [string, string] => [
          "json",
          c,
        ]),
        fail
          ? ["error", "A IA não conseguiu responder. Tente de novo."]
          : ["done", ""],
      ];
      return sse(events, () => {
        if (fail)
          Object.assign(guide, {
            status: "error",
            error: "A IA não conseguiu responder. Tente de novo.",
          });
        else
          Object.assign(guide, {
            status: "ready",
            content,
            generated_at: now(),
            updated_at: now(),
          });
      });
    }
    const msg = findAssistant(id);
    if (!msg) return apiError(404, "not_found", "resposta não encontrada");
    if (msg.status === "done") return sse([["done", ""]], () => {});
    msg.status = "running";
    const answer =
      "Pelo seu progresso, **nada perdível ficou para trás**.\n\n- Faça primeiro o *Diário do capitão*\n- Depois limpe os colecionáveis";
    return sse(
      [
        ["tool", "Pesquisando: perdíveis"],
        ...chunks(answer, 12).map((c): [string, string] => ["text", c]),
        fail ? ["error", "A IA não conseguiu responder."] : ["done", ""],
      ],
      () => {
        if (fail)
          Object.assign(msg, {
            status: "error",
            error: "A IA não conseguiu responder.",
          });
        else Object.assign(msg, { status: "done", content: answer });
      },
    );
  }),
];
