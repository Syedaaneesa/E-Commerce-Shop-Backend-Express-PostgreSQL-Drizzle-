import { Router, type IRouter } from "express";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db, productsTable, categoriesTable, brandsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  UpdateProductBody,
  CreateProductResponse,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductResponse,
  DeleteProductParams,
  GetRelatedProductsParams,
  GetRelatedProductsResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { toProductSummary, toProductDetail } from "../lib/products";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data;
  const conditions: SQL[] = [];
  if (q.search)
    conditions.push(
      or(
        ilike(productsTable.name, `%${q.search}%`),
        ilike(productsTable.description, `%${q.search}%`),
      )!,
    );
  if (q.categoryId != null)
    conditions.push(eq(productsTable.categoryId, q.categoryId));
  if (q.brandId != null) conditions.push(eq(productsTable.brandId, q.brandId));
  if (q.minPrice != null) conditions.push(gte(productsTable.price, q.minPrice));
  if (q.maxPrice != null) conditions.push(lte(productsTable.price, q.maxPrice));
  if (q.color)
    conditions.push(sql`${q.color} = ANY(${productsTable.colors})`);
  if (q.size) conditions.push(sql`${q.size} = ANY(${productsTable.sizes})`);
  if (q.minRating != null)
    conditions.push(gte(productsTable.rating, q.minRating));
  if (q.featured != null) conditions.push(eq(productsTable.featured, q.featured));
  if (q.trending != null) conditions.push(eq(productsTable.trending, q.trending));
  if (q.bestSeller != null)
    conditions.push(eq(productsTable.bestSeller, q.bestSeller));
  if (q.newArrival != null)
    conditions.push(eq(productsTable.newArrival, q.newArrival));
  if (q.onSale) conditions.push(sql`${productsTable.salePrice} IS NOT NULL`);

  const where = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    q.sort === "price_asc"
      ? [asc(productsTable.price)]
      : q.sort === "price_desc"
        ? [desc(productsTable.price)]
        : q.sort === "rating"
          ? [desc(productsTable.rating)]
          : q.sort === "best_selling"
            ? [desc(productsTable.soldCount)]
            : [desc(productsTable.createdAt)];

  const page = q.page ?? 1;
  const limit = q.limit ?? 24;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(where),
  ]);

  res.json(
    ListProductsResponse.parse({
      items: rows.map(toProductSummary),
      total: count,
      page,
      limit,
    }),
  );
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db
    .insert(productsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateProductResponse.parse(await toProductDetail(product)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const idOrSlug = params.data.id;
  const isNumeric = /^\d+$/.test(idOrSlug);
  const [product] = await db
    .select()
    .from(productsTable)
    .where(
      isNumeric
        ? eq(productsTable.id, parseInt(idOrSlug, 10))
        : eq(productsTable.slug, idOrSlug),
    );
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(await toProductDetail(product)));
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set(parsed.data)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(await toProductDetail(product)));
});

router.delete(
  "/products/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeleteProductParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
    res.sendStatus(204);
  },
);

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const params = GetRelatedProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));
  if (!product || product.categoryId == null) {
    res.json(GetRelatedProductsResponse.parse([]));
    return;
  }
  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.categoryId, product.categoryId),
        sql`${productsTable.id} != ${product.id}`,
      ),
    )
    .limit(8);
  res.json(GetRelatedProductsResponse.parse(rows.map(toProductSummary)));
});

export default router;
