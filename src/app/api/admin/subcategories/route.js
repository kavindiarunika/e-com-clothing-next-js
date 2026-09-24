import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   GET SUBCATEGORIES
========================================= */

export async function GET() {
  try {
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

    const pool = getPool();

    const [subcategories] = await pool.query(`
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

      WHERE c1.parent_category_id IS NOT NULL

      ORDER BY c1.name ASC
    `);

    const formattedSubcategories = subcategories.map((subcategory) => ({
      ...subcategory,
      image: subcategory.image
        ? `data:image/jpeg;base64,${Buffer.from(
            subcategory.image
          ).toString("base64")}`
        : null,
    }));

    return Response.json({
      success: true,
      subcategories: formattedSubcategories,
    });
  } catch (error) {
    console.error("Subcategories GET Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load subcategories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   CREATE SUBCATEGORY
========================================= */

export async function POST(request) {
  try {
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

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString() || "";
    const parent_category_id = formData.get("parent_category_id");
    const status = formData.get("status")?.toString() || "active";
    const imageFile = formData.get("image");

    if (!name || !parent_category_id) {
      return Response.json(
        {
          success: false,
          message:
            "Subcategory name and parent category are required.",
        },
        { status: 400 }
      );
    }

    const pool = getPool();

    /* Check parent category */

    const [parentCategory] = await pool.query(
      `
      SELECT category_id
      FROM categories
      WHERE category_id = ?
      AND parent_category_id IS NULL
      `,
      [parent_category_id]
    );

    if (parentCategory.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid parent category.",
        },
        { status: 400 }
      );
    }

    /* Insert */

    const image =
      imageFile &&
      typeof imageFile !== "string" &&
      imageFile.size > 0
        ? Buffer.from(await imageFile.arrayBuffer())
        : null;

    const [result] = await pool.query(
      `
      INSERT INTO categories
      (
        name,
        description,
        image,
        parent_category_id,
        status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        name,
        description || null,
        image || null,
        parent_category_id,
        status || "active",
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Subcategory created successfully.",
        category_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subcategories POST Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create subcategory.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}