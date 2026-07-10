import { Router, type IRouter } from "express";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import {
  ValidateCouponQueryParams,
  ValidateCouponResponse,
  ListCouponsResponse,
  CreateCouponBody,
  CreateCouponResponse,
  DeleteCouponParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/coupons/validate", async (req, res): Promise<void> => {
  const params = ValidateCouponQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(
      and(
        eq(couponsTable.code, params.data.code),
        eq(couponsTable.active, true),
        or(isNull(couponsTable.expiresAt), gt(couponsTable.expiresAt, new Date())),
      ),
    );
  if (!coupon) {
    res.status(404).json({ error: "Coupon not found or expired" });
    return;
  }
  res.json(ValidateCouponResponse.parse(coupon));
});

router.get("/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(couponsTable);
  res.json(ListCouponsResponse.parse(rows));
});

router.post("/coupons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [coupon] = await db
    .insert(couponsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateCouponResponse.parse(coupon));
});

router.delete("/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCouponParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(couponsTable).where(eq(couponsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
