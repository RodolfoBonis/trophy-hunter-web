import { queryKeys } from "@/api/endpoints";
import {
  roadmapContentSchema,
  trophyGuideContentSchema,
  type RoadmapContent,
  type TrophyGuideContent,
} from "@/api/schemas";
import { GuidePanel } from "./GuidePanel";
import { RoadmapEditor, TrophyGuideEditor } from "./GuideEditors";
import { RoadmapView, TrophyGuideView } from "./GuideViews";
import {
  useEditGuide,
  useGenerateRoadmap,
  useGenerateTrophyGuide,
  useRoadmap,
  useTrophyGuide,
} from "./queries";

/** Guia de IA de um troféu (aberto sob a linha do troféu). */
export function TrophyGuidePanel({ trophyId }: { trophyId: string }) {
  const key = queryKeys.trophyGuide(trophyId);
  const guide = useTrophyGuide(trophyId);
  const generate = useGenerateTrophyGuide(trophyId);
  const edit = useEditGuide(key);
  return (
    <GuidePanel<TrophyGuideContent>
      guide={guide.data}
      loading={guide.isPending}
      queryKey={key}
      schema={trophyGuideContentSchema}
      render={(c, live) => <TrophyGuideView c={c} live={live} />}
      editor={(value, onSave, onCancel, saving) => (
        <TrophyGuideEditor
          value={value}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      )}
      onGenerate={() => generate.mutate()}
      generating={generate.isPending}
      generateError={generate.error}
      onSaveEdit={(content) =>
        guide.data && edit.mutate({ id: guide.data.id, content })
      }
      savingEdit={edit.isPending}
      noun="guia"
      emptyHint="Gera o passo a passo deste troféu, com dificuldade, tempo e se é perdível."
    />
  );
}

/** Roadmap de platina/100% do jogo, a partir do progresso atual. */
export function RoadmapPanel({
  gameId,
  platform,
}: {
  gameId: string;
  platform: "steam" | "psn";
}) {
  const key = queryKeys.roadmap(gameId);
  const roadmap = useRoadmap(gameId);
  const generate = useGenerateRoadmap(gameId);
  const edit = useEditGuide(key);
  return (
    <GuidePanel<RoadmapContent>
      guide={roadmap.data}
      loading={roadmap.isPending}
      queryKey={key}
      schema={roadmapContentSchema}
      render={(c, live) => <RoadmapView c={c} live={live} />}
      editor={(value, onSave, onCancel, saving) => (
        <RoadmapEditor
          value={value}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      )}
      onGenerate={() => generate.mutate()}
      generating={generate.isPending}
      generateError={generate.error}
      onSaveEdit={(content) =>
        roadmap.data && edit.mutate({ id: roadmap.data.id, content })
      }
      savingEdit={edit.isPending}
      noun="roadmap"
      emptyHint={`Monta a ordem para ${platform === "psn" ? "platinar" : "fazer 100%"} a partir do que falta: etapas, perdíveis a garantir e tempo restante.`}
    />
  );
}
