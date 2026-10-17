import type { Stats } from "@/api/schemas";

const W = 640;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 26, left: 12 };
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthLabel(m: string): string {
  const [y, mm] = m.split("-");
  const i = Number(mm) - 1;
  return `${MONTHS[i] ?? mm}${i === 0 ? ` ${y?.slice(2)}` : ""}`;
}

/**
 * Evolução: barras = desbloqueios no mês (ciano), linha = total acumulado (violeta, eixo próprio).
 * SVG puro e responsivo (viewBox); a tabela sr-only dá o mesmo dado para leitores de tela.
 * Mostra os últimos `months` meses.
 */
export function EvolutionChart({ data, months = 18 }: { data: Stats["evolution"]; months?: number }) {
  const rows = data.slice(-months);
  if (rows.length === 0) return <p className="caption">Sem desbloqueios com data ainda.</p>;
  const maxEarned = Math.max(1, ...rows.map((r) => r.earned));
  const minCum = rows[0]!.cumulative - rows[0]!.earned;
  const maxCum = Math.max(minCum + 1, rows.at(-1)!.cumulative);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = innerW / rows.length;
  const barW = Math.max(4, step * 0.56);
  const y = (v: number) => PAD.top + innerH - (v / maxEarned) * innerH;
  const yc = (v: number) => PAD.top + innerH - ((v - minCum) / (maxCum - minCum)) * innerH;
  const cx = (i: number) => PAD.left + step * i + step / 2;
  const line = rows.map((r, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${yc(r.cumulative).toFixed(1)}`).join(" ");

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Desbloqueios por mês e total acumulado">
        <defs>
          <linearGradient id="evo-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-neon-cyan)" stopOpacity=".95" />
            <stop offset="1" stopColor="var(--color-neon-cyan)" stopOpacity=".25" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH * (1 - f)} y2={PAD.top + innerH * (1 - f)} stroke="var(--color-border-subtle)" strokeDasharray="2 4" />
        ))}
        {rows.map((r, i) => (
          <g key={r.month}>
            <rect x={cx(i) - barW / 2} y={y(r.earned)} width={barW} height={PAD.top + innerH - y(r.earned)} fill="url(#evo-bar)">
              <title>{`${monthLabel(r.month)}: ${r.earned} desbloqueios (total ${r.cumulative})`}</title>
            </rect>
            {(rows.length <= 12 || i % 2 === rows.length % 2) && (
              <text x={cx(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--color-text-3)" fontFamily="var(--font-display)">
                {monthLabel(r.month)}
              </text>
            )}
          </g>
        ))}
        <path d={line} fill="none" stroke="var(--color-neon-violet)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px rgb(139 92 246 / .6))" }} />
        <circle cx={cx(rows.length - 1)} cy={yc(rows.at(-1)!.cumulative)} r="4" fill="var(--color-neon-violet)" />
      </svg>
      <figcaption className="caption mt-2 flex flex-wrap gap-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 bg-neon-cyan" aria-hidden /> desbloqueios no mês
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-neon-violet" aria-hidden /> total acumulado ({rows.at(-1)!.cumulative})
        </span>
      </figcaption>
      <table className="sr-only">
        <caption>Desbloqueios por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Desbloqueios</th>
            <th scope="col">Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month}>
              <td>{r.month}</td>
              <td>{r.earned}</td>
              <td>{r.cumulative}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
