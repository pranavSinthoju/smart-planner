import type { LLMProvider } from "./types.js";
import { GeminiProvider } from "./gemini.js";

// LLM_PROVIDER env var picks the implementation. Adding Claude later means
// writing a ClaudeProvider class and adding a case here — nothing else changes.
// Cached so a missing API key only fails the request that needs it, not server startup.
let cached: LLMProvider | undefined;

export function getLLMProvider(): LLMProvider {
  if (cached) return cached;

  const provider = process.env.LLM_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
      cached = new GeminiProvider(apiKey, process.env.GEMINI_MODEL);
      return cached;
    }
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}

export type { LLMProvider } from "./types.js";
