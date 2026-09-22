// Single-user v1: the whole app assumes one timezone, overridable via
// APP_TIMEZONE, defaulting to wherever the server actually runs.
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

// Formats a Date as an ISO-like string in APP_TIMEZONE with an explicit UTC
// offset (e.g. "2026-09-22T18:42:00-04:00"). LLM calls use this instead of
// Date#toISOString() so "8am" means the user's 8am, not UTC 8am.
export function formatLocal(date: Date, timeZone: string = APP_TIMEZONE): string {
  const dateTimeParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const local = `${dateTimeParts.year}-${dateTimeParts.month}-${dateTimeParts.day}T${dateTimeParts.hour}:${dateTimeParts.minute}:${dateTimeParts.second}`;

  const tzName =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = tzName.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  const sign = match?.[1]?.startsWith("-") ? "-" : "+";
  const hours = String(Math.abs(Number(match?.[1] ?? 0))).padStart(2, "0");
  const minutes = (match?.[2] ?? "00").padStart(2, "0");

  return `${local}${sign}${hours}:${minutes}`;
}
