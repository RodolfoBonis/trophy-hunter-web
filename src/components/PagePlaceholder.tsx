import { type ReactNode } from "react";

/**
 * Placeholder de tela ainda não desenhada. As telas reais aguardam a aprovação do style tile — por
 * ora deixamos o título, um resumo do que virá e a rota funcionando (para navegação/code-splitting).
 */
export function PagePlaceholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Tela em construção — o visual chega depois da aprovação do style tile.
      </p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
