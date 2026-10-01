import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getImageSource } from "@/lib/productImageSource";
import { saveCategoryImage } from "@/lib/productImageStorage";

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export async function GET() {
  try {
    const [categories] = await pool.query(`
      SELECT
        c.category_id,
        c.name,
        c.description,
        c.image,
        c.parent_category_id,
        parent.name AS parent_name,
        c.status,
        c.created_at
      FROM categories c
      LEFT JOIN categories parent
        ON parent.category_id = c.parent_category_id
      ORDER BY c.created_at DESC, c.category_id DESC
    `);

    const formattedCategories = categories.map((category) => ({
      ...category,
      image: getImageSource(category.image),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch categories.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// CREATE CATEGORY
// ==========================================

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString() || "";
    const parentCategoryId =
      formData.get("parent_category_id")?.toString() || null;
    const status = formData.get("status")?.toString() || "active";
    const imageFile = formData.get("image");

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    let imagePath = null;

    if (
      imageFile &&
      typeof imageFile !== "string" &&
      imageFile.size > 0
    ) {
      imagePath = await saveCategoryImage(imageFile);
    }

    const [result] = await pool.query(
      `
      INSERT INTO categories
        (name, description, image, parent_category_id, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        name,
        description,
        imagePath,
        parentCategoryId,
        status,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        category_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create category.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE CATEGORY
// ==========================================

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const formData = await request.formData();

    const name =
      formData.get("name")?.toString().trim();

    const description =
      formData.get("description")?.toString() || "";

    const parentCategoryId =
      formData
        .get("parent_category_id")
        ?.toString() || "";

    const status =
      formData.get("status")?.toString() ||
      "active";

    const imageFile = formData.get("image");

    if (!name) {
      return NextResponse.json(
        {
          error: "Category name is required.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // CHECK CATEGORY
    // ==========================================

    const [existing] = await pool.query(
      `
      SELECT category_id
      FROM categories
      WHERE category_id = ?
      `,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // IMAGE UPDATE
    // ==========================================

    if (
      imageFile &&
      typeof imageFile !== "string" &&
      imageFile.size > 0
    ) {
      const imagePath = await saveCategoryImage(imageFile);

      await pool.query(
        `
        UPDATE categories
        SET
          name = ?,
          description = ?,
          image = ?,
          parent_category_id = ?,
          status = ?
        WHERE category_id = ?
        `,
        [
          name,
          description,
          imagePath,
          parentCategoryId || null,
          status,
          id,
        ]
      );
    } else {
      // ========================================
      // UPDATE WITHOUT IMAGE
      // ========================================

      await pool.query(
        `
        UPDATE categories
        SET
          name = ?,
          description = ?,
          parent_category_id = ?,
          status = ?
        WHERE category_id = ?
        `,
        [
          name,
          description,
          parentCategoryId || null,
          status,
          id,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update category.",
        details: error.message,
        code: error.code || null,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE CATEGORY
// ==========================================

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ==========================================
    // CHECK IF CATEGORY HAS PRODUCTS
    // ==========================================

    const [products] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM products
      WHERE category_id = ?
      `,
      [id]
    );

    if (Number(products[0].total) > 0) {
      return NextResponse.json(
        {
          error:
            "This category cannot be deleted because it contains products. Please move or remove the products first.",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // DELETE CATEGORY
    // ==========================================

    const [result] = await pool.query(
      `
      DELETE FROM categories
      WHERE category_id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete category.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}