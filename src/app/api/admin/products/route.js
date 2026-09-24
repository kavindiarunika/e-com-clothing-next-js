import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { saveProductImage } from "@/lib/productImageStorage";

function imageValueToBase64(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  const buffer = Buffer.isBuffer(value)
    ? value
    : Buffer.from(value);
  const text = buffer.toString("utf8");

  return /^[A-Za-z0-9+/]+={0,2}$/.test(text) &&
    text.length % 4 === 0
    ? text
    : buffer.toString("base64");
}

export async function GET() {
  try {
    const [products] = await pool.query(`
      SELECT
        p.item_id,
        p.title,
        p.description,
        p.main_image,
        p.price,
        p.discount,
        p.category_id,
        c.name AS category_name,
        p.sku,
        p.brand,
        p.tags,
        p.status,
        p.is_featured,
        p.is_best_selling,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      ORDER BY p.created_at DESC
    `);

    const formattedProducts = products.map((product) => ({
      ...product,
      main_image: imageValueToBase64(product.main_image),
      tags:
        typeof product.tags === "string"
          ? JSON.parse(product.tags || "[]")
          : product.tags || [],
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString() || "";
    const price = Number(formData.get("price")) || 0;
    const discount = Number(formData.get("discount")) || 0;
    const categoryId = formData.get("category_id") || null;
    const sku = formData.get("sku")?.toString().trim() || null;
    const brand = formData.get("brand")?.toString().trim() || null;
    const status = formData.get("status")?.toString() || "active";

    const tagsValue = formData.get("tags")?.toString() || "[]";

    let tags = [];

    try {
      tags = JSON.parse(tagsValue);

      if (!Array.isArray(tags)) {
        tags = [];
      }
    } catch {
      tags = [];
    }

    if (!title) {
      return NextResponse.json(
        {
          error: "Product title is required.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // MAIN IMAGE
    // ==========================================

    const mainImageFile = formData.get("main_image");

    let mainImagePath = null;

    if (
      mainImageFile &&
      typeof mainImageFile !== "string" &&
      mainImageFile.size > 0
    ) {
      mainImagePath = await saveProductImage(mainImageFile);

      console.log("Main image received:", {
        name: mainImageFile.name,
        type: mainImageFile.type,
        size: mainImageFile.size,
        path: mainImagePath,
      });
    } else {
      console.log("No main image uploaded.");
    }

    // ==========================================
    // INSERT PRODUCT
    // ==========================================

    let result;

    try {
      [result] = await pool.query(
        `
        INSERT INTO products
        (
          title,
          description,
          main_image,
          price,
          discount,
          category_id,
          sku,
          brand,
          tags,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          title,
          description,
          mainImagePath,
          price,
          discount,
          categoryId || null,
          sku || null,
          brand || null,
          JSON.stringify(tags),
          status,
        ]
      );
    } catch (dbError) {
      console.error("=================================");
      console.error("PRODUCT INSERT DATABASE ERROR");
      console.error("=================================");

      console.error("Message:", dbError.message);
      console.error("Code:", dbError.code);
      console.error("Errno:", dbError.errno);
      console.error("SQL State:", dbError.sqlState);
      console.error("SQL Message:", dbError.sqlMessage);

      console.error("Product information:", {
        title,
        price,
        discount,
        categoryId,
        sku,
        brand,
        status,
        tags,
        hasMainImage: !!mainImagePath,
        imagePath: mainImagePath,
      });

      throw dbError;
    }

    const itemId = result.insertId;

    console.log("Product created:", itemId);

    // ==========================================
    // ADDITIONAL IMAGES
    // ==========================================

    const additionalImages = formData.getAll("images");

    console.log(
      "Additional images:",
      additionalImages.length
    );

    let sortOrder = 0;

    for (const image of additionalImages) {
      if (
        !image ||
        typeof image === "string" ||
        image.size === 0
      ) {
        continue;
      }

      const imagePath = await saveProductImage(image);

      console.log("Saving additional image:", {
        name: image.name,
        type: image.type,
        size: image.size,
      });

      await pool.query(
        `
        INSERT INTO product_images
        (
          item_id,
          image,
          sort_order,
          is_main
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          itemId,
          imagePath,
          sortOrder,
          false,
        ]
      );

      sortOrder++;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        item_id: itemId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=================================");
    console.error("CREATE PRODUCT ERROR");
    console.error("=================================");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Errno:", error.errno);
    console.error("SQL State:", error.sqlState);
    console.error("SQL Message:", error.sqlMessage);

    return NextResponse.json(
      {
        error: "Failed to create product.",
        details: error.message,
        code: error.code || null,
        errno: error.errno || null,
        sqlState: error.sqlState || null,
      },
      { status: 500 }
    );
  }
}