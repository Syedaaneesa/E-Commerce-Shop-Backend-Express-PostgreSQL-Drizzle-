import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
