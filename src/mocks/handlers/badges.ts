import { http, HttpResponse } from "msw";
import type { Badge, MyBadges } from "@/api/schemas";
import { ago, API } from "../http";

const DAY = 24 * 60 * 60 * 1000;

const b = (key: string, name: string, description: string, tier: Badge["tier"], value: number, goal: number, earnedDaysAgo?: number): Badge => ({
  key, name, description, tier, value: Math.min(value, goal), goal, earned: value >= goal,
  ...(earnedDaysAgo !== undefined && value >= goal ? { earned_at: ago(earnedDaysAgo * DAY) } : {}),
});

export function mockMyBadges(): MyBadges {
  const catalog = [
    b("platinum_1", "Primeira platina", "Platina na PSN ou 100% na Steam pela primeira vez.", "bronze", 9, 1, 300),
    b("platinum_10", "Dez platinas", "10 platinas (ou 100% na Steam).", "silver", 9, 10),
    b("trophies_500", "500 troféus", "500 troféus e conquistas obtidos.", "bronze", 1530, 500, 200),
    b("trophies_1000", "Mil troféus", "1.000 troféus e conquistas obtidos.", "silver", 1530, 1000, 40),
    b("rare_10", "Caçador de raros", "10 troféus com menos de 5% dos jogadores.", "bronze", 44, 10, 90),
    b("ultra_1", "Ultra raro", "Um troféu que menos de 1% dos jogadores tem.", "silver", 0, 1),
    b("streak_7", "Semana cheia", "7 dias seguidos desbloqueando algo.", "bronze", 5, 7),
    b("challenge_1", "Primeira vitória", "Ganhou um desafio contra um amigo.", "bronze", 0, 1),
  ];
  const season: Badge = { key: "season", name: "Temporada set/2026", description: "Fechou a temporada do mês.", tier: "gold", season: "2026-09", value: 1, goal: 1, earned: true, earned_at: ago(20 * DAY) };
  return {
    earned: [...catalog.filter((x) => x.earned), season].sort((x, y) => (y.earned_at ?? "").localeCompare(x.earned_at ?? "")),
    next: catalog.filter((x) => !x.earned).slice(0, 3),
    catalog,
    season: { key: "2026-10", label: "Temporada out/2026", platinums: 1, rare: 6, platinum_goal: 3, rare_goal: 10, done: false },
  };
}

export const badgeHandlers = [http.get(`${API}/me/badges`, () => HttpResponse.json(mockMyBadges()))];
