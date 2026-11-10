import { describe, expect, it, vi } from "vitest";
import { listen, SPEECH_LANG, speechCtor, voiceError, type SpeechRecognitionLike } from "@/lib/voice";

class FakeRecognition implements SpeechRecognitionLike {
  static last: FakeRecognition | null = null;
  lang = "";
  interimResults = false;
  continuous = true;
  maxAlternatives = 5;
  onresult: SpeechRecognitionLike["onresult"] = null;
  onerror: SpeechRecognitionLike["onerror"] = null;
  onend: SpeechRecognitionLike["onend"] = null;
  started = false;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.started = true;
  }
  stop() {
    this.onend?.();
  }
  say(parts: [string, boolean][]) {
    const results = Object.assign(parts.map(([t, f]) => ({ isFinal: f, 0: { transcript: t } })), { length: parts.length });
    this.onresult?.({ results });
  }
}

describe("voice questions (browser speech recognition)", () => {
  it("is only offered where the browser has it", () => {
    expect(speechCtor({})).toBeNull();
    expect(speechCtor(undefined)).toBeNull();
    expect(speechCtor({ webkitSpeechRecognition: FakeRecognition })).toBe(FakeRecognition);
    expect(speechCtor({ SpeechRecognition: FakeRecognition })).toBe(FakeRecognition);
  });

  it("listens in the page language, Algerian Arabic for ar and Darija", () => {
    expect(SPEECH_LANG).toEqual({ en: "en-US", fr: "fr-FR", ar: "ar-DZ", dz: "ar-DZ" });
    listen(FakeRecognition, { locale: "dz", onText: () => {}, onError: () => {}, onEnd: () => {} });
    const r = FakeRecognition.last!;
    expect(r.started).toBe(true);
    expect(r.lang).toBe("ar-DZ");
    expect(r.interimResults).toBe(true);
    expect(r.continuous).toBe(false);
  });

  it("fills the words in as they come and ends once when stopped", () => {
    const onText = vi.fn();
    const onEnd = vi.fn();
    const stop = listen(FakeRecognition, { locale: "fr", onText, onError: () => {}, onEnd });
    const r = FakeRecognition.last!;
    r.say([["comment renouveler ", false]]);
    r.say([["comment renouveler  mon passeport", true]]);
    expect(onText).toHaveBeenLastCalledWith("comment renouveler mon passeport");
    stop();
    r.onend?.();
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("explains a blocked microphone or silence, and stays quiet when the person stops it", () => {
    expect(voiceError("not-allowed")).toBe("denied");
    expect(voiceError("audio-capture")).toBe("denied");
    expect(voiceError("no-speech")).toBe("noSpeech");
    expect(voiceError("network")).toBe("failed");
    expect(voiceError("aborted")).toBeNull();
  });

  it("a browser that refuses to start reports a failure instead of hanging", () => {
    class Broken extends FakeRecognition {
      start() {
        throw new Error("InvalidStateError");
      }
    }
    const onError = vi.fn();
    const onEnd = vi.fn();
    listen(Broken, { locale: "en", onText: () => {}, onError, onEnd });
    expect(onError).toHaveBeenCalledWith("failed");
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
