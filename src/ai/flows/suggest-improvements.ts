"use server";

import { z } from "zod";
import { chatJson } from "@/lib/ark";

const FeedbackItemSchema = z.object({
  text: z.string(),
  type: z.enum(["customer", "employee"]),
});

const InputSchema = z.object({
  restaurantName: z.string(),
  feedback: z.array(FeedbackItemSchema),
});
export type SuggestImprovementsInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  improvements: z.array(z.string()),
});
export type SuggestImprovementsOutput = z.infer<typeof OutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  const parsed = InputSchema.parse(input);
  const formatted = parsed.feedback.map((f, i) => `${i + 1}. [${f.type}] ${f.text}`).join("\n");
  const raw = await chatJson<unknown>([
    { role: "system", content: 'Restaurant improvement coach. Respond ONLY with JSON: {"improvements": string[]}. 3-6 actionable suggestions.' },
    { role: "user", content: `Restaurant: ${parsed.restaurantName}\n\nFeedback items:\n${formatted}` },
  ], { temperature: 0.4, maxTokens: 1024 });
  return OutputSchema.parse(raw);
}
