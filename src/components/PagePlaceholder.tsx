import { type ReactNode } from "react";
import { Panel } from "@/design-system/components/Panel";
import { SectionHead } from "@/design-system/components/SectionHead";

/**
 * Tela ainda não construída: cabeçalho de seção do style tile + painel com o que vem nela.
 * A rota já funciona (navegação/code-splitting).
 */
export function PagePlaceholder({ idx, title, subtitle, children }: { idx: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead idx={idx} title={title} subtitle={subtitle ?? "Em construção — chega nas próximas fases."} />
      <Panel className="flex flex-col gap-2">
        <span className="label">Em breve</span>
        {children && <div className="text-sm text-text-2">{children}</div>}
      </Panel>
    </section>
  );
}
