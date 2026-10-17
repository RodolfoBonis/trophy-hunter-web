import { AlertTriangle } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "warning" | "danger" | "info";

const TONE: Record<Tone, { border: string; text: string; icon: string; grad: string }> = {
  warning: {
    border: "rgb(251 191 36 / 0.4)",
    text: "#fde68a",
    icon: "var(--color-warning)",
    grad: "linear-gradient(90deg, rgb(251 191 36 / 0.13), rgb(251 191 36 / 0.04))",
  },
  danger: {
    border: "rgb(248 113 113 / 0.4)",
    text: "#fca5a5",
    icon: "var(--color-danger)",
    grad: "linear-gradient(90deg, rgb(248 113 113 / 0.13), rgb(248 113 113 / 0.04))",
  },
  info: {
    border: "rgb(96 165 250 / 0.4)",
    text: "#bfdbfe",
    icon: "var(--color-info)",
    grad: "linear-gradient(90deg, rgb(96 165 250 / 0.13), rgb(96 165 250 / 0.04))",
  },
};

/** Banner HUD chanfrado (ex.: reconexão PSN). Título + descrição + ação opcional. */
export function Banner({
  tone = "warning",
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      role="alert"
      className={cn("chamfer-md relative grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4", className)}
      style={{ background: t.grad, boxShadow: `inset 0 0 0 1px ${t.border}` }}
    >
      <span className="grid size-9 place-items-center" style={{ color: t.icon }} aria-hidden>
        <AlertTriangle className="size-6" />
      </span>
      <div className="min-w-0">
        <strong
          className="block font-display text-[15px] uppercase tracking-[0.04em]"
          style={{ color: t.text }}
        >
          {title}
        </strong>
        {children && <span className="text-[13.5px] text-text-2">{children}</span>}
      </div>
      {action && <div className="justify-self-end">{action}</div>}
    </div>
  );
}
