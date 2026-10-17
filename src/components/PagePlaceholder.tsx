import { type ReactNode } from "react";
import { Panel } from "@/design-system/components/Panel";

/**
 * Placeholder de tela ainda não desenhada. O visual final de cada tela vem nas fases seguintes;
 * a rota já funciona (navegação/code-splitting) e o painel segue o style tile.
 */
export function PagePlaceholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Panel className="flex flex-col gap-2">
      <h2 className="font-display text-h3 font-bold uppercase tracking-[0.02em] text-text-1">{title}</h2>
      <p className="max-w-prose text-sm text-text-2">
        Tela em construção — o conteúdo chega nas próximas fases.
      </p>
      {children && <div className="mt-2 text-sm text-text-2">{children}</div>}
    </Panel>
  );
}
