import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   UPDATE SUBCATEGORY
========================================= */

export async function PUT(request, { params }) {
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

    const { category_id } = await params;

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

    /* Check existing subcategory */

    const [existing] = await pool.query(
      `
      SELECT category_id
      FROM categories
      WHERE category_id = ?
      AND parent_category_id IS NOT NULL
      `,
      [category_id]
    );

    if (existing.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Subcategory not found.",
        },
        { status: 404 }
      );
    }

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

    /* Update */

    const image =
      imageFile &&
      typeof imageFile !== "string" &&
      imageFile.size > 0
        ? Buffer.from(await imageFile.arrayBuffer())
        : null;

    if (image) {
      await pool.query(
        `
        UPDATE categories
        SET name = ?, description = ?, image = ?,
            parent_category_id = ?, status = ?
        WHERE category_id = ?
        `,
        [name, description || null, image, parent_category_id, status, category_id]
      );
    } else {
      await pool.query(
        `
        UPDATE categories
        SET name = ?, description = ?, parent_category_id = ?, status = ?
        WHERE category_id = ?
        `,
        [name, description || null, parent_category_id, status, category_id]
      );
    }
    return Response.json({
      success: true,
      message: "Subcategory updated successfully.",
    });
  } catch (error) {
    console.error("Subcategories PUT Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update subcategory.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   DELETE SUBCATEGORY
========================================= */

export async function DELETE(request, { params }) {
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

    const { category_id } = await params;

    const pool = getPool();

    const [existing] = await pool.query(
      `
      SELECT category_id
      FROM categories
      WHERE category_id = ?
      AND parent_category_id IS NOT NULL
      `,
      [category_id]
    );

    if (existing.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Subcategory not found.",
        },
        { status: 404 }
      );
    }

    await pool.query(
      `
      DELETE FROM categories
      WHERE category_id = ?
      AND parent_category_id IS NOT NULL
      `,
      [category_id]
    );

    return Response.json({
      success: true,
      message: "Subcategory deleted successfully.",
    });
  } catch (error) {
    console.error("Subcategories DELETE Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete subcategory.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}