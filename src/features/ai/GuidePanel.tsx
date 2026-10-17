import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import type { AIGuide } from "@/api/schemas";
import { buttonClasses } from "@/design-system/components/ui/button";
import { parsePartialJSON } from "@/lib/partialJson";
import { cn } from "@/lib/utils";
import { AIDisclaimer } from "./GuideViews";
import { useAIStream } from "./useAIStream";

function Glyph({ id, size = 14 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}

/** Trilha da geração ao vivo: status do worker e pesquisas feitas. */
export function GenerationProgress({
  status,
  tools,
  writing,
}: {
  status?: string;
  tools: string[];
  writing: boolean;
}) {
  return (
    <div className="ai-live" aria-live="polite">
      <span className="ai-status">
        {status ??
          (writing ? "Escrevendo" : tools.length ? "Pesquisando" : "Gerando")}
      </span>
      {tools.length > 0 && (
        <ul className="ai-tools" aria-label="Pesquisas da IA">
          {tools.slice(-4).map((t, i) => (
            <li key={i} title={t}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Conteúdo atrás do spoiler guard: borrado até o usuário revelar. */
export function SpoilerVeil({
  revealed,
  onReveal,
  label,
  children,
}: {
  revealed: boolean;
  onReveal: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("ai-veil", !revealed && "veiled")}>
      <div className="ai-veil-body" aria-hidden={!revealed}>
        {children}
      </div>
      {!revealed && (
        <button type="button" className="reveal-btn" onClick={onReveal}>
          <Glyph id="i-eye" />
          {label}
        </button>
      )}
    </div>
  );
}

export interface GuidePanelProps<T> {
  guide: AIGuide | null | undefined;
  loading: boolean;
  queryKey: readonly unknown[];
  schema: z.ZodType<T>;
  /** Renderiza o conteúdo (completo, ou parcial com live=true). */
  render: (content: Partial<T>, live: boolean) => ReactNode;
  /** Editor do conteúdo (salva e fecha). */
  editor?: (
    content: T,
    onSave: (next: T | null) => void,
    onCancel: () => void,
    saving: boolean,
  ) => ReactNode;
  onGenerate: () => void;
  generating: boolean;
  generateError?: boolean;
  onSaveEdit: (content: T | null) => void;
  savingEdit: boolean;
  noun: string;
  emptyHint: string;
  /** Começa revelado (ex.: o usuário acabou de pedir). */
  defaultRevealed?: boolean;
}

/**
 * Casco comum de um guia de IA (troféu ou roadmap): gerar → acompanhar ao vivo (JSON parcial) →
 * exibir (atrás do spoiler guard) → editar / regenerar. O conteúdo editado vence o gerado.
 */
export function GuidePanel<T>(p: GuidePanelProps<T>) {
  const qc = useQueryClient();
  const [revealed, setRevealed] = useState(p.defaultRevealed ?? false);
  const [editing, setEditing] = useState(false);
  const g = p.guide;
  const running = g?.status === "pending" || g?.status === "running";
  const stream = useAIStream(g?.id, running, {
    runKey: g?.updated_at ?? undefined,
    onFinish: () => void qc.invalidateQueries({ queryKey: p.queryKey }),
  });

  const generate = () => {
    setRevealed(true);
    setEditing(false);
    p.onGenerate();
  };

  if (p.loading)
    return <div className="skel skel-line h-10 w-full" aria-busy="true" />;

  if (!g) {
    return (
      <div className="ai-panel">
        <AIDisclaimer>{p.emptyHint}</AIDisclaimer>
        <div>
          <button
            type="button"
            className={buttonClasses("secondary", "sm")}
            onClick={generate}
            disabled={p.generating}
          >
            <span className="s" aria-hidden />
            <Glyph id="i-ai" />
            {p.generating ? "Pedindo…" : `Gerar ${p.noun} com IA`}
          </button>
        </div>
        {p.generateError && (
          <p role="alert" className="m-0 text-sm text-danger">
            Não foi possível pedir o {p.noun}. Tente de novo.
          </p>
        )}
      </div>
    );
  }

  if (running) {
    const partial = (parsePartialJSON(stream.json) ?? {}) as Partial<T>;
    return (
      <div className="ai-panel" aria-busy="true">
        <GenerationProgress
          status={stream.error ?? stream.status}
          tools={stream.tools}
          writing={stream.json.length > 0}
        />
        {stream.json && (
          <SpoilerVeil
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            label={`Revelar ${p.noun}`}
          >
            {p.render(partial, true)}
          </SpoilerVeil>
        )}
      </div>
    );
  }

  if (g.status === "error") {
    return (
      <div className="ai-panel">
        <p role="alert" className="m-0 text-sm text-danger">
          {g.error || `Não foi possível gerar o ${p.noun}.`}
        </p>
        <div>
          <button
            type="button"
            className={buttonClasses("secondary", "sm")}
            onClick={generate}
            disabled={p.generating}
          >
            <span className="s" aria-hidden />
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  const edited =
    g.edited_content != null ? p.schema.safeParse(g.edited_content) : undefined;
  const original = p.schema.safeParse(g.content);
  const content = edited?.success
    ? edited.data
    : original.success
      ? original.data
      : undefined;

  return (
    <div className="ai-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="ai-tag">
          <Glyph id="i-ai" />
          {p.noun} · Sugestão de IA
          {edited?.success ? " · editado por você" : ""}
        </span>
        <div className="flex flex-wrap gap-3">
          {content !== undefined && !editing && p.editor && (
            <button
              type="button"
              className="label cursor-pointer hover:!text-text-1"
              onClick={() => (setEditing(true), setRevealed(true))}
            >
              Editar
            </button>
          )}
          {edited?.success && !editing && (
            <button
              type="button"
              className="label cursor-pointer hover:!text-text-1"
              onClick={() => p.onSaveEdit(null)}
              disabled={p.savingEdit}
            >
              Voltar ao original
            </button>
          )}
          <button
            type="button"
            className="label cursor-pointer hover:!text-neon-violet-text"
            onClick={generate}
            disabled={p.generating}
          >
            Regenerar
          </button>
        </div>
      </div>
      {content === undefined ? (
        <p role="alert" className="m-0 text-sm text-danger">
          Este {p.noun} está num formato antigo. Regenere para ver.
        </p>
      ) : editing && p.editor ? (
        p.editor(
          content,
          (next) => (p.onSaveEdit(next), setEditing(false)),
          () => setEditing(false),
          p.savingEdit,
        )
      ) : (
        <SpoilerVeil
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          label={`Revelar ${p.noun}`}
        >
          {p.render(content, false)}
        </SpoilerVeil>
      )}
      <AIDisclaimer />
    </div>
  );
}
