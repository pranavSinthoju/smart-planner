// Gemini errors carry a numeric `status` and a message that's often raw JSON
// from the API itself — turn that into something worth showing a user.
export function friendlyLLMErrorMessage(err: unknown): string {
  const status = (err as { status?: number })?.status;
  if (status === 503) {
    return "The AI service is temporarily overloaded. Please try again in a moment.";
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  try {
    const parsed = JSON.parse(message);
    return parsed?.error?.message ?? message;
  } catch {
    return message;
  }
}
