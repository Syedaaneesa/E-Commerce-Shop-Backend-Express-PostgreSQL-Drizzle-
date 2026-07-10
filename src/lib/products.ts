import { productsTable, categoriesTable, brandsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";

export function toProductSummary(row: typeof productsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    salePrice: row.salePrice,
    images: row.images,
    rating: row.rating,
    reviewCount: row.reviewCount,
    stock: row.stock,
    featured: row.featured,
    trending: row.trending,
    bestSeller: row.bestSeller,
    newArrival: row.newArrival,
  };
}

export async function toProductDetail(row: typeof productsTable.$inferSelect) {
  const [category] = row.categoryId
    ? await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, row.categoryId))
    : [];
  const [brand] = row.brandId
    ? await db.select().from(brandsTable).where(eq(brandsTable.id, row.brandId))
    : [];
  return {
    ...row,
    categoryName: category?.name ?? null,
    brandName: brand?.name ?? null,
  };
}
