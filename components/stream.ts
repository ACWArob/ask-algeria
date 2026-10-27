export const ERROR_MARK = "\u0000ERROR";

/** Reads a fetch Response body as text chunks. */
export async function readStream(res: Response, onText: (full: string) => void, signal?: AbortSignal): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  for (;;) {
    if (signal?.aborted) {
      await reader.cancel();
      break;
    }
    const { done, value } = await reader.read();
    if (done) break;
    full += dec.decode(value, { stream: true });
    onText(full);
  }
  full += dec.decode();
  onText(full);
  return full;
}
