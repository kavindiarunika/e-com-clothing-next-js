import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

const periodConditions = {
  today: "o.order_date >= CURDATE()",
  week: "o.order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
  month: "o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
  twoMonths: "o.order_date >= DATE_SUB(NOW(), INTERVAL 60 DAY)",
};

export async function GET(request) {
  try {
    if (!(await getAdmin())) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const period = new URL(request.url).searchParams.get("period") || "today";
    if (!Object.prototype.hasOwnProperty.call(periodConditions, period)) {
      return Response.json(
        { success: false, message: "Invalid sales period" },
        { status: 400 }
      );
    }

    const [products] = await getPool().query(`
      SELECT
        p.item_id,
        p.title,
        p.sku,
        c.name AS category_name,
        SUM(oi.qty) AS quantity_sold
      FROM order_items oi
      INNER JOIN orders o ON o.order_id = oi.order_id
      INNER JOIN products p ON p.item_id = oi.item_id
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE ${periodConditions[period]}
        AND o.payment_status = 'paid'
        AND o.order_status != 'cancelled'
      GROUP BY p.item_id, p.title, p.sku, c.name
      ORDER BY quantity_sold DESC, p.title ASC
    `);

    return Response.json({
      success: true,
      data: products.map((product) => ({
        ...product,
        quantity_sold: Number(product.quantity_sold) || 0,
      })),
    });
  } catch (error) {
    console.error("Admin sold products GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load sold products" },
      { status: 500 }
    );
  }
}
