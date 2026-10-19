#!/usr/bin/env node
/**
 * Gera src/design-system/fonts.css só com os subsets latin + latin-ext (o app é pt-BR) e só woff2.
 * Sai das @font-face do próprio @fontsource (unicode-range incluso, então o navegador baixa só o
 * subset usado) — sem isso o PWA precacheava cirílico/grego/vietnamita de todas as fontes.
 *
 *   pnpm gen:fonts   # rodar ao atualizar/trocar fontes; a saída é commitada
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "src/design-system/fonts.css");
const require = createRequire(import.meta.url);

/** [pacote, arquivo css com todos os subsets do peso/eixo]. */
const SOURCES = [
  ["@fontsource/chakra-petch", ["400.css", "500.css", "600.css", "700.css"]],
  ["@fontsource/rajdhani", ["500.css", "600.css", "700.css"]],
  ["@fontsource-variable/inter", ["wght.css"]],
  ["@fontsource/jetbrains-mono", ["400.css", "500.css"]],
];
const SUBSETS = /-(latin|latin-ext)-(\d+|wght)-normal \*\//;

let css = "/* Gerado por scripts/gen-fonts.mjs — não editar à mão. Só latin + latin-ext, só woff2. */\n";
for (const [pkg, files] of SOURCES) {
  const dir = dirname(require.resolve(`${pkg}/package.json`));
  for (const file of files) {
    const text = readFileSync(resolve(dir, file), "utf8");
    for (const block of text.split(/(?=\/\* )/)) {
      if (!SUBSETS.test(block.split("\n")[0])) continue;
      // Pelo symlink estável node_modules/<pacote> (não pelo caminho versionado do store do pnpm).
      const rel = relative(dirname(out), resolve(root, "node_modules", pkg, "files")).split("\\").join("/");
      css += block
        .replace(/url\(\.\/files\//g, `url(${rel}/`)
        .replace(/,\s*url\([^)]*\.woff\) format\('woff'\)/g, "")
        .trimEnd() + "\n";
    }
  }
}
writeFileSync(out, css);
console.log(`fonts.css: ${(css.match(/@font-face/g) ?? []).length} faces`);
