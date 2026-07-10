import { boolean, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const insertAddressSchema = createInsertSchema(addressesTable).omit({
  id: true,
});
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addressesTable.$inferSelect;
