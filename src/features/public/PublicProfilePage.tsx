import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { publicProfileSchema, type Badge } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { Medal } from "@/features/badges/Medal";

const nf = new Intl.NumberFormat("pt-BR");
const df = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" });

class NotFound extends Error {}

async function fetchProfile(apiBase: string, slug: string) {
  const res = await fetch(`${apiBase}/v1/public/profiles/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) throw new NotFound();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return publicProfileSchema.parse(await res.json());
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="num text-3xl" style={{ color }}>
        {nf.format(value)}
      </span>
      <span className="label">{label}</span>
    </div>
  );
}

/**
 * Perfil público (/perfil/:slug): vitrine sem login, fora do fluxo de sessão do app. Só o que a API
 * expõe no perfil público — nada de contas, notas ou lista de desejos.
 */
export default function PublicProfilePage({ apiBase, slug }: { apiBase: string; slug: string }) {
  const q = useQuery({ queryKey: ["public-profile", slug], queryFn: () => fetchProfile(apiBase, slug), retry: (n, e) => !(e instanceof NotFound) && n < 1 });
  useEffect(() => {
    document.title = q.data ? `${q.data.name} · Trophy Hunter` : "Perfil · Trophy Hunter";
  }, [q.data]);

  return (
    <main id="conteudo" className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-10 sm:px-6">
      <a href="/" className="label no-underline hover:text-neon-cyan">
        Trophy Hunter
      </a>
      {q.isPending && <div className="skel chamfer-md h-64" aria-busy="true" />}
      {q.isError && (
        <div className="panel flex flex-col gap-2">
          <h1 className="m-0 font-display text-h3 font-bold uppercase text-text-1">
            {q.error instanceof NotFound ? "Perfil não encontrado" : "Não deu para abrir o perfil"}
          </h1>
          <p className="m-0 text-sm text-text-2">
            {q.error instanceof NotFound ? "O link pode ter mudado ou o perfil foi desligado por quem é dono dele." : "Tente de novo em instantes."}
          </p>
        </div>
      )}
      {q.data && (
        <>
          <header className="panel hero-stat flex flex-col gap-5">
            <div>
              <span className="kicker label">Perfil público · Trophy Hunter</span>
              <h1 className="m-0 break-words font-display text-h1 font-bold uppercase leading-none text-text-1">{q.data.name}</h1>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat value={q.data.platinums} label="Platinas" color="var(--color-neon-cyan)" />
              <Stat value={q.data.trophies} label="Troféus" color="var(--color-text-1)" />
              <Stat value={q.data.rare} label="Raros (< 5%)" color="var(--color-neon-violet)" />
              <Stat value={q.data.completed} label="Jogos 100%" color="var(--color-trophy-gold)" />
            </div>
          </header>

          {q.data.badges.length > 0 && (
            <section className="flex flex-col gap-3" aria-label="Medalhas">
              <h2 className="sub !mb-0">Medalhas · {q.data.badges.length}</h2>
              <ul className="medal-grid">
                {q.data.badges.map((b) => {
                  const badge: Badge = { ...b, description: "", value: 1, goal: 1, earned: true };
                  return (
                    <li key={`${b.key}:${b.season ?? ""}`}>
                      <Medal badge={badge} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {q.data.completions.length > 0 && (
              <section className="panel flex flex-col gap-3" aria-label="Platinas recentes">
                <h2 className="sub !mb-0">Platinas e 100% recentes</h2>
                <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
                  {q.data.completions.map((c) => (
                    <li key={`${c.platform}:${c.external_id}`} className="flex flex-col gap-1">
                      <div className="aspect-[2/3] overflow-hidden bg-[var(--color-bg-1)]">
                        <GameCover cover={c.cover} hero={c.hero} title={c.title} platform={c.platform} externalId={c.external_id} />
                      </div>
                      <span className="line-clamp-2 text-sm text-text-1">{c.title}</span>
                      <span className="caption">{c.completed_at ? df.format(new Date(c.completed_at)) : ""}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {q.data.rarest.length > 0 && (
              <section className="panel flex flex-col gap-3" aria-label="Troféus mais raros">
                <h2 className="sub !mb-0">Mais raros</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {q.data.rarest.map((t) => (
                    <li key={`${t.game_title}:${t.name}`} className="flex items-center gap-3">
                      <TrophyIcon type={t.type} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 line-clamp-2 text-sm text-text-1">{t.name}</p>
                        <p className="caption m-0 flex items-center gap-2">
                          <PlatformBadge platform={t.platform} /> <span className="truncate">{t.game_title}</span>
                        </p>
                      </div>
                      <RarityBadge pct={t.rarity_pct} mini />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <p className="caption m-0">O Trophy Hunter é só por convite. Este perfil foi tornado público por quem é dono dele.</p>
        </>
      )}
    </main>
  );
}
