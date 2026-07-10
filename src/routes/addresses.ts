import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, addressesTable } from "@workspace/db";
import {
  ListAddressesResponse,
  CreateAddressBody,
  CreateAddressResponse,
  UpdateAddressParams,
  UpdateAddressBody,
  UpdateAddressResponse,
  DeleteAddressParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/addresses", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(addressesTable)
    .where(eq(addressesTable.userId, req.userId!));
  res.json(ListAddressesResponse.parse(rows));
});

router.post("/addresses", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAddressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.isDefault) {
    await db
      .update(addressesTable)
      .set({ isDefault: false })
      .where(eq(addressesTable.userId, req.userId!));
  }
  const [address] = await db
    .insert(addressesTable)
    .values({ ...parsed.data, userId: req.userId! })
    .returning();
  res.status(201).json(CreateAddressResponse.parse(address));
});

router.patch("/addresses/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAddressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAddressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.isDefault) {
    await db
      .update(addressesTable)
      .set({ isDefault: false })
      .where(eq(addressesTable.userId, req.userId!));
  }
  const [address] = await db
    .update(addressesTable)
    .set(parsed.data)
    .where(
      and(
        eq(addressesTable.id, params.data.id),
        eq(addressesTable.userId, req.userId!),
      ),
    )
    .returning();
  if (!address) {
    res.status(404).json({ error: "Address not found" });
    return;
  }
  res.json(UpdateAddressResponse.parse(address));
});

router.delete(
  "/addresses/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeleteAddressParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db
      .delete(addressesTable)
      .where(
        and(
          eq(addressesTable.id, params.data.id),
          eq(addressesTable.userId, req.userId!),
        ),
      );
    res.sendStatus(204);
  },
);

export default router;
