import { useEffect, useReducer, useRef } from "react";
import { useApi } from "@/api/ApiProvider";
import { readSSE } from "@/api/sse";

/** Estado da resposta da IA em tempo real. */
export interface AIStreamState {
  /** Aviso corrente do worker ("Na fila", "Limite de uso…"). */
  status?: string;
  /** Pesquisas/leituras feitas pelo modelo, em ordem. */
  tools: string[];
  /** Texto acumulado (chat). */
  text: string;
  /** JSON acumulado (guias) — parcial até o fim; use parsePartialJSON. */
  json: string;
  done: boolean;
  error?: string;
}

const initial: AIStreamState = { tools: [], text: "", json: "", done: false };

type Action =
  { type: "reset" } | { type: "event"; event: string; data: string };

function reducer(state: AIStreamState, action: Action): AIStreamState {
  if (action.type === "reset") return initial;
  const { event, data } = action;
  switch (event) {
    case "text":
      return { ...state, text: state.text + data, status: undefined };
    case "json":
      return { ...state, json: state.json + data, status: undefined };
    case "tool":
      return { ...state, tools: [...state.tools, data] };
    case "status":
      return { ...state, status: data };
    case "done":
      return { ...state, done: true, status: undefined };
    case "error":
      return {
        ...state,
        done: true,
        error: data || "A IA não conseguiu responder.",
        status: undefined,
      };
    default:
      return state;
  }
}

const MAX_RETRIES = 5;

/**
 * Acompanha `GET /ai/streams/{id}` enquanto `active`. Reconecta sozinho (do Last-Event-ID) se a
 * conexão cair antes do evento final e chama `onFinish` uma vez quando a resposta termina (done ou
 * error) — o chamador revalida o recurso no banco. `runKey` recomeça do zero (ex.: regenerar).
 */
export function useAIStream(
  id: string | undefined,
  active: boolean,
  opts: { runKey?: string; onFinish?: () => void } = {},
): AIStreamState {
  const client = useApi();
  const [state, dispatch] = useReducer(reducer, initial);
  const onFinish = useRef(opts.onFinish);
  onFinish.current = opts.onFinish;

  useEffect(() => {
    dispatch({ type: "reset" });
    if (!id || !active) return;
    const ctrl = new AbortController();
    let lastId: string | undefined;
    let finished = false;

    (async () => {
      for (
        let attempt = 0;
        attempt <= MAX_RETRIES && !ctrl.signal.aborted && !finished;
        attempt++
      ) {
        try {
          const res = await client.openStream(
            `/ai/streams/${encodeURIComponent(id)}`,
            { lastEventId: lastId, signal: ctrl.signal },
          );
          await readSSE(res, (e) => {
            if (e.id) lastId = e.id;
            if (e.event === "ping") return;
            attempt = 0; // houve progresso: zera o contador de reconexões
            dispatch({ type: "event", event: e.event, data: e.data });
            if (e.event === "done" || e.event === "error") finished = true;
          });
        } catch (err) {
          if (ctrl.signal.aborted) return;
          if (attempt === MAX_RETRIES) {
            dispatch({
              type: "event",
              event: "error",
              data: "Conexão com a IA perdida. Recarregue para ver o resultado.",
            });
            finished = true;
            void err;
          }
        }
        if (!finished && !ctrl.signal.aborted)
          await new Promise((r) =>
            setTimeout(r, 1000 * Math.min(attempt + 1, 5)),
          );
      }
      if (finished && !ctrl.signal.aborted) onFinish.current?.();
    })();

    return () => ctrl.abort();
  }, [client, id, active, opts.runKey]);

  return state;
}
