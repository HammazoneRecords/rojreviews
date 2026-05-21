
import type { scoreFeedback } from '@/ai/flows/score-feedback';
import type { summarizeFeedback } from '@/ai/flows/summarize-feedback';
import type { suggestImprovements } from '@/ai/flows/suggest-improvements';
// Timestamp is now a JS Date — Drizzle returns native Date objects from
// timestamp columns. Previously this was firebase/firestore Timestamp.
export type Timestamp = Date;

// Pagination cursor — used by getFeedbackForRestaurantPaginated.
// With Postgres we use the last-seen createdAt timestamp as the cursor.
export type DocumentSnapshot = { createdAt: Date } | null;

export type ScoreFeedbackOutput = Awaited<ReturnType<typeof scoreFeedback>>;

export type Feedback = {
  id: string;
  type: 'customer' | 'employee';
  text: string;
  author: string;
  fawuds: number;
  sentimentScore?: number;
  qualityScore?: ScoreFeedbackOutput | null;
  improvementAreas: string[];
  finalComment: string;
  createdAt?: Timestamp;
};

export type Restaurant = {
  id: string;
  name: string;
  logo: string;
  data_ai_hint: string;
  feedback: Feedback[];
  averageSentiment?: number;
};

export type Summarization = Awaited<ReturnType<typeof summarizeFeedback>> | null;

export type SuggestImprovementsOutput = Awaited<ReturnType<typeof suggestImprovements>>;

export type Subscriber = {
  id: string;
  email: string;
  username: string;
  subscribedAt: Timestamp;
};
