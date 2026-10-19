import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

/** Mesmo corte do app shell: abaixo disso aparece a tab bar e os menus viram "sheet". */
export const SHEET_QUERY = "(max-width: 900px)";

/**
 * Menu da barra superior: no desktop, um painel ancorado abaixo do botão (o pai precisa ser
 * `relative`); no celular, uma folha que sobe do rodapé com fundo escurecido, alvos grandes e
 * respeitando a área segura. Fecha com Esc, clique fora ou no fundo. Foca o primeiro item ao abrir.
 */
export function MenuPanel({
  open,
  onClose,
  label,
  children,
  className,
  width = "w-80",
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  width?: string;
  /** Wrapper do botão que abre (clique nele não conta como "fora"). */
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const sheet = useMediaQuery(SHEET_QUERY);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    // Foco no primeiro item navegável (teclado/leitor de tela).
    const first = panelRef.current?.querySelector<HTMLElement>("a, button, [tabindex]:not([tabindex='-1'])");
    first?.focus({ preventScroll: true });
    if (sheet) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, anchorRef, sheet]);

  if (!open) return null;
  if (sheet) {
    return createPortal(
      <div className="fixed inset-0 z-[var(--z-overlay)]">
        <div className="absolute inset-0 bg-scrim backdrop-blur-sm" aria-hidden />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn("menu-sheet panel absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-y-auto", className)}
        >
          <span className="mx-auto mb-3 block h-1 w-10 shrink-0 rounded-full bg-border" aria-hidden />
          {children}
        </div>
      </div>,
      document.body,
    );
  }
  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className={cn("panel sm absolute right-0 top-12 z-[var(--z-overlay)] flex max-h-[80vh] flex-col overflow-y-auto", width, className)}
    >
      {children}
    </div>
  );
}

/** Item de menu com ícone, rótulo e descrição opcional — alvo de toque de 44 px no celular. */
export function MenuItemContent({ icon, label, hint, badge }: { icon: string; label: ReactNode; hint?: ReactNode; badge?: ReactNode }) {
  return (
    <>
      <svg width={18} height={18} aria-hidden className="shrink-0 text-text-3">
        <use href={`#${icon}`} />
      </svg>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-text-1">{label}</span>
        {hint && <span className="caption block truncate">{hint}</span>}
      </span>
      {badge}
    </>
  );
}
