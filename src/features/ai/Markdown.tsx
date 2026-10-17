import { Fragment, type ReactNode } from "react";

/**
 * Markdown mínimo das respostas do chat (parágrafos, listas, **negrito**, *itálico*, `código`,
 * títulos como negrito). Gera elementos React — nunca HTML cru — então não há injeção.
 */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length)
      blocks.push(<p key={blocks.length}>{inline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it)}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={blocks.length}>{items}</ol>
      ) : (
        <ul key={blocks.length}>{items}</ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]!);
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <p key={blocks.length}>
          <strong>{inline(heading[1]!)}</strong>
        </p>,
      );
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return <>{blocks}</>;
}

/** Ênfases inline: **negrito**, *itálico*, `código`. */
function inline(s: string): ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
      return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
      return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}
