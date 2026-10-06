import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE_NAME, verifyCustomerToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { getImageSource } from "@/lib/productImageSource";

function getCustomer(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  return token ? verifyCustomerToken(token) : null;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Please sign in to manage your wishlist." },
    { status: 401 }
  );
}

export async function GET(request) {
  const customer = getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const productColumns = new Set(
      (await query("SHOW COLUMNS FROM products")).map((column) => column.Field)
    );
    const productQty = productColumns.has("qty") ? "p.qty" : "0";
    const wishlistRows = await query(
      `SELECT
         p.item_id,
         p.title,
         p.price,
         p.discount,
         p.main_image,
         ${productQty} AS qty,
         c.name AS category_name
       FROM wishlists w
       INNER JOIN products p ON p.item_id = w.item_id
       LEFT JOIN categories c ON c.category_id = p.category_id
       WHERE w.user_id = ? AND p.status = 'active'
       ORDER BY w.created_at DESC, w.wishlist_id DESC`,
      [customer.user_id]
    );

    if (!wishlistRows.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const itemIds = wishlistRows.map((item) => item.item_id);
    const variants = await query(
      `SELECT
         pv.item_id,
         pv.variant_id,
         pv.stock_quantity AS stock,
         pv.price,
         pv.discount,
         s.name AS size,
         c.color_id,
         c.name AS color,
         c.hex_code AS color_hex
       FROM product_variants pv
       LEFT JOIN sizes s ON s.size_id = pv.size_id
       LEFT JOIN colors c ON c.color_id = pv.color_id
       WHERE pv.status = 'active'
         AND pv.item_id IN (${itemIds.map(() => "?").join(", ")})
       ORDER BY pv.item_id, pv.variant_id`,
      itemIds
    );

    const variantsByItem = new Map();
    for (const variant of variants) {
      const itemVariants = variantsByItem.get(variant.item_id) || [];
      itemVariants.push({
        ...variant,
        stock: Number(variant.stock) || 0,
        price: Number(variant.price) || 0,
        discount: Number(variant.discount) || 0,
      });
      variantsByItem.set(variant.item_id, itemVariants);
    }

    const data = wishlistRows.map((item) => {
      const itemVariants = variantsByItem.get(item.item_id) || [];
      const variantStock = itemVariants.reduce(
        (total, variant) => total + variant.stock,
        0
      );
      const stock = variantStock > 0
        ? variantStock
        : Number(item.qty) || 0;

      return {
        id: item.item_id,
        name: item.title,
        category: item.category_name || "",
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0,
        image: getImageSource(item.main_image),
        stock,
        qty: stock,
        variants: itemVariants,
        sizes: [...new Set(itemVariants.map((variant) => variant.size).filter(Boolean))],
        colors: [
          ...new Map(
            itemVariants
              .filter((variant) => variant.color)
              .map((variant) => [
                variant.color_id || variant.color,
                {
                  name: variant.color,
                  hex_code: variant.color_hex || "",
                },
              ])
          ).values(),
        ],
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get customer wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your wishlist." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const customer = getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const body = await request.json();
    const itemId = Number(body.item_id);
    if (!Number.isInteger(itemId) || itemId < 1) {
      return NextResponse.json(
        { success: false, message: "A valid product id is required." },
        { status: 400 }
      );
    }

    const products = await query(
      "SELECT item_id FROM products WHERE item_id = ? AND status = 'active' LIMIT 1",
      [itemId]
    );
    if (!products.length) {
      return NextResponse.json(
        { success: false, message: "This product is not available." },
        { status: 404 }
      );
    }

    await query(
      "INSERT IGNORE INTO wishlists (user_id, item_id) VALUES (?, ?)",
      [customer.user_id, itemId]
    );

    return NextResponse.json({ success: true, item_id: itemId });
  } catch (error) {
    console.error("Add customer wishlist item error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save this product to your wishlist." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const customer = getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const itemId = Number(new URL(request.url).searchParams.get("item_id"));
    if (!Number.isInteger(itemId) || itemId < 1) {
      return NextResponse.json(
        { success: false, message: "A valid product id is required." },
        { status: 400 }
      );
    }

    await query(
      "DELETE FROM wishlists WHERE user_id = ? AND item_id = ?",
      [customer.user_id, itemId]
    );

    return NextResponse.json({ success: true, item_id: itemId });
  } catch (error) {
    console.error("Remove customer wishlist item error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to remove this product from your wishlist." },
      { status: 500 }
    );
  }
}
