import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/endpoints";
import type { ChatMessage } from "@/api/schemas";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/lib/utils";
import { GenerationProgress } from "./GuidePanel";
import { AIDisclaimer } from "./GuideViews";
import { Markdown } from "./Markdown";
import { useChat, useResetChat, useSendChat } from "./queries";
import { useAIStream } from "./useAIStream";
import { aiRequestError } from "./aiErrors";

const SUGGESTIONS = [
  "Perdi algum troféu perdível até aqui?",
  "O que faço primeiro no que falta?",
  "Qual o troféu mais difícil que falta e como pegar?",
];

/** Resposta do assistente: ao vivo (stream) enquanto gera; depois, o texto salvo. */
function AssistantMessage({
  msg,
  gameId,
}: {
  msg: ChatMessage;
  gameId: string;
}) {
  const qc = useQueryClient();
  const live = msg.status === "pending" || msg.status === "running";
  const stream = useAIStream(msg.id, live, {
    onFinish: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.chat(gameId) }),
  });
  if (live) {
    return (
      <li className="ai-msg assistant" aria-busy="true">
        {stream.text ? (
          <div className="ai-caret">
            <Markdown text={stream.text} />
          </div>
        ) : (
          <GenerationProgress
            status={stream.error ?? stream.status}
            tools={stream.tools}
            writing={false}
          />
        )}
      </li>
    );
  }
  if (msg.status === "error") {
    return (
      <li className="ai-msg assistant">
        <p role="alert" className="!text-danger">
          {msg.error || "A IA não conseguiu responder."}
        </p>
      </li>
    );
  }
  return (
    <li className="ai-msg assistant">
      <Markdown text={msg.content} />
    </li>
  );
}

/**
 * Chat contextual do jogo: a IA recebe o progresso real (o que falta, perdíveis, marcações, notas).
 * Uma pergunta por vez; a resposta chega em tempo real. Spoilers: o modelo é instruído a não revelar
 * história/ocultos sem avisar.
 */
export function ChatPanel({ gameId }: { gameId: string }) {
  const chat = useChat(gameId);
  const send = useSendChat(gameId);
  const reset = useResetChat(gameId);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const messages = chat.data?.messages ?? [];
  const busy =
    send.isPending ||
    messages.some(
      (m) =>
        m.role === "assistant" &&
        (m.status === "pending" || m.status === "running"),
    );

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const submit = (msg: string) => {
    const m = msg.trim();
    if (!m || busy) return;
    send.mutate(m, { onSuccess: () => setText("") });
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(text);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(text);
    }
  };

  return (
    <section aria-label="Chat com a IA" className="ai-panel ai-chat">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="ai-tag">
          <svg aria-hidden>
            <use href="#i-ai" />
          </svg>
          Chat do jogo · conhece o seu progresso
        </span>
        {messages.length > 0 && (
          <button
            type="button"
            className="label cursor-pointer hover:!text-text-1"
            onClick={() => reset.mutate()}
            disabled={busy || reset.isPending}
          >
            Nova conversa
          </button>
        )}
      </div>
      {chat.isPending && (
        <div className="skel skel-line h-10 w-full" aria-busy="true" />
      )}
      {chat.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não foi possível carregar a conversa.
        </p>
      )}
      {messages.length === 0 && chat.data && (
        <div className="chips" role="group" aria-label="Sugestões">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="chip cursor-pointer hover:!text-text-1"
              onClick={() => submit(s)}
              disabled={busy}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {messages.length > 0 && (
        <ul
          ref={listRef}
          className="ai-msgs"
          aria-label="Mensagens"
          aria-live="polite"
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <li key={m.id} className="ai-msg user">
                {m.content}
              </li>
            ) : (
              <AssistantMessage key={m.id} msg={m} gameId={gameId} />
            ),
          )}
        </ul>
      )}
      <form className="ai-compose" onSubmit={onSubmit}>
        <label htmlFor={`chat-${gameId}`} className="sr-only">
          Pergunta para a IA
        </label>
        <textarea
          id={`chat-${gameId}`}
          rows={1}
          maxLength={4000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ex.: estou no capítulo 5, perdi algo?"
          className={cn(
            "rounded-xs border border-border bg-bg-1 p-3 font-sans text-sm text-text-1 placeholder:text-text-3 focus-visible:border-neon-cyan focus-visible:outline-none",
          )}
        />
        <Button type="submit" size="sm" disabled={busy || !text.trim()}>
          {busy ? "Respondendo…" : "Enviar"}
        </Button>
      </form>
      {send.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          {aiRequestError(
            send.error,
            "Não foi possível enviar. Tente de novo.",
          )}
        </p>
      )}
      <AIDisclaimer />
    </section>
  );
}
