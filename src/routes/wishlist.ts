import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, wishlistItemsTable, productsTable } from "@workspace/db";
import {
  ListWishlistResponse,
  AddWishlistItemBody,
  AddWishlistItemResponse,
  RemoveWishlistItemParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { toProductSummary } from "../lib/products";

const router: IRouter = Router();

router.get("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: wishlistItemsTable.id,
      productId: wishlistItemsTable.productId,
      createdAt: wishlistItemsTable.createdAt,
      product: productsTable,
    })
    .from(wishlistItemsTable)
    .innerJoin(
      productsTable,
      eq(wishlistItemsTable.productId, productsTable.id),
    )
    .where(eq(wishlistItemsTable.userId, req.userId!));

  res.json(
    ListWishlistResponse.parse(
      rows.map((row) => ({
        id: row.id,
        productId: row.productId,
        createdAt: row.createdAt,
        product: toProductSummary(row.product),
      })),
    ),
  );
});

router.post("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddWishlistItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [existing] = await db
    .select()
    .from(wishlistItemsTable)
    .where(
      and(
        eq(wishlistItemsTable.userId, req.userId!),
        eq(wishlistItemsTable.productId, parsed.data.productId),
      ),
    );
  const item =
    existing ??
    (
      await db
        .insert(wishlistItemsTable)
        .values({ userId: req.userId!, productId: parsed.data.productId })
        .returning()
    )[0];

  res.status(201).json(
    AddWishlistItemResponse.parse({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: toProductSummary(product),
    }),
  );
});

router.delete(
  "/wishlist/:productId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = RemoveWishlistItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db
      .delete(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.userId, req.userId!),
          eq(wishlistItemsTable.productId, params.data.productId),
        ),
      );
    res.sendStatus(204);
  },
);

export default router;
