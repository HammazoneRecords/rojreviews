"use server";

/**
 * Drizzle-backed implementation of the legacy firebase.ts API.
 * All exports are server actions — client components call them transparently.
 * Phase 2 port (2026-05-21) — see BRANCH_STATUS.md.
 */

import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { feedback as feedbackTable, emailSubscribers, fawudLogs } from "@/lib/db/schema/app";
import type { Feedback, ScoreFeedbackOutput, Subscriber, DocumentSnapshot } from "./types";
import { getUsername } from "./username-generator";

const FEEDBACK_PAGE_SIZE = 5;

// DocumentSnapshot is re-exported from ./types so "use server" is happy
// (Server Actions modules can't export types).

function rowToFeedback(r: typeof feedbackTable.$inferSelect): Feedback {
  return {
    id: r.id,
    type: r.type,
    text: r.text,
    author: r.author,
    fawuds: r.fawuds ?? 0,
    sentimentScore: r.sentimentScore != null ? Number(r.sentimentScore) : undefined,
    qualityScore: null, // quality_score / quality_notes columns are simple ints — full ScoreFeedbackOutput rehydration lives at the admin layer
    improvementAreas: r.improvementAreas ?? [],
    finalComment: r.finalComment ?? "",
    createdAt: r.createdAt,
  };
}

export async function addFeedback(
  restaurantId: string,
  feedbackData: Omit<Feedback, "id" | "fawuds" | "author" | "improvementAreas" | "finalComment" | "qualityScore">
): Promise<Feedback> {
  const [row] = await db
    .insert(feedbackTable)
    .values({
      restaurantId,
      type: feedbackData.type,
      text: feedbackData.text,
      author: getUsername(),
      fawuds: 0,
      sentimentScore: feedbackData.sentimentScore != null ? String(feedbackData.sentimentScore) : null,
      improvementAreas: [],
      finalComment: "",
    })
    .returning();
  return rowToFeedback(row);
}

export async function updateFeedback(
  _restaurantId: string,
  feedbackId: string,
  updateData: { improvementAreas: string[]; finalComment?: string }
): Promise<void> {
  const set: Partial<typeof feedbackTable.$inferInsert> = {
    improvementAreas: updateData.improvementAreas,
  };
  if (updateData.finalComment !== undefined) set.finalComment = updateData.finalComment;
  await db.update(feedbackTable).set(set).where(eq(feedbackTable.id, feedbackId));
}

export async function getFeedbackForRestaurant(restaurantId: string): Promise<Feedback[]> {
  const rows = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.restaurantId, restaurantId))
    .orderBy(desc(feedbackTable.createdAt));
  return rows.map(rowToFeedback);
}

export async function getFeedbackForRestaurantPaginated(
  restaurantId: string,
  feedbackType: "customer" | "employee" | null,
  lastVisible: DocumentSnapshot | null = null
): Promise<{ feedback: Feedback[]; lastVisible: DocumentSnapshot | null }> {
  const conditions = [eq(feedbackTable.restaurantId, restaurantId)];
  if (feedbackType) conditions.push(eq(feedbackTable.type, feedbackType));
  if (lastVisible?.createdAt) {
    conditions.push(sql`${feedbackTable.createdAt} < ${lastVisible.createdAt}`);
  }
  const rows = await db
    .select()
    .from(feedbackTable)
    .where(and(...conditions))
    .orderBy(desc(feedbackTable.createdAt))
    .limit(FEEDBACK_PAGE_SIZE);
  const fbk = rows.map(rowToFeedback);
  const last = rows.length > 0 ? { createdAt: rows[rows.length - 1].createdAt } : null;
  return { feedback: fbk, lastVisible: last };
}

export async function addSubscriber(email: string, _username?: string): Promise<void> {
  const normalised = email.trim().toLowerCase();
  // emailSubscribers has unique constraint on email; .onConflictDoNothing
  // returns no rows on duplicate.
  const result = await db
    .insert(emailSubscribers)
    .values({ email: normalised })
    .onConflictDoNothing()
    .returning();
  if (result.length === 0) {
    throw new Error("This email is already subscribed.");
  }
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const rows = await db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.createdAt));
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    username: "", // legacy field — username was generated client-side previously; left blank
    subscribedAt: r.createdAt,
  }));
}

export async function deleteFeedback(_restaurantId: string, feedbackId: string): Promise<void> {
  await db.delete(feedbackTable).where(eq(feedbackTable.id, feedbackId));
}

export async function incrementFawudCount(_restaurantId: string, feedbackId: string): Promise<void> {
  // Legacy behaviour: blind increment. The schema's fawud_logs table enables
  // per-visitor "3 fawud max" enforcement but that requires the visitor ID,
  // which the legacy component does not pass. Keep faithful for now.
  await db
    .update(feedbackTable)
    .set({ fawuds: sql`${feedbackTable.fawuds} + 1` })
    .where(eq(feedbackTable.id, feedbackId));
}

/**
 * Per-visitor fawud — enforces the "3 per user per comment" rule via fawud_logs.
 * Use this from new component code. Throws if visitor has already hit cap.
 */
export async function incrementFawudByVisitor(feedbackId: string, visitorId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [log] = await tx
      .select()
      .from(fawudLogs)
      .where(and(eq(fawudLogs.feedbackId, feedbackId), eq(fawudLogs.visitorId, visitorId)));
    if (log && log.count >= 3) {
      throw new Error("Fawud cap of 3 per comment reached.");
    }
    if (log) {
      await tx
        .update(fawudLogs)
        .set({ count: log.count + 1 })
        .where(and(eq(fawudLogs.feedbackId, feedbackId), eq(fawudLogs.visitorId, visitorId)));
    } else {
      await tx.insert(fawudLogs).values({ feedbackId, visitorId, count: 1 });
    }
    await tx
      .update(feedbackTable)
      .set({ fawuds: sql`${feedbackTable.fawuds} + 1` })
      .where(eq(feedbackTable.id, feedbackId));
  });
}

export async function updateFeedbackSentimentScore(
  _restaurantId: string,
  feedbackId: string,
  sentimentScore: number
): Promise<void> {
  await db
    .update(feedbackTable)
    .set({ sentimentScore: String(sentimentScore) })
    .where(eq(feedbackTable.id, feedbackId));
}

export async function updateFeedbackQualityScore(
  _restaurantId: string,
  feedbackId: string,
  qualityScore: ScoreFeedbackOutput
): Promise<void> {
  await db
    .update(feedbackTable)
    .set({
      qualityScore: Math.round(qualityScore.qualityScore),
      qualityNotes: qualityScore.summary,
    })
    .where(eq(feedbackTable.id, feedbackId));
}
