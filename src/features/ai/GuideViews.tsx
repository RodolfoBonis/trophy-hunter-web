import type { ReactNode } from "react";
import type { RoadmapContent, TrophyGuideContent } from "@/api/schemas";
import { cn } from "@/lib/utils";

/** Conteúdo possivelmente parcial (chega aos pedaços durante a geração). */
export type Partialish<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U extends object
      ? Partialish<U>[]
      : U[]
    : T[K];
};

function Glyph({ id, size = 13 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}

/** Selo "IA" + aviso de que é sugestão. */
export function AIDisclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="ai-disclaimer">
      <span className="ai-tag mr-2">
        <Glyph id="i-ai" />
        Sugestão de IA
      </span>
      Pode conter erros, sobretudo em jogos de nicho — confira nas fontes.{" "}
      {children}
    </p>
  );
}

/** Dificuldade 1–10 em segmentos (com rótulo textual, não só cor). */
export function DifficultyMeter({ value }: { value: number }) {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  const color =
    v >= 8
      ? "var(--color-danger)"
      : v >= 5
        ? "var(--color-warning)"
        : "var(--color-success)";
  return (
    <span
      className="inline-flex items-center gap-2"
      aria-label={`Dificuldade ${v} de 10`}
    >
      <span
        className="ai-meter"
        style={{ ["--mc" as string]: color }}
        aria-hidden
      >
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={cn(i < v && "on")} />
        ))}
      </span>
      <b>{v}/10</b>
    </span>
  );
}

/** Confiança do modelo + notas de incerteza (destacadas quando a confiança é baixa). */
export function Confidence({
  value,
  notes,
}: {
  value: number;
  notes?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const level = value >= 0.75 ? "Alta" : value >= 0.5 ? "Média" : "Baixa";
  const color =
    value >= 0.75
      ? "var(--color-success)"
      : value >= 0.5
        ? "var(--color-warning)"
        : "var(--color-danger)";
  return (
    <div className="flex flex-col gap-2">
      <span className="ai-facts">
        Confiança
        <span
          className="ai-conf"
          style={{ ["--cc" as string]: color }}
          aria-hidden
        >
          <i style={{ transform: `scaleX(${pct / 100})` }} />
        </span>
        <b>
          {level} · {pct}%
        </b>
      </span>
      {notes && (
        <div className={cn("banner", value >= 0.75 && "info")} role="note">
          <span className="ic" aria-hidden>
            <Glyph id="i-warn" size={16} />
          </span>
          <div className="min-w-0">
            <strong>
              {value < 0.5 ? "A IA não tem certeza" : "Pontos de incerteza"}
            </strong>
            <span>{notes}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Sources({ urls }: { urls?: string[] }) {
  const list = (urls ?? []).filter((u) => /^https?:\/\//.test(u));
  if (list.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="label">Fontes consultadas</span>
      <div className="chips">
        {list.map((u) => (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            className="chip no-underline hover:!text-text-1"
          >
            {hostOf(u)} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function Items({
  title,
  items,
}: {
  title: string;
  items?: (string | undefined)[];
}) {
  const list = (items ?? []).filter((s): s is string => !!s);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{title}</span>
      <ul className="ai-list">
        {list.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

/** Guia de um troféu (completo ou parcial, durante a geração). */
export function TrophyGuideView({
  c,
  live = false,
}: {
  c: Partialish<TrophyGuideContent>;
  live?: boolean;
}) {
  const steps = (c.steps ?? []).filter(Boolean);
  return (
    <div className="flex flex-col gap-4">
      {c.summary && (
        <p
          className={cn(
            "m-0 text-[15px] leading-relaxed text-text-1",
            live && !c.steps && "ai-caret",
          )}
        >
          {c.summary}
        </p>
      )}
      {(c.difficulty != null || c.estimated_time || c.missable != null) && (
        <div className="ai-facts">
          {c.difficulty != null && <DifficultyMeter value={c.difficulty} />}
          {c.estimated_time && (
            <span>
              Tempo <b>{c.estimated_time}</b>
            </span>
          )}
          {c.missable === true && (
            <span className="chip !text-warning">Perdível</span>
          )}
          {c.missable === false && <span className="chip">Não é perdível</span>}
        </div>
      )}
      {c.missable && c.point_of_no_return && (
        <div className="banner" role="note">
          <span className="ic" aria-hidden>
            <Glyph id="i-warn" size={16} />
          </span>
          <div className="min-w-0">
            <strong>Ponto de não retorno</strong>
            <span>{c.point_of_no_return}</span>
          </div>
        </div>
      )}
      <Items title="Pré-requisitos" items={c.prerequisites} />
      {steps.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="label">Passo a passo</span>
          <ol className={cn("ai-steps", live && "ai-caret")}>
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
      <Items title="Dicas" items={c.tips} />
      {c.confidence != null && !live && (
        <Confidence value={c.confidence} notes={c.uncertainty_notes} />
      )}
      {!live && <Sources urls={c.sources} />}
    </div>
  );
}

/** Roadmap de platina/100% (completo ou parcial). */
export function RoadmapView({
  c,
  live = false,
}: {
  c: Partialish<RoadmapContent>;
  live?: boolean;
}) {
  const stages = (c.stages ?? []).filter((s) => s?.title);
  return (
    <div className="flex flex-col gap-5">
      {c.summary && (
        <p className="m-0 text-[15px] leading-relaxed text-text-1">
          {c.summary}
        </p>
      )}
      {(c.difficulty != null ||
        c.estimated_total_time ||
        c.playthroughs != null) && (
        <div className="ai-facts">
          {c.difficulty != null && <DifficultyMeter value={c.difficulty} />}
          {c.estimated_total_time && (
            <span>
              Tempo restante <b>{c.estimated_total_time}</b>
            </span>
          )}
          {c.playthroughs != null && (
            <span>
              Jogadas <b>{c.playthroughs}</b>
            </span>
          )}
        </div>
      )}
      {(c.missables_overview ?? []).length > 0 && (
        <div className="banner" role="note">
          <span className="ic" aria-hidden>
            <Glyph id="i-warn" size={16} />
          </span>
          <div className="min-w-0">
            <strong>Perdíveis do jogo</strong>
            <span>
              {(c.missables_overview ?? []).filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
      )}
      {stages.length > 0 && (
        <ol className={cn("ai-stages", live && "ai-caret")}>
          {stages.map((s, i) => (
            <li key={i} className="ai-stage">
              <span className="label">Etapa {i + 1}</span>
              <h5>{s.title}</h5>
              {s.description && (
                <p className="m-0 mt-1 text-sm leading-relaxed text-text-2">
                  {s.description}
                </p>
              )}
              {(s.missables ?? []).length > 0 && (
                <p className="m-0 mt-2 text-sm text-warning">
                  <strong>Antes de avançar:</strong>{" "}
                  {(s.missables ?? []).filter(Boolean).join(" · ")}
                </p>
              )}
              {(s.trophies ?? []).length > 0 && (
                <div className="chips mt-2">
                  {(s.trophies ?? []).filter(Boolean).map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
      <Items title="Dicas" items={c.tips} />
      {c.confidence != null && !live && (
        <Confidence value={c.confidence} notes={c.uncertainty_notes} />
      )}
      {!live && <Sources urls={c.sources} />}
    </div>
  );
}
