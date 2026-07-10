import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const wishlistItemsTable = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertWishlistItemSchema = createInsertSchema(
  wishlistItemsTable,
).omit({ id: true, createdAt: true });
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItemsTable.$inferSelect;
