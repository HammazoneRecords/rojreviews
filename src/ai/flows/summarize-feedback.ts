"use server";

import { z } from "zod";
import { chatJson } from "@/lib/ark";

const InputSchema = z.object({
  customerFeedback: z.string(),
  employeeFeedback: z.string(),
});
export type SummarizeFeedbackInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  customerSummary: z.string(),
  employeeSummary: z.string(),
  keyPositivePoints: z.string(),
  keyNegativePoints: z.string(),
});
export type SummarizeFeedbackOutput = z.infer<typeof OutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  const parsed = InputSchema.parse(input);
  const raw = await chatJson<unknown>([
    { role: "system", content: 'Restaurant feedback summarizer. Respond ONLY with JSON: {"customerSummary": string, "employeeSummary": string, "keyPositivePoints": string, "keyNegativePoints": string}.' },
    { role: "user", content: `CUSTOMER FEEDBACK:\n${parsed.customerFeedback}\n\nEMPLOYEE FEEDBACK:\n${parsed.employeeFeedback}` },
  ], { temperature: 0.3, maxTokens: 2048 });
  return OutputSchema.parse(raw);
}
