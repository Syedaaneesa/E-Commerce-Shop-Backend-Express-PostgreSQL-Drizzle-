import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, brandsTable } from "@workspace/db";
import {
  CreateBrandBody,
  ListBrandsResponse,
  CreateBrandResponse,
  DeleteBrandParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/brands", async (_req, res): Promise<void> => {
  const brands = await db.select().from(brandsTable);
  res.json(ListBrandsResponse.parse(brands));
});

router.post("/brands", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBrandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [brand] = await db.insert(brandsTable).values(parsed.data).returning();
  res.status(201).json(CreateBrandResponse.parse(brand));
});

router.delete("/brands/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBrandParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(brandsTable).where(eq(brandsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
