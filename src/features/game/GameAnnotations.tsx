import { useEffect, useState } from "react";
import type { GameDetail, TrophyTag } from "@/api/schemas";
import { usePatchGame, usePatchTrophy } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

/** Rótulos das marcações (taxonomia da API). */
export const TAG_LABEL: Record<TrophyTag, string> = {
  missable: "Perdível",
  online: "Online",
  grind: "Grind",
  difficulty: "Dificuldade",
  collectible: "Colecionável",
  buggy: "Bugado",
};
const TAGS = Object.keys(TAG_LABEL) as TrophyTag[];

const PRIORITY = ["Nenhuma", "Baixa", "Média", "Alta"];

/** Chips de tag alternáveis (aria-pressed), no estilo `.chip` do tile. */
export function TagToggles({ value, onChange, disabled }: { value: TrophyTag[]; onChange: (tags: TrophyTag[]) => void; disabled?: boolean }) {
  return (
    <div className="chips" role="group" aria-label="Marcações">
      {TAGS.map((t) => {
        const on = value.includes(t);
        return (
          <button
            key={t}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== t) : [...value, t])}
            className={cn("chip cursor-pointer", on && "!border-neon-cyan !text-neon-cyan")}
          >
            {TAG_LABEL[t]}
          </button>
        );
      })}
    </div>
  );
}

/** Links de busca em sites de guias (só link, sem scraping). */
export function GuideLinks({ game }: { game: GameDetail }) {
  const q = encodeURIComponent(game.title.replace(/[™®©]/g, ""));
  const links: [string, string][] = [
    ["PSNProfiles", `https://psnprofiles.com/search/games?q=${q}`],
    ["PowerPyx", `https://www.powerpyx.com/?s=${q}`],
    ["TrueAchievements", `https://www.trueachievements.com/searchresults.aspx?search=${q}`],
  ];
  if (game.platform === "steam") {
    links.unshift(
      ["Guias Steam", `https://steamcommunity.com/app/${game.external_id}/guides/`],
      ["Conquistas Steam", `https://steamcommunity.com/stats/${game.external_id}/achievements`],
      ["TrueSteamAchievements", `https://truesteamachievements.com/searchresults.aspx?search=${q}`],
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="label">Guias</span>
      <div className="chips">
        {links.map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="chip no-underline hover:!text-text-1">
            {label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

/** Marcações do jogo: abandonado, prioridade, tags e notas (salvas ao sair do campo). */
export function GameAnnotations({ game }: { game: GameDetail }) {
  const patch = usePatchGame();
  const [notes, setNotes] = useState(game.notes ?? "");
  useEffect(() => setNotes(game.notes ?? ""), [game.id, game.notes]);
  const save = (body: Parameters<typeof patch.mutate>[0]["body"]) => patch.mutate({ id: game.id, body });

  return (
    <div className="panel sm grid gap-5 md:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-4">
        <span className="label">Suas marcações</span>
        <div className="flex flex-wrap items-center gap-4">
          <label className="switch">
            <input type="checkbox" checked={game.abandoned ?? false} onChange={(e) => save({ abandoned: e.target.checked })} />
            Abandonado
          </label>
          <div className="seg" role="group" aria-label="Prioridade">
            <span className="seg-l" aria-hidden>
              Prioridade
            </span>
            {PRIORITY.map((label, i) => (
              <button key={label} type="button" aria-pressed={(game.priority ?? 0) === i} onClick={() => save({ priority: i })}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <TagToggles value={game.tags ?? []} onChange={(tags) => save({ tags })} disabled={patch.isPending} />
        <GuideLinks game={game} />
      </div>
      <div className="field !max-w-none">
        <label htmlFor="game-notes">Notas</label>
        <textarea
          id="game-notes"
          value={notes}
          maxLength={4000}
          rows={5}
          placeholder="Ex.: fazer o NG+ antes do capítulo 7; colecionáveis da área 3 pendentes…"
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (game.notes ?? "") && save({ notes })}
          className="w-full resize-y rounded-xs border border-border bg-bg-1 p-3 font-sans text-sm text-text-1 placeholder:text-text-3 focus-visible:border-neon-cyan focus-visible:outline-none"
        />
        <span className="help">{patch.isPending ? "Salvando…" : patch.isError ? "Não foi possível salvar." : "Salvo ao sair do campo."}</span>
      </div>
    </div>
  );
}

/** Editor inline das marcações de um troféu (tags + risco de servidor fechar). */
export function TrophyMarks({
  trophyId,
  tags,
  serverRisk,
  onClose,
}: {
  trophyId: string;
  tags: TrophyTag[];
  serverRisk: boolean;
  onClose: () => void;
}) {
  const patch = usePatchTrophy();
  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border-subtle pt-3">
      <TagToggles value={tags} onChange={(next) => patch.mutate({ id: trophyId, body: { tags: next } })} disabled={patch.isPending} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="switch">
          <input
            type="checkbox"
            checked={serverRisk}
            onChange={(e) => patch.mutate({ id: trophyId, body: { server_shutdown_risk: e.target.checked } })}
          />
          Servidor pode fechar
        </label>
        <button type="button" className="label cursor-pointer hover:!text-text-1" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
