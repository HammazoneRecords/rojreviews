import { pgTable, text, integer, numeric, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { user } from "./auth";

export const feedbackTypeEnum = pgEnum("feedback_type", ["customer", "employee"]);
export const sentimentLabelEnum = pgEnum("sentiment_label", ["positive", "negative", "neutral"]);

// Restaurants — fixed catalog (seeded from mock-data initially; admin-managed later).
export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  name: text("name").notNull(),
  logo: text("logo"),
  dataAiHint: text("data_ai_hint"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Feedback — one row per submission. Public submission (no user FK).
export const feedback = pgTable("feedback", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  type: feedbackTypeEnum("type").notNull(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  fawuds: integer("fawuds").notNull().default(0),
  sentimentScore: numeric("sentiment_score", { precision: 4, scale: 3 }),
  sentimentLabel: sentimentLabelEnum("sentiment_label"),
  qualityScore: integer("quality_score"),
  qualityNotes: text("quality_notes"),
  improvementAreas: text("improvement_areas").array().notNull().default(sql`'{}'::text[]`),
  finalComment: text("final_comment").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Per-visitor fawud tracking — enforces the "3 fawuds per user per comment" rule.
// `visitorId` is a client-generated UUID stored in localStorage on the public site.
export const fawudLogs = pgTable("fawud_logs", {
  feedbackId: text("feedback_id").notNull().references(() => feedback.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  count: integer("count").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.feedbackId, table.visitorId] }),
]);

// Email subscribers — from the popup signup dialog.
export const emailSubscribers = pgTable("email_subscribers", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [feedback.restaurantId], references: [restaurants.id] }),
  fawudLogs: many(fawudLogs),
}));

export const fawudLogsRelations = relations(fawudLogs, ({ one }) => ({
  feedback: one(feedback, { fields: [fawudLogs.feedbackId], references: [feedback.id] }),
}));

export type Restaurant = typeof restaurants.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type FawudLog = typeof fawudLogs.$inferSelect;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
