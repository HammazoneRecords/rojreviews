"use server";

import { z } from "zod";
import { chatJson } from "@/lib/ark";

const InputSchema = z.object({
  feedbackText: z.string(),
  feedbackSource: z.enum(["customer", "employee"]),
});
export type ScoreFeedbackInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  qualityScore: z.number(),
  sourceRelevance: z.string(),
  summary: z.string(),
});
export type ScoreFeedbackOutput = z.infer<typeof OutputSchema>;

export async function scoreFeedback(input: ScoreFeedbackInput): Promise<ScoreFeedbackOutput> {
  const parsed = InputSchema.parse(input);
  const raw = await chatJson<unknown>([
    { role: "system", content: 'Quality scorer. Respond ONLY with JSON: {"qualityScore": 0-100, "sourceRelevance": short string, "summary": one-sentence summary}.' },
    { role: "user", content: `Source: ${parsed.feedbackSource}\nFeedback: ${parsed.feedbackText}` },
  ], { temperature: 0.2 });
  return OutputSchema.parse(raw);
}
