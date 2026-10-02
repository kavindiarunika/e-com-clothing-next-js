import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getImageSource } from "@/lib/productImageSource";
import { saveProductImage } from "@/lib/productImageStorage";
import { sanitizeProductDescription } from "@/lib/productDescription";

async function getProductColumns(db = pool) {
  const [columns] = await db.query("SHOW COLUMNS FROM products");
  return new Set(columns.map((column) => column.Field));
}

/* =====================================================
   GET
===================================================== */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const productColumns = await getProductColumns();

    // -----------------------------------------------
    // GET SINGLE PRODUCT
    // -----------------------------------------------

    if (id) {
      const [products] = await pool.query(
        `
        SELECT
          p.*,
          c.name AS category_name
        FROM products p
        LEFT JOIN categories c
          ON p.category_id = c.category_id
        WHERE p.item_id = ?
        LIMIT 1
        `,
        [id]
      );

      if (products.length === 0) {
        return NextResponse.json(
          {
            error: "Product not found",
          },
          { status: 404 }
        );
      }

      const [variants] = await pool.query(
        `
        SELECT
          pv.variant_id,
          pv.item_id,
          pv.size_id,
          pv.color_id,
          pv.sku,
          pv.price,
          pv.discount,
          pv.stock_quantity,
          pv.image,
          pv.status,
          s.name AS size_name,
          c.name AS color_name
        FROM product_variants pv
        LEFT JOIN sizes s
          ON pv.size_id = s.size_id
        LEFT JOIN colors c
          ON pv.color_id = c.color_id
        WHERE pv.item_id = ?
        ORDER BY pv.variant_id DESC
        `,
        [id]
      );

      const product = products[0];

      product.main_image = getImageSource(product.main_image);
      for (const column of ["offer_id", "size_id", "color_id"]) {
        product[column] ??= null;
      }
      const activeVariants = variants.filter(
        (variant) => variant.status === "active"
      );
      product.qty = activeVariants.length
        ? activeVariants.reduce(
            (total, variant) => total + (Number(variant.stock_quantity) || 0),
            0
          )
        : Number(product.qty) || 0;

      const convertedVariants = variants.map(
        (variant) => ({
          ...variant,
          image: getImageSource(variant.image),
        })
      );

      let tags = [];

      if (product.tags) {
        try {
          tags =
            typeof product.tags === "string"
              ? JSON.parse(product.tags)
              : product.tags;
        } catch {
          tags = [];
        }
      }

      product.tags = tags;

      return NextResponse.json({
        product,
        variants: convertedVariants,
      });
    }

    // -----------------------------------------------
    // GET ALL PRODUCTS
    // -----------------------------------------------

    const activeVariantCount =
      "COUNT(DISTINCT CASE WHEN pv.status = 'active' THEN pv.variant_id END)";
    const activeVariantStock =
      "COALESCE(SUM(CASE WHEN pv.status = 'active' THEN pv.stock_quantity ELSE 0 END), 0)";
    const totalStock = productColumns.has("qty")
      ? `CASE WHEN ${activeVariantCount} > 0 THEN ${activeVariantStock} ELSE p.qty END`
      : activeVariantStock;
    const optionalProductFields = ["offer_id", "size_id", "color_id"]
      .map((column) =>
        `${productColumns.has(column) ? `p.${column}` : "NULL"} AS ${column}`
      )
      .join(",\n        ");

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
        ${totalStock} AS qty,
        ${optionalProductFields},
        p.tags,
        p.status,
        p.is_featured,
        p.is_best_selling,
        p.created_at,
        p.updated_at,

        c.name AS category_name,

        COUNT(DISTINCT CASE WHEN pv.status = 'active' THEN pv.variant_id END)
          AS variant_count,

        ${totalStock} AS total_stock,

        ${totalStock} AS stock,

        ${totalStock} AS stock_quantity

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.category_id

      LEFT JOIN product_variants pv
        ON p.item_id = pv.item_id

      GROUP BY
        p.item_id

      ORDER BY
        p.created_at DESC
      `
    );

    const convertedProducts = products.map(
      (product) => ({
        ...product,

        main_image: getImageSource(product.main_image),

        tags: (() => {
          if (!product.tags) return [];

          try {
            return typeof product.tags === "string"
              ? JSON.parse(product.tags)
              : product.tags;
          } catch {
            return [];
          }
        })(),
      })
    );

    // -----------------------------------------------
    // CATEGORIES
    // -----------------------------------------------

    const [categories] = await pool.query(
      `
      SELECT
        category_id,
        name,
        status
      FROM categories
      WHERE status = 'active'
      ORDER BY name ASC
      `
    );

    // -----------------------------------------------
    // SIZES
    // -----------------------------------------------

    const [sizes] = await pool.query(
      `
      SELECT
        size_id,
        name,
        status
      FROM sizes
      ORDER BY name ASC
      `
    );

    // -----------------------------------------------
    // COLORS
    // -----------------------------------------------

    const [colors] = await pool.query(
      `
      SELECT
        color_id,
        name,
        hex_code,
        status
      FROM colors
      ORDER BY name ASC
      `
    );

    return NextResponse.json({
      products: convertedProducts,
      categories,
      sizes,
      colors,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load products",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST
===================================================== */

export async function POST(request) {
  let connection;

  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const description = sanitizeProductDescription(
      formData.get("description")
    );
    const price = formData.get("price") || 0;
    const discount = formData.get("discount") || 0;
    const category_id =
      formData.get("category_id") || null;
    const sku = formData.get("sku") || null;
    const brand = formData.get("brand") || null;
    const qty = Number(formData.get("qty") || 0);
    const offerId = formData.get("offer_id") || null;
    const sizeId = formData.get("size_id") || null;
    const colorId = formData.get("color_id") || null;
    const tags = formData.get("tags") || "";
    const status =
      formData.get("status") || "active";

    const is_featured =
      formData.get("is_featured") === "1";

    const is_best_selling =
      formData.get("is_best_selling") === "1";

    const variantsText =
      formData.get("variants") || "[]";

    const variants = JSON.parse(variantsText);

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          error: "Product title is required",
        },
        { status: 400 }
      );
    }

    if (Number(price) < 0) {
      return NextResponse.json(
        {
          error: "Price cannot be negative",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(qty) || qty < 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-negative whole number" },
        { status: 400 }
      );
    }

    // -----------------------------------------------
    // TAGS
    // -----------------------------------------------

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const tagsJSON = JSON.stringify(tagArray);

    // -----------------------------------------------
    // IMAGES
    // -----------------------------------------------

    const imageFiles = formData.getAll("images");
    const hasSeparateMainImage = formData.has("main_image");
    if (hasSeparateMainImage && imageFiles.length > 4) {
      return NextResponse.json(
        { error: "You can upload up to 4 additional images" },
        { status: 400 }
      );
    }
    const mainImageFile = hasSeparateMainImage
      ? formData.get("main_image")
      : imageFiles[0];

    let mainImagePath = null;

    if (
      mainImageFile instanceof File &&
      mainImageFile.size > 0
    ) {
      mainImagePath = await saveProductImage(mainImageFile);
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // -----------------------------------------------
    // INSERT PRODUCT
    // -----------------------------------------------

    const productColumns = await getProductColumns(connection);
    const productFields = [
      ["title", title.trim()],
      ["description", description || null],
      ["main_image", mainImagePath],
      ["price", Number(price)],
      ["discount", Number(discount)],
      ["category_id", category_id || null],
      ["sku", sku || null],
      ["brand", brand || null],
      ["qty", qty],
      ["tags", tagsJSON],
      ["offer_id", offerId],
      ["size_id", sizeId],
      ["color_id", colorId],
      ["status", status],
      ["is_featured", is_featured],
      ["is_best_selling", is_best_selling],
    ].filter(([column]) => productColumns.has(column));

    const [productResult] = await connection.execute(
      `INSERT INTO products (${productFields.map(([column]) => column).join(", ")})
       VALUES (${productFields.map(() => "?").join(", ")})`,
      productFields.map(([, value]) => value)
    );

    const itemId = productResult.insertId;

    // -----------------------------------------------
    // INSERT PRODUCT IMAGES
    // -----------------------------------------------

    for (
      let index = 0;
      index < imageFiles.length;
      index++
    ) {
      const file = imageFiles[index];

      if (
        !(file instanceof File) ||
        file.size === 0
      ) {
        continue;
      }

      const imagePath = await saveProductImage(file);

      await connection.execute(
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
          itemId,
          imagePath,
          index,
          !hasSeparateMainImage && index === 0,
        ]
      );
    }

    // -----------------------------------------------
    // INSERT VARIANTS
    // -----------------------------------------------

    for (
      let index = 0;
      index < variants.length;
      index++
    ) {
      const variant = variants[index];

      let variantImagePath = null;

      const variantFile = formData.get(
        `variant_image_${index}`
      );

      if (
        variantFile instanceof File &&
        variantFile.size > 0
      ) {
        variantImagePath = await saveProductImage(variantFile);
      }

      await connection.execute(
        `
        INSERT INTO product_variants (
          item_id,
          size_id,
          color_id,
          sku,
          price,
          discount,
          stock_quantity,
          image,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          itemId,
          variant.size_id || null,
          variant.color_id || null,
          variant.sku || null,
          Number(
            variant.price || price
          ),
          Number(
            variant.discount || discount || 0
          ),
          Number(
            variant.stock_quantity || 0
          ),
          variantImagePath,
          variant.status || "active",
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        message:
          "Product created successfully",
        item_id: itemId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/* =====================================================
   PUT
===================================================== */

export async function PUT(request) {
  let connection;

  try {
    const formData = await request.formData();

    const itemId = formData.get("item_id");

    if (!itemId) {
      return NextResponse.json(
        {
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const title = formData.get("title");
    const description = sanitizeProductDescription(
      formData.get("description")
    );
    const price = formData.get("price") || 0;
    const discount = formData.get("discount") || 0;
    const category_id =
      formData.get("category_id") || null;
    const sku = formData.get("sku") || null;
    const brand = formData.get("brand") || null;
    const qty = Number(formData.get("qty") || 0);
    const offerId = formData.get("offer_id") || null;
    const sizeId = formData.get("size_id") || null;
    const colorId = formData.get("color_id") || null;
    const tags = formData.get("tags") || "";
    const status =
      formData.get("status") || "active";

    const is_featured =
      formData.get("is_featured") === "1";

    const is_best_selling =
      formData.get("is_best_selling") === "1";

    const variantsText =
      formData.get("variants") || "[]";

    const variants = JSON.parse(variantsText);

    if (!Number.isInteger(qty) || qty < 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-negative whole number" },
        { status: 400 }
      );
    }

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const tagsJSON = JSON.stringify(tagArray);

    const imageFiles = formData.getAll("images");
    const hasSeparateMainImage = formData.has("main_image");
    if (hasSeparateMainImage && imageFiles.length > 4) {
      return NextResponse.json(
        { error: "You can upload up to 4 additional images" },
        { status: 400 }
      );
    }
    const mainImageFile = hasSeparateMainImage
      ? formData.get("main_image")
      : imageFiles[0];

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // -----------------------------------------------
    // CHECK PRODUCT
    // -----------------------------------------------

    const [existingProducts] =
      await connection.execute(
        `
        SELECT item_id
        FROM products
        WHERE item_id = ?
        LIMIT 1
        `,
        [itemId]
      );

    if (existingProducts.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------
    // UPDATE PRODUCT
    // -----------------------------------------------

    const productColumns = await getProductColumns(connection);
    const productFields = [
      ["title", title.trim()],
      ["description", description || null],
      ["price", Number(price)],
      ["discount", Number(discount)],
      ["category_id", category_id || null],
      ["sku", sku || null],
      ["brand", brand || null],
      ["qty", qty],
      ["tags", tagsJSON],
      ["offer_id", offerId],
      ["size_id", sizeId],
      ["color_id", colorId],
      ["status", status],
      ["is_featured", is_featured],
      ["is_best_selling", is_best_selling],
    ].filter(([column]) => productColumns.has(column));

    await connection.execute(
      `UPDATE products
       SET ${productFields.map(([column]) => `${column} = ?`).join(", ")}
       WHERE item_id = ?`,
      [...productFields.map(([, value]) => value), itemId]
    );

    // -----------------------------------------------
    // UPDATE MAIN IMAGE
    // -----------------------------------------------

    if (
      mainImageFile instanceof File &&
      mainImageFile.size > 0
    ) {
      const mainImagePath = await saveProductImage(mainImageFile);

      await connection.execute(
        `
        UPDATE products
        SET main_image = ?
        WHERE item_id = ?
        `,
        [
          mainImagePath,
          itemId,
        ]
      );
    } else if (formData.get("remove_main_image") === "1") {
      await connection.execute(
        "UPDATE products SET main_image = NULL WHERE item_id = ?",
        [itemId]
      );
    }

    // -----------------------------------------------
    // ADD NEW PRODUCT IMAGES
    // -----------------------------------------------

    for (
      let index = 0;
      index < imageFiles.length;
      index++
    ) {
      const file = imageFiles[index];

      if (
        !(file instanceof File) ||
        file.size === 0
      ) {
        continue;
      }

      const imagePath = await saveProductImage(file);

      await connection.execute(
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
          itemId,
          imagePath,
          index,
          false,
        ]
      );
    }

    // -----------------------------------------------
    // EXISTING VARIANT IDS
    // -----------------------------------------------

    const [databaseVariants] =
      await connection.execute(
        `
        SELECT variant_id
        FROM product_variants
        WHERE item_id = ?
        `,
        [itemId]
      );

    const databaseVariantIds =
      databaseVariants.map(
        (variant) => variant.variant_id
      );

    const submittedVariantIds =
      variants
        .filter(
          (variant) => variant.variant_id
        )
        .map(
          (variant) =>
            Number(variant.variant_id)
        );

    // -----------------------------------------------
    // DELETE REMOVED VARIANTS
    // -----------------------------------------------

    for (const variantId of databaseVariantIds) {
      if (
        !submittedVariantIds.includes(
          Number(variantId)
        )
      ) {
        await connection.execute(
          `
          DELETE FROM product_variants
          WHERE variant_id = ?
          AND item_id = ?
          `,
          [
            variantId,
            itemId,
          ]
        );
      }
    }

    // -----------------------------------------------
    // INSERT / UPDATE VARIANTS
    // -----------------------------------------------

    for (
      let index = 0;
      index < variants.length;
      index++
    ) {
      const variant = variants[index];

      let variantImagePath = null;

      const variantFile = formData.get(
        `variant_image_${index}`
      );

      if (
        variantFile instanceof File &&
        variantFile.size > 0
      ) {
        variantImagePath = await saveProductImage(variantFile);
      }

      // -------------------------------------------
      // EXISTING VARIANT
      // -------------------------------------------

      if (variant.variant_id) {
        if (variantImagePath) {
          await connection.execute(
            `
            UPDATE product_variants
            SET
              size_id = ?,
              color_id = ?,
              sku = ?,
              price = ?,
              discount = ?,
              stock_quantity = ?,
              image = ?,
              status = ?
            WHERE variant_id = ?
            AND item_id = ?
            `,
            [
              variant.size_id || null,
              variant.color_id || null,
              variant.sku || null,
              Number(
                variant.price || price
              ),
              Number(
                variant.discount ||
                  discount ||
                  0
              ),
              Number(
                variant.stock_quantity ||
                  0
              ),
              variantImagePath,
              variant.status ||
                "active",
              variant.variant_id,
              itemId,
            ]
          );
        } else {
          await connection.execute(
            `
            UPDATE product_variants
            SET
              size_id = ?,
              color_id = ?,
              sku = ?,
              price = ?,
              discount = ?,
              stock_quantity = ?,
              status = ?
            WHERE variant_id = ?
            AND item_id = ?
            `,
            [
              variant.size_id || null,
              variant.color_id || null,
              variant.sku || null,
              Number(
                variant.price || price
              ),
              Number(
                variant.discount ||
                  discount ||
                  0
              ),
              Number(
                variant.stock_quantity ||
                  0
              ),
              variant.status ||
                "active",
              variant.variant_id,
              itemId,
            ]
          );
        }
      }

      // -------------------------------------------
      // NEW VARIANT
      // -------------------------------------------

      else {
        await connection.execute(
          `
          INSERT INTO product_variants (
            item_id,
            size_id,
            color_id,
            sku,
            price,
            discount,
            stock_quantity,
            image,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            itemId,
            variant.size_id || null,
            variant.color_id || null,
            variant.sku || null,
            Number(
              variant.price || price
            ),
            Number(
              variant.discount ||
                discount ||
                0
            ),
            Number(
              variant.stock_quantity ||
                0
            ),
            variantImagePath,
            variant.status ||
              "active",
          ]
        );
      }
    }

    await connection.commit();

    return NextResponse.json({
      message:
        "Product updated successfully",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/* =====================================================
   DELETE
===================================================== */

export async function DELETE(request) {
  let connection;

  try {
    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // product_variants and product_images
    // have ON DELETE CASCADE.

    const [result] =
      await connection.execute(
        `
        DELETE FROM products
        WHERE item_id = ?
        `,
        [id]
      );

    if (result.affectedRows === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    await connection.commit();

    return NextResponse.json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}