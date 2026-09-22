// Gemini's 503 ("model overloaded") is transient — worth one or two quick
// retries before surfacing it as a failure. Anything else (bad request,
// auth, validation) fails immediately since retrying won't help.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 1500): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if (status !== 503 || attempt === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
    }
  }
  throw lastErr;
}
