import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  GetCartResponse,
  AddCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { buildCart } from "../lib/cart";

const router: IRouter = Router();

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  res.json(GetCartResponse.parse(await buildCart(req.userId!)));
});

router.delete("/cart", requireAuth, async (req, res): Promise<void> => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
  res.sendStatus(204);
});

router.post("/cart/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddCartItemBody.safeParse(req.body);
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

  const existingConditions = [
    eq(cartItemsTable.userId, req.userId!),
    eq(cartItemsTable.productId, parsed.data.productId),
    eq(cartItemsTable.savedForLater, false),
  ];
  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(...existingConditions));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + parsed.data.quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      userId: req.userId!,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      color: parsed.data.color,
      size: parsed.data.size,
    });
  }

  res.status(201).json(GetCartResponse.parse(await buildCart(req.userId!)));
});

router.patch(
  "/cart/items/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateCartItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateCartItemBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    if (parsed.data.quantity === 0) {
      await db
        .delete(cartItemsTable)
        .where(
          and(
            eq(cartItemsTable.id, params.data.id),
            eq(cartItemsTable.userId, req.userId!),
          ),
        );
    } else {
      await db
        .update(cartItemsTable)
        .set(parsed.data)
        .where(
          and(
            eq(cartItemsTable.id, params.data.id),
            eq(cartItemsTable.userId, req.userId!),
          ),
        );
    }

    res.json(GetCartResponse.parse(await buildCart(req.userId!)));
  },
);

router.delete(
  "/cart/items/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = RemoveCartItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.id, params.data.id),
          eq(cartItemsTable.userId, req.userId!),
        ),
      );
    res.json(GetCartResponse.parse(await buildCart(req.userId!)));
  },
);

export default router;
