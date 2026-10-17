#!/usr/bin/env node
/**
 * Gera os tipos do client da API a partir do contrato OpenAPI escrito à mão em
 * ../trophy-hunter-api/api/openapi.yaml (padrão do plano).
 *
 *   pnpm gen:api                              # lê de ../trophy-hunter-api/api/openapi.yaml
 *   OPENAPI_FILE=path/to/openapi.yaml pnpm gen:api
 *
 * Saída (commitada): src/api/generated/schema.ts. Quando o openapi.yaml existir, rode isto e passe a
 * espelhar os schemas zod de src/api/schemas.ts no contrato (padrão schemas.contract.ts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const input = process.env.OPENAPI_FILE ?? resolve(root, "../trophy-hunter-api/api/openapi.yaml");

if (!existsSync(input)) {
  console.error(
    `gen:api: contrato não encontrado em ${input}.\n` +
      "A API ainda não publicou o api/openapi.yaml. Rode de novo quando o arquivo existir " +
      "(ou aponte com OPENAPI_FILE). Até lá, os schemas zod de src/api/schemas.ts são a fonte provisória.",
  );
  process.exit(1);
}

const ast = await openapiTS(new URL(`file://${input}`), { alphabetize: true });
const outDir = resolve(root, "src/api/generated");
mkdirSync(outDir, { recursive: true });
const banner = `/* eslint-disable */\n/** Gerado por \`pnpm gen:api\` a partir de ${input}. Não edite à mão. */\n\n`;
writeFileSync(resolve(outDir, "schema.ts"), banner + astToString(ast));
console.log(`gen:api ← ${input}`);
