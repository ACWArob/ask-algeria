import type { Locale } from "@/lib/i18n";

/**
 * Voice questions use the browser's own speech recognition (Web Speech API): Chrome and Android send the audio to
 * Google, Safari to Apple. The audio never reaches our server: the words fill the question box, the person checks
 * them, and what they send is redacted like typed text. Browsers without it (Firefox) don't show the button.
 * Browser-side module: no data imports.
 */
export const SPEECH_LANG: Record<Locale, string> = { en: "en-US", fr: "fr-FR", ar: "ar-DZ", dz: "ar-DZ" };

interface ResultList {
  length: number;
  [i: number]: { isFinal: boolean; 0: { transcript: string } };
}
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ResultList }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
export type SpeechCtor = new () => SpeechRecognitionLike;

export function speechCtor(w: unknown): SpeechCtor | null {
  const x = w as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor } | undefined;
  return x?.SpeechRecognition ?? x?.webkitSpeechRecognition ?? null;
}

export type VoiceError = "denied" | "noSpeech" | "failed";

/** Browser error codes → what we tell the person. "aborted" is our own stop, not an error. */
export function voiceError(code: string): VoiceError | null {
  if (code === "aborted") return null;
  if (code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture") return "denied";
  if (code === "no-speech") return "noSpeech";
  return "failed";
}

/** Starts one listening session; returns a function that stops it. onEnd always runs exactly once. */
export function listen(
  Ctor: SpeechCtor,
  opts: { locale: Locale; onText: (text: string) => void; onError: (kind: VoiceError) => void; onEnd: () => void },
): () => void {
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    opts.onEnd();
  };
  let r: SpeechRecognitionLike;
  try {
    r = new Ctor();
    r.lang = SPEECH_LANG[opts.locale];
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      opts.onText(text.replace(/\s+/g, " ").trim());
    };
    r.onerror = (e) => {
      const kind = voiceError(e.error);
      if (kind) opts.onError(kind);
    };
    r.onend = end;
    r.start();
  } catch {
    opts.onError("failed");
    end();
    return () => {};
  }
  return () => {
    try {
      r.stop();
    } catch {
      end();
    }
  };
}
