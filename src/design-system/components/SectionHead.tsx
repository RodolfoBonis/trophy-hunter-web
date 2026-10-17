import type { ReactNode } from "react";

/**
 * Cabeçalho de seção do style tile (`.sec-head` em hud.css): número em contorno neon, título em
 * display, subtítulo e a régua com o losango. `idx` é decorativo (aria-hidden).
 */
export function SectionHead({
  idx,
  title,
  subtitle,
  actions,
}: {
  idx: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="sec-head !mb-0">
      <span className="idx" aria-hidden>
        {idx}
      </span>
      <div className="min-w-0">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <span className="rule" aria-hidden />
      {actions && <div className="mb-1 flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
