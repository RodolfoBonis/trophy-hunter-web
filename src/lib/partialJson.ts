/**
 * Interpreta um JSON INCOMPLETO (o guia chega aos pedaços pela stream): fecha strings, arrays e
 * objetos abertos e descarta o último par chave/valor pela metade. Devolve `undefined` se nada
 * aproveitável ainda. Não executa nada — só JSON.parse no texto completado.
 */
export function parsePartialJSON(input: string): unknown {
  const text = input.trim();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    /* incompleto — completa abaixo */
  }

  const stack: ("{" | "[")[] = [];
  let inString = false;
  let escaped = false;
  for (const ch of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") stack.pop();
  }

  let fixed = text;
  if (escaped) fixed = fixed.slice(0, -1);
  if (inString) fixed += '"';
  // Tenta fechar como está; se falhar, recua até a última vírgula/abertura (valor pela metade).
  for (let cut = fixed.length; cut > 0;) {
    const candidate =
      trimDangling(fixed.slice(0, cut)) + closers(fixed.slice(0, cut));
    try {
      return JSON.parse(candidate);
    } catch {
      const prev = Math.max(
        fixed.lastIndexOf(",", cut - 1),
        fixed.lastIndexOf("{", cut - 1),
        fixed.lastIndexOf("[", cut - 1),
      );
      if (prev < 0) return undefined;
      cut = fixed[prev] === "," ? prev : prev + 1;
    }
  }
  return undefined;
}

/**
 * Remove vírgula final e, DENTRO DE OBJETO, a chave sem valor (`"k":` ou `"k"`) no fim do texto.
 * Em array, uma string no fim é um item válido.
 */
function trimDangling(s: string): string {
  let out = s.replace(/,\s*$/, "");
  if (openContainer(out) === "{") {
    out = out
      .replace(/,?\s*"(?:[^"\\]|\\.)*"\s*:\s*$/, "")
      .replace(/([{,])\s*"(?:[^"\\]|\\.)*"\s*$/, (_m, p: string) =>
        p === "{" ? "{" : "",
      );
  }
  return out.replace(/,\s*$/, "");
}

/** Estrutura aberta mais interna no fim de `s` (fora de strings). */
function openContainer(s: string): "{" | "[" | undefined {
  const stack: ("{" | "[")[] = [];
  let inString = false;
  let escaped = false;
  for (const ch of s) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") stack.pop();
  }
  return stack[stack.length - 1];
}

/** Fechamentos para as estruturas abertas em `s` (fora de strings). */
function closers(s: string): string {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (const ch of s) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  return (inString ? '"' : "") + stack.reverse().join("");
}
