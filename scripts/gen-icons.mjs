#!/usr/bin/env node
/**
 * Gera PNGs 192/512/maskable a partir dos SVGs em public/icons (para instalação PWA / apple-touch
 * em plataformas que não aceitam SVG). Usa `sharp` se estiver instalado; senão, avisa e sai sem erro
 * — os SVGs placeholders já cobrem o build/manifest por ora (os PNGs definitivos entram com o style
 * tile). Para habilitar: `pnpm add -D sharp && pnpm gen:icons`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = resolve(root, "public/icons");

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.warn("gen:icons: `sharp` não instalado — mantendo só os SVGs placeholders. (pnpm add -D sharp)");
  process.exit(0);
}

const targets = [
  { src: "icon-192.svg", out: "icon-192.png", size: 192 },
  { src: "icon-512.svg", out: "icon-512.png", size: 512 },
  { src: "icon-maskable.svg", out: "icon-maskable.png", size: 512 },
];

for (const { src, out, size } of targets) {
  const srcPath = resolve(iconsDir, src);
  if (!existsSync(srcPath)) continue;
  const png = await sharp(readFileSync(srcPath)).resize(size, size).png().toBuffer();
  writeFileSync(resolve(iconsDir, out), png);
  console.log(`gen:icons → ${out} (${size}x${size})`);
}
