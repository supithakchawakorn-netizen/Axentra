import { z } from "zod";

export const NEWS_PROMPT_VERSION = 1;

export const NewsSummaryOutputZ = z.object({
  body: z
    .string()
    .min(40, "Summary too short.")
    .max(1200, "Summary too long."),
});

export type NewsSummaryOutput = z.infer<typeof NewsSummaryOutputZ>;

export interface NewsHeadline {
  title: string;
  source: string;
  publishedAt: string;
  snippet?: string;
}

export function buildNewsPrompt(params: {
  symbol: string;
  name: string;
  headlines: NewsHeadline[];
}) {
  const headlines = params.headlines
    .map(
      (h, i) =>
        `${i + 1}. ${h.title}${h.snippet ? ` — ${h.snippet}` : ""} (${h.source}, ${h.publishedAt})`,
    )
    .join("\n");
  return {
    system: [
      "You write a short daily news roll-up for a market commentary product.",
      "Audience: retail investors. Keep it neutral and factual.",
      "Strict rules:",
      "- Plain prose. No headings, bullets, or markdown.",
      "- 70–140 words.",
      "- Synthesize across headlines; don't list them.",
      "- Don't invent prices. Quote a single percent move only if a headline contains one.",
      "- No buy / sell calls. No 'should' or 'recommend'.",
    ].join("\n"),
    user: [
      `Ticker: ${params.symbol}`,
      `Name: ${params.name}`,
      "",
      "Today's headlines:",
      headlines,
      "",
      "Write the daily roll-up as JSON: {\"body\": \"...\"}.",
    ].join("\n"),
  };
}
