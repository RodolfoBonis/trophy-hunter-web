import { useState } from "react";
import type {
  RoadmapContent,
  RoadmapStage,
  TrophyGuideContent,
} from "@/api/schemas";
import { Button } from "@/design-system/components/ui/button";

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const join = (a: string[]) => a.join("\n");

const fieldClass =
  "w-full resize-y rounded-xs border border-border bg-bg-1 p-3 font-sans text-sm text-text-1 placeholder:text-text-3 focus-visible:border-neon-cyan focus-visible:outline-none";

function Area({
  id,
  label,
  value,
  onChange,
  rows = 3,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  help?: string;
}) {
  return (
    <div className="field !max-w-none">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
      {help && <span className="help">{help}</span>}
    </div>
  );
}

function Text({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field !max-w-none">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </div>
  );
}

function Difficulty({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>Dificuldade (1–10)</label>
      <input
        id={id}
        type="number"
        min={1}
        max={10}
        value={value}
        onChange={(e) =>
          onChange(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
        }
        className={fieldClass}
      />
    </div>
  );
}

function Actions({
  onCancel,
  saving,
}: {
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Salvando…" : "Salvar correção"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}

const LIST_HELP = "Um item por linha.";

/** Editor do guia de troféu: o usuário corrige o que a IA errou (vence o gerado). */
export function TrophyGuideEditor({
  value,
  onSave,
  onCancel,
  saving,
}: {
  value: TrophyGuideContent;
  onSave: (v: TrophyGuideContent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [v, setV] = useState({
    ...value,
    stepsText: join(value.steps),
    prereqText: join(value.prerequisites),
    tipsText: join(value.tips),
  });
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) =>
    setV((s) => ({ ...s, [k]: val }));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const { stepsText, prereqText, tipsText, ...rest } = v;
        onSave({
          ...rest,
          steps: lines(stepsText),
          prerequisites: lines(prereqText),
          tips: lines(tipsText),
        });
      }}
    >
      <Area
        id="g-summary"
        label="Resumo"
        value={v.summary}
        onChange={(x) => set("summary", x)}
        rows={2}
      />
      <Area
        id="g-steps"
        label="Passo a passo"
        value={v.stepsText}
        onChange={(x) => set("stepsText", x)}
        rows={6}
        help={LIST_HELP}
      />
      <Area
        id="g-prereq"
        label="Pré-requisitos"
        value={v.prereqText}
        onChange={(x) => set("prereqText", x)}
        help={LIST_HELP}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Difficulty
          id="g-diff"
          value={v.difficulty}
          onChange={(x) => set("difficulty", x)}
        />
        <Text
          id="g-time"
          label="Tempo estimado"
          value={v.estimated_time}
          onChange={(x) => set("estimated_time", x)}
        />
        <label className="switch self-end">
          <input
            type="checkbox"
            checked={v.missable}
            onChange={(e) => set("missable", e.target.checked)}
          />
          Perdível
        </label>
      </div>
      {v.missable && (
        <Text
          id="g-ponr"
          label="Ponto de não retorno"
          value={v.point_of_no_return}
          onChange={(x) => set("point_of_no_return", x)}
        />
      )}
      <Area
        id="g-tips"
        label="Dicas"
        value={v.tipsText}
        onChange={(x) => set("tipsText", x)}
        help={LIST_HELP}
      />
      <Actions onCancel={onCancel} saving={saving} />
    </form>
  );
}

/** Editor do roadmap: resumo, tempo, jogadas e etapas (troféus/perdíveis um por linha). */
export function RoadmapEditor({
  value,
  onSave,
  onCancel,
  saving,
}: {
  value: RoadmapContent;
  onSave: (v: RoadmapContent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [v, setV] = useState(value);
  const [stages, setStages] = useState(
    value.stages.map((s) => ({
      ...s,
      trophiesText: join(s.trophies),
      missablesText: join(s.missables),
    })),
  );
  const [tips, setTips] = useState(join(value.tips));
  const [missables, setMissables] = useState(join(value.missables_overview));
  const setStage = (i: number, patch: Partial<(typeof stages)[number]>) =>
    setStages((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const out: RoadmapStage[] = stages
          .filter((s) => s.title.trim())
          .map(({ trophiesText, missablesText, ...s }) => ({
            ...s,
            trophies: lines(trophiesText),
            missables: lines(missablesText),
          }));
        onSave({
          ...v,
          stages: out,
          tips: lines(tips),
          missables_overview: lines(missables),
        });
      }}
    >
      <Area
        id="r-summary"
        label="Resumo"
        value={v.summary}
        onChange={(x) => setV({ ...v, summary: x })}
        rows={2}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Difficulty
          id="r-diff"
          value={v.difficulty}
          onChange={(x) => setV({ ...v, difficulty: x })}
        />
        <Text
          id="r-time"
          label="Tempo restante"
          value={v.estimated_total_time}
          onChange={(x) => setV({ ...v, estimated_total_time: x })}
        />
        <div className="field">
          <label htmlFor="r-play">Jogadas</label>
          <input
            id="r-play"
            type="number"
            min={1}
            value={v.playthroughs}
            onChange={(e) =>
              setV({
                ...v,
                playthroughs: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className={fieldClass}
          />
        </div>
      </div>
      <Area
        id="r-missables"
        label="Perdíveis do jogo"
        value={missables}
        onChange={setMissables}
        help={LIST_HELP}
      />
      {stages.map((s, i) => (
        <fieldset
          key={i}
          className="flex flex-col gap-3 border border-border-subtle p-3"
        >
          <legend className="label px-1">Etapa {i + 1}</legend>
          <Text
            id={`r-s${i}-t`}
            label="Título"
            value={s.title}
            onChange={(x) => setStage(i, { title: x })}
          />
          <Area
            id={`r-s${i}-d`}
            label="O que fazer"
            value={s.description}
            onChange={(x) => setStage(i, { description: x })}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Area
              id={`r-s${i}-tr`}
              label="Troféus"
              value={s.trophiesText}
              onChange={(x) => setStage(i, { trophiesText: x })}
              help={LIST_HELP}
            />
            <Area
              id={`r-s${i}-m`}
              label="Perdíveis antes de avançar"
              value={s.missablesText}
              onChange={(x) => setStage(i, { missablesText: x })}
              help={LIST_HELP}
            />
          </div>
          <button
            type="button"
            className="label self-start cursor-pointer hover:!text-danger"
            onClick={() => setStages((all) => all.filter((_, j) => j !== i))}
          >
            Remover etapa
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="label self-start cursor-pointer hover:!text-text-1"
        onClick={() =>
          setStages((all) => [
            ...all,
            {
              title: "",
              description: "",
              trophies: [],
              missables: [],
              trophiesText: "",
              missablesText: "",
            },
          ])
        }
      >
        + Adicionar etapa
      </button>
      <Area
        id="r-tips"
        label="Dicas"
        value={tips}
        onChange={setTips}
        help={LIST_HELP}
      />
      <Actions onCancel={onCancel} saving={saving} />
    </form>
  );
}
