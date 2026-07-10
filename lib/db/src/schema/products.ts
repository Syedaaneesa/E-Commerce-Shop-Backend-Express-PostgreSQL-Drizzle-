import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";
import { brandsTable } from "./brands";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  richDescription: text("rich_description"),
  price: doublePrecision("price").notNull(),
  salePrice: doublePrecision("sale_price"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  weightGrams: integer("weight_grams"),
  images: text("images").array().notNull().default([]),
  colors: text("colors").array().notNull().default([]),
  sizes: text("sizes").array().notNull().default([]),
  categoryId: integer("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),
  brandId: integer("brand_id").references(() => brandsTable.id, {
    onDelete: "set null",
  }),
  tags: text("tags").array().notNull().default([]),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  soldCount: integer("sold_count").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  trending: boolean("trending").notNull().default(false),
  bestSeller: boolean("best_seller").notNull().default(false),
  newArrival: boolean("new_arrival").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  rating: true,
  reviewCount: true,
  soldCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
