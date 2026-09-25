import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { saveProductImage } from "@/lib/productImageStorage";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description") || null;
    const price = formData.get("price") || 0;
    const discount = formData.get("discount") || 0;
    const categoryId = formData.get("category_id") || null;
    const sku = formData.get("sku") || null;
    const brand = formData.get("brand") || null;
    const status = formData.get("status") || "active";
    const tagsString = formData.get("tags") || "[]";

    const mainImage = formData.get("main_image");

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product title is required.",
        },
        { status: 400 }
      );
    }

    /*
     * If a new main image was selected
     */
    if (
      mainImage &&
      typeof mainImage.arrayBuffer === "function"
    ) {
      const mainImagePath =
        await saveProductImage(mainImage);

      await pool.query(
        `
        UPDATE products
        SET
          title = ?,
          description = ?,
          main_image = ?,
          price = ?,
          discount = ?,
          category_id = ?,
          sku = ?,
          brand = ?,
          tags = ?,
          status = ?
        WHERE item_id = ?
        `,
        [
          title.trim(),
          description,
          mainImagePath,
          price,
          discount,
          categoryId || null,
          sku || null,
          brand || null,
          tagsString,
          status,
          id,
        ]
      );
    } else {
      /*
       * Keep existing main image
       */
      await pool.query(
        `
        UPDATE products
        SET
          title = ?,
          description = ?,
          price = ?,
          discount = ?,
          category_id = ?,
          sku = ?,
          brand = ?,
          tags = ?,
          status = ?
        WHERE item_id = ?
        `,
        [
          title.trim(),
          description,
          price,
          discount,
          categoryId || null,
          sku || null,
          brand || null,
          tagsString,
          status,
          id,
        ]
      );
    }

    /*
     * Add new additional images
     */
    const images = formData.getAll("images");

    if (images.length > 0) {
      const [existingImages] =
        await pool.query(
          `
          SELECT MAX(sort_order) AS max_order
          FROM product_images
          WHERE item_id = ?
          `,
          [id]
        );

      let sortOrder =
        Number(
          existingImages[0]?.max_order || 0
        ) + 1;

      for (const image of images) {
        if (
          !image ||
          typeof image.arrayBuffer !== "function"
        ) {
          continue;
        }

        const imagePath =
          await saveProductImage(image);

        await pool.query(
          `
          INSERT INTO product_images (
            item_id,
            image,
            sort_order,
            is_main
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            id,
            imagePath,
            sortOrder,
            false,
          ]
        );

        sortOrder++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "SKU already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const [result] = await pool.query(
      `
      DELETE FROM products
      WHERE item_id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product.",
      },
      { status: 500 }
    );
  }
}