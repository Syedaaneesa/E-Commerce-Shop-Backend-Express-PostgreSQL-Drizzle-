import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import { db, categoriesTable, brandsTable, productsTable } from "@workspace/db";
import { GetHomeSummaryResponse } from "@workspace/api-zod";
import { toProductSummary } from "../lib/products";

const router: IRouter = Router();

router.get("/home/summary", async (_req, res): Promise<void> => {
  const [categories, brands, trending, bestSellers, newArrivals, flashSale, recommended] =
    await Promise.all([
      db.select().from(categoriesTable),
      db.select().from(brandsTable),
      db
        .select()
        .from(productsTable)
        .where(sql`${productsTable.trending} = true`)
        .limit(8),
      db
        .select()
        .from(productsTable)
        .where(sql`${productsTable.bestSeller} = true`)
        .limit(8),
      db
        .select()
        .from(productsTable)
        .where(sql`${productsTable.newArrival} = true`)
        .limit(8),
      db
        .select()
        .from(productsTable)
        .where(sql`${productsTable.salePrice} IS NOT NULL`)
        .limit(8),
      db
        .select()
        .from(productsTable)
        .where(sql`${productsTable.featured} = true`)
        .orderBy(desc(productsTable.rating))
        .limit(8),
    ]);

  res.json(
    GetHomeSummaryResponse.parse({
      categories,
      brands,
      trending: trending.map(toProductSummary),
      bestSellers: bestSellers.map(toProductSummary),
      newArrivals: newArrivals.map(toProductSummary),
      flashSale: flashSale.map(toProductSummary),
      recommended: recommended.map(toProductSummary),
    }),
  );
});

export default router;
