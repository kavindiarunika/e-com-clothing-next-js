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
        {
          status: 401,
        }
      );
    }

    const [inventory] = await pool.query(`
      SELECT
        i.inventory_id,
        i.variant_id,
        i.quantity,
        i.reserved_quantity,
        i.available_quantity,
        i.updated_at,

        pv.item_id,
        pv.sku,
        pv.size_id,
        pv.color_id,

        p.title AS product_title,

        s.name AS size_name,

        c.name AS color_name,
        c.hex_code AS color_hex

      FROM inventory i

      INNER JOIN product_variants pv
        ON i.variant_id = pv.variant_id

      LEFT JOIN products p
        ON pv.item_id = p.item_id

      LEFT JOIN sizes s
        ON pv.size_id = s.size_id

      LEFT JOIN colors c
        ON pv.color_id = c.color_id

      ORDER BY i.inventory_id DESC
    `);

    return Response.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error(
      "Inventory API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load inventory",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}