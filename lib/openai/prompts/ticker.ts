import { z } from "zod";

/**
 * Ticker summary prompt.
 *
 * Bumping `TICKER_PROMPT_VERSION` forces the cron to regenerate every row on
 * the next pass (rows are keyed by (ticker_id, prompt_version) — older
 * versions are simply ignored on reads).
 */
export const TICKER_PROMPT_VERSION = 1;

export const TickerSummaryOutputZ = z.object({
  body: z
    .string()
    .min(40, "Summary too short.")
    .max(1200, "Summary too long."),
});

export type TickerSummaryOutput = z.infer<typeof TickerSummaryOutputZ>;

export function buildTickerPrompt(params: { symbol: string; name: string }) {
  return {
    system: [
      "You write neutral, factual company summaries for a market video / live commentary product.",
      "Audience: retail investors who already understand basic market terms.",
      "Strict rules:",
      "- Plain prose, no headings, no bullets, no markdown.",
      "- 80–160 words.",
      "- Cover what the company does, key business lines / revenue mix, and the dominant near-term narrative.",
      "- Never say 'as of' or invent dates. Avoid price levels.",
      "- Never give buy/sell guidance. Never say 'should' or 'recommend'.",
      "- No emojis.",
    ].join("\n"),
    user: [
      `Ticker: ${params.symbol}`,
      `Name: ${params.name}`,
      "",
      "Write the summary as JSON: {\"body\": \"...\"}.",
    ].join("\n"),
  };
}
