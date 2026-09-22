
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

export async function POST(request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      image,
      parent_category_id,
      status,
    } = body;

    if (!name || !String(name).trim()) {
      return Response.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.execute(
      `
        INSERT INTO categories (
          name,
          description,
          image,
          parent_category_id,
          status
        ) VALUES (?, ?, ?, ?, ?)
      `,
      [
        String(name).trim(),
        description || null,
        image || null,
        parent_category_id || null,
        status || "active",
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Category created successfully.",
        category_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Categories POST Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create category.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

