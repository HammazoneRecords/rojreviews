"use server";

import { z } from "zod";
import { chatJson } from "@/lib/ark";

const InputSchema = z.object({
  feedbackText: z.string(),
});
export type GetImprovementSuggestionsInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  suggestions: z.array(z.string()),
});
export type GetImprovementSuggestionsOutput = z.infer<typeof OutputSchema>;

export async function getImprovementSuggestions(input: GetImprovementSuggestionsInput): Promise<GetImprovementSuggestionsOutput> {
  const parsed = InputSchema.parse(input);
  const raw = await chatJson<unknown>([
    { role: "system", content: 'Improvement category classifier. Respond ONLY with JSON: {"suggestions": string[]}. 3-5 short category labels.' },
    { role: "user", content: parsed.feedbackText },
  ], { temperature: 0.2 });
  return OutputSchema.parse(raw);
}
