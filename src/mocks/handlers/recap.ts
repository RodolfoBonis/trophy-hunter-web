import { http, HttpResponse } from "msw";
import type { Recap, WeeklyRecap } from "@/api/schemas";
import { API, ago, DAY } from "../http";
import { hasScenario } from "../scenario";

/** Retrospectiva e resumo semanal no modo mock. Cenário `recap-empty` = período sem nada. */
let weekly: WeeklyRecap | null = null;

export function resetRecap(): void {
  weekly = null;
}

function recap(period: string): Recap {
  const empty = hasScenario("recap-empty");
  const n = (v: number) => (empty ? 0 : v);
  return {
    period,
    label: /^\d{4}$/.test(period) ? period : "outubro de 2026",
    partial: true,
    earned: n(87),
    previous_earned: 54,
    platinum: n(2),
    gold: n(9),
    silver: n(14),
    bronze: n(40),
    achievements: n(22),
    rare: n(6),
    games: n(5),
    active_days: n(12),
    longest_streak: n(5),
    favorite_weekday: empty ? "" : "sábado",
    best_day: empty ? null : ago(4 * DAY),
    best_day_count: n(19),
    top_games: empty
      ? []
      : [
          { game_id: "11111111-1111-1111-1111-111111111111", title: "ELDEN RING", platform: "steam", external_id: "1245620", cover: "", hero: "", unlocked: 21, earned: 28, total: 42 },
          { game_id: "22222222-2222-2222-2222-222222222222", title: "God of War Ragnarök", platform: "psn", external_id: "NPWR21528_00", cover: "", hero: "", unlocked: 14, earned: 36, total: 36 },
        ],
    rarest: empty
      ? []
      : [{ name: "Sem dano", type: "achievement", hidden: false, icon: "", rarity_pct: 0.6, earned_at: ago(3 * DAY), game_title: "ELDEN RING", platform: "steam" }],
    completions: empty
      ? []
      : [{ game_id: "22222222-2222-2222-2222-222222222222", title: "God of War Ragnarök", platform: "psn", external_id: "NPWR21528_00", cover: "", hero: "", total: 36, completed_at: ago(6 * DAY) }],
  };
}

export const recapHandlers = [
  http.get(`${API}/recap`, ({ request }) => {
    const period = new URL(request.url).searchParams.get("period") ?? "2026-10";
    return HttpResponse.json(recap(period));
  }),
  http.get(`${API}/recap/weekly`, () => HttpResponse.json({ recap: weekly })),
  http.post(`${API}/recap/weekly`, () => {
    weekly ??= {
      week: "2026-10-12",
      status: "ready",
      content: {
        headline: "Semana de Elden Ring: 21 conquistas e uma lendária",
        highlights: ["21 conquistas em ELDEN RING", "Sem dano (0,6% dos jogadores)", "Platina de God of War Ragnarök"],
        suggestions: [{ game: "Hades", why: "Faltam 8 e ~4 h — dá para fechar no fim de semana.", trophies: [] }],
        encouragement: "Ritmo bom — mais uma semana assim e Hades vira 100%.",
      },
      error: null,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ recap: weekly }, { status: 202 });
  }),
];
