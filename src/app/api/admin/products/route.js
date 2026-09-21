import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [products] = await pool.query(
      `
      SELECT
        p.item_id,
        p.title,
        p.description,
        p.main_image,
        p.price,
        p.discount,
        p.category_id,
        p.sku,
        p.brand,
        p.tags,
        p.status,
        p.is_featured,
        p.is_best_selling,
        p.created_at,
        p.updated_at,

        c.name AS category_name,

        COALESCE(
          SUM(pv.stock_quantity),
          0
        ) AS stock_quantity

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.category_id

      LEFT JOIN product_variants pv
        ON p.item_id = pv.item_id

      GROUP BY
        p.item_id,
        p.title,
        p.description,
        p.main_image,
        p.price,
        p.discount,
        p.category_id,
        p.sku,
        p.brand,
        p.tags,
        p.status,
        p.is_featured,
        p.is_best_selling,
        p.created_at,
        p.updated_at,
        c.name

      ORDER BY p.item_id DESC
      `
    );

    return Response.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Products API Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}