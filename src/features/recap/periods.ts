const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Períodos oferecidos: este mês, mês passado, este ano, ano passado. */
export function recapPeriods(now: Date): { key: string; label: string }[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const prev = new Date(y, m - 1, 1);
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return [
    { key: key(new Date(y, m, 1)), label: `${MONTHS[m]} ${y}` },
    { key: key(prev), label: `${MONTHS[prev.getMonth()]} ${prev.getFullYear()}` },
    { key: String(y), label: String(y) },
    { key: String(y - 1), label: String(y - 1) },
  ];
}
