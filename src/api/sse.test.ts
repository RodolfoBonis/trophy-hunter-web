import { describe, expect, it } from "vitest";
import { readSSE, type SSEEvent } from "./sse";

function streamOf(...chunks: string[]): Response {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        for (const ch of chunks) c.enqueue(enc.encode(ch));
        c.close();
      },
    }),
  );
}

describe("readSSE", () => {
  it("decodifica eventos, ids e o envelope {data}, mesmo com chunks partidos e CRLF", async () => {
    const got: SSEEvent[] = [];
    await readSSE(
      streamOf("id: 1-0\r\nevent: te", 'xt\r\ndata: {"data":"Olá\\n"}\r\n\r\n', ": comentário\n\n", 'event: ping\ndata: {"data":""}\n\n', 'event: done\ndata: {"data":""}\n\n'),
      (e) => got.push(e),
    );
    expect(got).toEqual([
      { id: "1-0", event: "text", data: "Olá\n" },
      { id: undefined, event: "ping", data: "" },
      { id: undefined, event: "done", data: "" },
    ]);
  });
});
