/** Horas em pt-BR: "<1 h", "4,5 h", "136 h" (inteiro a partir de 10). */
export function formatHours(h: number | null | undefined): string {
  if (h == null || !Number.isFinite(h) || h <= 0) return "—";
  if (h < 1) return "<1 h";
  const v = h >= 10 ? Math.round(h) : Math.round(h * 10) / 10;
  return `${v.toLocaleString("pt-BR")} h`;
}
