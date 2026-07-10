import { Router, type IRouter } from "express";
import { gte, lt, sql } from "drizzle-orm";
import {
  db,
  ordersTable,
  orderItemsTable,
  productsTable,
} from "@workspace/db";
import { clerkClient } from "@clerk/express";
import { GetAdminSummaryResponse, GetAdminSalesChartResponse } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/summary", requireAdmin, async (_req, res): Promise<void> => {
  const [[{ totalRevenue }], [{ totalOrders }], [{ totalProducts }], [{ pendingOrders }], [{ lowStockCount }], recentOrders, customerList] =
    await Promise.all([
      db.select({ totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)::float` }).from(ordersTable),
      db.select({ totalOrders: sql<number>`count(*)::int` }).from(ordersTable),
      db.select({ totalProducts: sql<number>`count(*)::int` }).from(productsTable),
      db
        .select({ pendingOrders: sql<number>`count(*)::int` })
        .from(ordersTable)
        .where(sql`${ordersTable.status} = 'pending'`),
      db
        .select({ lowStockCount: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(lt(productsTable.stock, 10)),
      db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} desc`).limit(5),
      clerkClient.users.getUserList({ limit: 1 }),
    ]);

  const recentOrdersWithItems = await Promise.all(
    recentOrders.map(async (order) => ({
      ...order,
      items: await db
        .select()
        .from(orderItemsTable)
        .where(sql`${orderItemsTable.orderId} = ${order.id}`),
    })),
  );

  res.json(
    GetAdminSummaryResponse.parse({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers: customerList.totalCount,
      pendingOrders,
      lowStockCount,
      recentOrders: recentOrdersWithItems,
    }),
  );
});

router.get(
  "/admin/sales-chart",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const days = 14;
    const points: { date: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setUTCHours(0, 0, 0, 0);
      dayStart.setUTCDate(dayStart.getUTCDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const [row] = await db
        .select({
          revenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)::float`,
          orders: sql<number>`count(*)::int`,
        })
        .from(ordersTable)
        .where(
          sql`${gte(ordersTable.createdAt, dayStart)} and ${lt(
            ordersTable.createdAt,
            dayEnd,
          )}`,
        );

      points.push({
        date: dayStart.toISOString().slice(0, 10),
        revenue: row?.revenue ?? 0,
        orders: row?.orders ?? 0,
      });
    }
    res.json(GetAdminSalesChartResponse.parse(points));
  },
);

export default router;
