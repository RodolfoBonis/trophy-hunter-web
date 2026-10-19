#!/usr/bin/env node
/**
 * Orçamento do carregamento inicial (o que o index.html puxa antes da primeira tela): falha o CI se
 * o JS ou o CSS inicial (gzip) passarem do limite, ou se voltarem fontes fora de latin/latin-ext.
 *
 *   pnpm build && pnpm check:bundle [dist]
 */
import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";

const BUDGET_KIB = { js: 190, css: 30 };
const MAX_FONT_FILES = 24;

const dir = process.argv[2] ?? "dist";
const html = readFileSync(`${dir}/index.html`, "utf8");
const initial = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(js|css))"/g)].map((m) => ({ file: m[1], kind: m[2] }));
const total = { js: 0, css: 0 };
for (const { file, kind } of initial) {
  const gz = gzipSync(readFileSync(`${dir}/${file}`)).length / 1024;
  total[kind] += gz;
  console.log(`  ${file.padEnd(48)} ${gz.toFixed(1).padStart(6)} KiB gz`);
}
const fonts = readdirSync(`${dir}/assets`).filter((f) => /\.woff2?$/.test(f));
const foreign = fonts.filter((f) => !/-latin(-ext)?-/.test(f));

const problems = [];
for (const kind of ["js", "css"]) {
  const line = `${kind.toUpperCase()} inicial: ${total[kind].toFixed(1)} KiB gz (limite ${BUDGET_KIB[kind]})`;
  console.log(line);
  if (total[kind] > BUDGET_KIB[kind]) problems.push(line);
}
console.log(`fontes: ${fonts.length} arquivos (limite ${MAX_FONT_FILES})`);
if (fonts.length > MAX_FONT_FILES) problems.push(`fontes demais: ${fonts.length}`);
if (foreign.length) problems.push(`fontes fora de latin/latin-ext: ${foreign.slice(0, 3).join(", ")}…`);

if (problems.length) {
  console.error(`\nOrçamento estourado:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("orçamento ok");
