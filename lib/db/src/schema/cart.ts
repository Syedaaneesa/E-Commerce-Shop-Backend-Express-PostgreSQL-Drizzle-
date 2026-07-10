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

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  color: text("color"),
  size: text("size"),
  savedForLater: boolean("saved_for_later").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;
