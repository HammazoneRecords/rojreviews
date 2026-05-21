"use server";

import { z } from "zod";
import { chatJson } from "@/lib/ark";

const InputSchema = z.object({
  text: z.string(),
});
export type AnalyzeSentimentInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  sentimentScore: z.number(),
  sentimentLabel: z.string(),
});
export type AnalyzeSentimentOutput = z.infer<typeof OutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  const parsed = InputSchema.parse(input);
  const raw = await chatJson<unknown>([
    {
      role: "system",
      content:
        "You are a sentiment analysis expert. Respond ONLY with JSON matching this shape: " +
        '{"sentimentScore": number between -1 and 1, "sentimentLabel": "positive" | "negative" | "neutral"}.',
    },
    { role: "user", content: `Analyze the sentiment of this restaurant feedback text:\n\n${parsed.text}` },
  ], { temperature: 0.1 });
  return OutputSchema.parse(raw);
}
