
import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // =====================================================
    // CHECK ADMIN AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // DATABASE CONNECTION
    // =====================================================

    const pool = getPool();

    // =====================================================
    // GET CATEGORIES
    // =====================================================
    //
    // c1 = current category
    // c2 = parent category
    //
    // This allows us to return:
    // - category information
    // - parent category name
    //
    // =====================================================

    const [categories] = await pool.query(`
      SELECT
        c1.category_id,
        c1.name,
        c1.description,
        c1.image,
        c1.parent_category_id,
        c1.status,
        c1.created_at,

        c2.name AS parent_category_name

      FROM categories c1

      LEFT JOIN categories c2
        ON c1.parent_category_id = c2.category_id

      ORDER BY
        CASE
          WHEN c1.parent_category_id IS NULL THEN 0
          ELSE 1
        END,
        c1.name ASC
    `);

    // =====================================================
    // RETURN CATEGORIES
    // =====================================================

    return Response.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories API Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load categories",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

