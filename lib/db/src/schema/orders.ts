import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  subtotal: doublePrecision("subtotal").notNull(),
  shippingCost: doublePrecision("shipping_cost").notNull().default(0),
  taxAmount: doublePrecision("tax_amount").notNull().default(0),
  discountAmount: doublePrecision("discount_amount").notNull().default(0),
  total: doublePrecision("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  couponCode: text("coupon_code"),
  orderNotes: text("order_notes"),
  shippingAddress: text("shipping_address").notNull(),
  trackingStatus: text("tracking_status"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "restrict" }),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  unitPrice: doublePrecision("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  color: text("color"),
  size: text("size"),
});

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({
  id: true,
});
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItemsTable.$inferSelect;
