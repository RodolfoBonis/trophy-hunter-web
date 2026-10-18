import { useSyncExternalStore } from "react";

/**
 * Som opcional dos avisos — DESLIGADO por padrão (preferência no localStorage). Sintetizado com
 * WebAudio (sem arquivo): um "ding" curto para troféu e um arpejo para platina/100%.
 */
const KEY = "th:unlock-sound";
const listeners = new Set<() => void>();

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* sem storage: ignora */
  }
  listeners.forEach((l) => l());
}

/** Preferência reativa (re-renderiza quando muda em qualquer lugar do app). */
export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isSoundOn,
    () => false,
  );
}

let ctx: AudioContext | undefined;

/** Toca o som do aviso se o usuário ligou. Falhas (autoplay bloqueado) são silenciosas. */
export function playUnlockSound(kind: "trophy" | "platinum"): void {
  if (!isSoundOn() || typeof AudioContext === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const notes =
      kind === "platinum" ? [523.25, 659.25, 783.99, 1046.5] : [880, 1318.5];
    const t0 = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t0 + i * 0.11;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  } catch {
    /* sem áudio */
  }
}
