import { describe, expect, it } from "vitest";
import { parsePartialJSON } from "./partialJson";

const full = { summary: "Vença o jogo", steps: ["Jogue", "Derrote o chefe"], missable: false, difficulty: 3, tips: [] };

describe("parsePartialJSON", () => {
  it("devolve o objeto completo quando o JSON está completo", () => {
    expect(parsePartialJSON(JSON.stringify(full))).toEqual(full);
  });

  it("aproveita cada prefixo do JSON sem lançar", () => {
    const s = JSON.stringify(full);
    let last: unknown;
    for (let i = 1; i <= s.length; i++) {
      const v = parsePartialJSON(s.slice(0, i));
      if (v !== undefined) last = v;
    }
    expect(last).toEqual(full);
  });

  it("mostra string pela metade e lista em andamento", () => {
    expect(parsePartialJSON('{"summary":"Venç')).toEqual({ summary: "Venç" });
    expect(parsePartialJSON('{"summary":"S","steps":["Jogue","Derr')).toEqual({ summary: "S", steps: ["Jogue", "Derr"] });
  });

  it("descarta chave sem valor e valor literal pela metade", () => {
    expect(parsePartialJSON('{"summary":"S","missable":')).toEqual({ summary: "S" });
    expect(parsePartialJSON('{"summary":"S","missable":fal')).toEqual({ summary: "S" });
    expect(parsePartialJSON('{"summary":"S","diff')).toEqual({ summary: "S" });
  });

  it("lida com aspas escapadas e vazio", () => {
    expect(parsePartialJSON('{"summary":"diz \\"oi\\" e')).toEqual({ summary: 'diz "oi" e' });
    expect(parsePartialJSON("")).toBeUndefined();
    expect(parsePartialJSON("{")).toEqual({});
  });
});
