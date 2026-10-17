/** Um evento SSE já decodificado (`data` é o JSON `{ "data": string }` da API). */
export interface SSEEvent {
  id?: string;
  event: string;
  data: string;
}

/**
 * Lê uma resposta `text/event-stream` chamando `onEvent` a cada evento completo. Resolve quando a
 * conexão fecha. Tolerante a chunks partidos no meio de linhas e a CRLF.
 */
export async function readSSE(
  response: Response,
  onEvent: (e: SSEEvent) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  let cur: Partial<SSEEvent> & { raw?: string } = {};

  const dispatch = () => {
    if (cur.event || cur.raw !== undefined) {
      let data = cur.raw ?? "";
      try {
        const parsed = JSON.parse(data) as { data?: unknown };
        if (typeof parsed?.data === "string") data = parsed.data;
      } catch {
        /* data não-JSON: repassa cru */
      }
      onEvent({ id: cur.id, event: cur.event ?? "message", data });
    }
    cur = {};
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).replace(/\r$/, "");
      buffer = buffer.slice(nl + 1);
      if (line === "") dispatch();
      else if (line.startsWith(":")) continue;
      else if (line.startsWith("id:")) cur.id = line.slice(3).trim();
      else if (line.startsWith("event:")) cur.event = line.slice(6).trim();
      else if (line.startsWith("data:"))
        cur.raw =
          (cur.raw === undefined ? "" : cur.raw + "\n") +
          line.slice(5).replace(/^ /, "");
    }
  }
}
