import { Router, type IRouter } from "express";
import { avg, count, eq } from "drizzle-orm";
import { db, reviewsTable, productsTable } from "@workspace/db";
import {
  ListProductReviewsParams,
  ListProductReviewsResponse,
  CreateProductReviewParams,
  CreateProductReviewBody,
  CreateProductReviewResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { clerkClient } from "@clerk/express";

const router: IRouter = Router();

router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const params = ListProductReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, params.data.id))
    .orderBy(reviewsTable.createdAt);
  res.json(ListProductReviewsResponse.parse(rows));
});

router.post(
  "/products/:id/reviews",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = CreateProductReviewParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = CreateProductReviewBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, params.data.id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const user = await clerkClient.users.getUser(req.userId!);
    const userName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      user.emailAddresses[0]?.emailAddress ||
      "Anonymous";

    const [review] = await db
      .insert(reviewsTable)
      .values({
        productId: params.data.id,
        userId: req.userId!,
        userName,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        verifiedPurchase: false,
      })
      .returning();

    const [agg] = await db
      .select({ avgRating: avg(reviewsTable.rating), total: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, params.data.id));

    await db
      .update(productsTable)
      .set({
        rating: Number(agg.avgRating ?? 0),
        reviewCount: agg.total,
      })
      .where(eq(productsTable.id, params.data.id));

    res.status(201).json(CreateProductReviewResponse.parse(review));
  },
);

export default router;
