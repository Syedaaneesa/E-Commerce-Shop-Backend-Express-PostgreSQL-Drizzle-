import { and, eq } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";

export async function buildCart(userId: string) {
  const rows = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      color: cartItemsTable.color,
      size: cartItemsTable.size,
      savedForLater: cartItemsTable.savedForLater,
      productName: productsTable.name,
      productSlug: productsTable.slug,
      productImages: productsTable.images,
      price: productsTable.price,
      salePrice: productsTable.salePrice,
      stock: productsTable.stock,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(
      and(
        eq(cartItemsTable.userId, userId),
        eq(cartItemsTable.savedForLater, false),
      ),
    );

  const items = rows.map((row) => {
    const unitPrice = row.salePrice ?? row.price;
    return {
      id: row.id,
      productId: row.productId,
      productName: row.productName,
      productSlug: row.productSlug,
      productImage: row.productImages?.[0] ?? null,
      unitPrice,
      quantity: row.quantity,
      color: row.color,
      size: row.size,
      stock: row.stock,
      savedForLater: row.savedForLater,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, subtotal, itemCount };
}
