import { Router, type IRouter } from "express";
import { and, eq, or } from "drizzle-orm";
import {
  db,
  ordersTable,
  orderItemsTable,
  addressesTable,
  couponsTable,
  cartItemsTable,
  productsTable,
} from "@workspace/db";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  CancelOrderParams,
  CancelOrderResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/auth";
import { buildCart } from "../lib/cart";

const router: IRouter = Router();

async function loadOrder(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));
  return { ...order, items };
}

router.get("/orders", requireAuth, optionalAuth, async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conditions = req.isAdmin ? [] : [eq(ordersTable.userId, req.userId!)];
  if (params.data.status) conditions.push(eq(ordersTable.status, params.data.status));

  const orders = await db
    .select()
    .from(ordersTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(ordersTable.createdAt);

  const withItems = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id)),
    })),
  );

  res.json(ListOrdersResponse.parse(withItems));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [address] = await db
    .select()
    .from(addressesTable)
    .where(
      and(
        eq(addressesTable.id, parsed.data.addressId),
        eq(addressesTable.userId, req.userId!),
      ),
    );
  if (!address) {
    res.status(400).json({ error: "Address not found" });
    return;
  }

  const cart = await buildCart(req.userId!);
  if (cart.items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  let discountAmount = 0;
  if (parsed.data.couponCode) {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.code, parsed.data.couponCode),
          eq(couponsTable.active, true),
        ),
      );
    if (coupon) {
      discountAmount =
        coupon.discountType === "percentage"
          ? (cart.subtotal * coupon.discountValue) / 100
          : coupon.discountValue;
      discountAmount = Math.min(discountAmount, cart.subtotal);
    }
  }

  const shippingCost = cart.subtotal >= 100 ? 0 : 9.99;
  const taxAmount = Math.round((cart.subtotal - discountAmount) * 0.08 * 100) / 100;
  const total =
    Math.round((cart.subtotal - discountAmount + shippingCost + taxAmount) * 100) /
    100;

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const shippingAddress = `${address.fullName}, ${address.line1}${
    address.line2 ? ", " + address.line2 : ""
  }, ${address.city}, ${address.state} ${address.postalCode}, ${address.country} · ${address.phone}`;

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: req.userId!,
      orderNumber,
      status: "pending",
      subtotal: cart.subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      paymentMethod: parsed.data.paymentMethod,
      couponCode: parsed.data.couponCode,
      orderNotes: parsed.data.orderNotes,
      shippingAddress,
      trackingStatus: "processing",
    })
    .returning();

  for (const item of cart.items) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    });
    await db
      .update(productsTable)
      .set({
        stock: item.stock - item.quantity,
        soldCount: item.quantity,
      })
      .where(eq(productsTable.id, item.productId));
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));

  res.status(201).json(CreateOrderResponse.parse(await loadOrder(order.id)));
});

router.get("/orders/:id", requireAuth, optionalAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const order = await loadOrder(params.data.id);
  if (!order || (!req.isAdmin && order.userId !== req.userId)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(order));
});

router.patch(
  "/orders/:id/status",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateOrderStatusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateOrderStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [updated] = await db
      .update(ordersTable)
      .set({ status: parsed.data.status })
      .where(eq(ordersTable.id, params.data.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(UpdateOrderStatusResponse.parse(await loadOrder(updated.id)));
  },
);

router.patch(
  "/orders/:id/cancel",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = CancelOrderParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [updated] = await db
      .update(ordersTable)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(ordersTable.id, params.data.id),
          eq(ordersTable.userId, req.userId!),
        ),
      )
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(CancelOrderResponse.parse(await loadOrder(updated.id)));
  },
);

export default router;
