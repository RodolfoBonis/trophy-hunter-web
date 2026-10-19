import type { Recap } from "@/api/schemas";

/**
 * Cartão PNG (1080×1350, formato de story/feed) da retrospectiva, desenhado no navegador com o visual
 * do app: fundo console, brilhos neon, números em Chakra Petch. Nada sai do aparelho.
 */
export async function renderRecapCard(r: Recap, name: string): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  await document.fonts?.ready;
  const display = (px: number, weight = 700) => `${weight} ${px}px "Chakra Petch", system-ui, sans-serif`;
  const body = (px: number, weight = 500) => `${weight} ${px}px "Inter Variable", "Inter", system-ui, sans-serif`;

  g.fillStyle = "#07080d";
  g.fillRect(0, 0, W, H);
  for (const [x, y, rad, color] of [
    [W * 0.85, -80, 760, "rgba(139,92,246,0.30)"],
    [0, H + 60, 700, "rgba(61,245,255,0.16)"],
  ] as const) {
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
  }

  g.fillStyle = "#eef2fa";
  g.font = display(34);
  g.fillText("TROPHY", 80, 120);
  g.fillStyle = "#3df5ff";
  g.fillText("HUNTER", 80 + g.measureText("TROPHY ").width, 120);

  g.fillStyle = "#b39dff";
  g.font = display(30, 600);
  g.fillText(`RETROSPECTIVA · ${r.label.toUpperCase()}`, 80, 200);
  g.fillStyle = "#a9b3c7";
  g.font = body(30);
  g.fillText(name, 80, 248);

  g.fillStyle = "#eef2fa";
  g.font = display(220);
  g.fillText(String(r.earned), 72, 470);
  g.fillStyle = "#a9b3c7";
  g.font = display(40, 600);
  g.fillText(r.earned === 1 ? "TROFÉU / CONQUISTA" : "TROFÉUS E CONQUISTAS", 80, 530);

  const stats: [string, number, string][] = [
    ["PLATINAS", r.platinum, "#b8a9ff"],
    ["RAROS (<5%)", r.rare, "#ff9f3d"],
    ["JOGOS", r.games, "#3df5ff"],
    ["DIAS ATIVOS", r.active_days, "#34d399"],
  ];
  stats.forEach(([label, v, color], i) => {
    const x = 80 + (i % 2) * 470;
    const y = 640 + Math.floor(i / 2) * 190;
    g.fillStyle = color;
    g.fillRect(x, y - 92, 6, 120);
    g.fillStyle = "#eef2fa";
    g.font = display(96);
    g.fillText(String(v), x + 30, y);
    g.fillStyle = "#8590a6";
    g.font = display(28, 600);
    g.fillText(label, x + 32, y + 40);
  });

  const top = r.top_games[0];
  if (top) {
    g.fillStyle = "#8590a6";
    g.font = display(28, 600);
    g.fillText("JOGO DO PERÍODO", 80, 1080);
    g.fillStyle = "#eef2fa";
    g.font = display(56);
    g.fillText(top.title.length > 26 ? `${top.title.slice(0, 25)}…` : top.title, 80, 1150);
    g.fillStyle = "#a9b3c7";
    g.font = body(30);
    g.fillText(`${top.unlocked} desbloqueios · maior sequência: ${r.longest_streak} ${r.longest_streak === 1 ? "dia" : "dias"}`, 80, 1200);
  }
  g.fillStyle = "#4a5368";
  g.font = body(24);
  g.fillText("trophy.rodolfodebonis.com.br", 80, H - 60);

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas vazio"))), "image/png"));
}

/** Compartilha (celular) ou baixa (desktop) o PNG. */
export async function shareOrDownload(blob: Blob, filename: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Minha retrospectiva no Trophy Hunter" });
    return "shared";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}
