/**
 * Reads a JSON request body of at most `max` bytes. Bodies are small (a question, a short context); anything bigger
 * is refused before it is parsed, so a 4 MB "question" can't tie up a server. Throws BodyTooLarge or SyntaxError.
 */
export class BodyTooLarge extends Error {}

export async function readText(req: Request, max: number): Promise<string> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > max) throw new BodyTooLarge();
  const text = await req.text();
  if (text.length > max) throw new BodyTooLarge();
  return text;
}
export async function readJson<T = unknown>(req: Request, max: number): Promise<T> {
  return JSON.parse(await readText(req, max)) as T;
}

/** The error response for a body that couldn't be read. */
export const bodyError = (e: unknown) => (e instanceof BodyTooLarge ? { error: "too_large", status: 413 } : { error: "bad_json", status: 400 });
