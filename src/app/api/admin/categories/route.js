import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==========================================
// GET ALL CATEGORIES
// ==========================================

function getImageMimeType(buffer) {
  if (!buffer || buffer.length === 0) return "image/jpeg";

  const bytes = buffer.subarray(0, 12);

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }

  if (
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return "image/jpeg";
}

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

    const formattedCategories = categories.map((category) => {
      if (!category.image) {
        return { ...category, image: null };
      }

      const buffer = Buffer.isBuffer(category.image)
        ? category.image
        : Buffer.from(category.image);

      const mimeType = getImageMimeType(buffer);

      return {
        ...category,
        image: `data:${mimeType};base64,${buffer.toString("base64")}`,
      };
    });

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

    let imageBuffer = null;

    if (
      imageFile &&
      typeof imageFile !== "string" &&
      imageFile.size > 0
    ) {
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
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
        imageBuffer,
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
      const arrayBuffer =
        await imageFile.arrayBuffer();

      const imageBuffer =
        Buffer.from(arrayBuffer);

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
          imageBuffer,
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