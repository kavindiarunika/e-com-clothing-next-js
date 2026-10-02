import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getImageSource } from "@/lib/productImageSource";
import { sanitizeProductDescription } from "@/lib/productDescription";

const db = getPool();

export async function GET(_request, { params }) {
  try {
    const { product_id: productId } = await params;

    if (!/^\d+$/.test(productId)) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const [productColumnRows] = await db.query("SHOW COLUMNS FROM products");
    const productColumns = new Set(productColumnRows.map((column) => column.Field));

    const [products] = await db.query(
      `
      SELECT
        p.item_id,
        p.title,
        p.description,
        p.main_image,
        p.price,
        p.discount,
        p.category_id,
        ${productColumns.has("size_id") ? "p.size_id" : "NULL"} AS size_id,
        ${productColumns.has("color_id") ? "p.color_id" : "NULL"} AS color_id,
        ${productColumns.has("qty") ? "p.qty" : "0"} AS product_qty,
        ${productColumns.has("size_id") ? "default_size.name" : "NULL"} AS default_size,
        ${productColumns.has("color_id") ? "default_color.name" : "NULL"} AS default_color,
        ${productColumns.has("color_id") ? "default_color.hex_code" : "NULL"} AS default_color_hex,
        c.name AS category_name,
        p.sku,
        p.brand,
        p.tags,
        p.status,
        p.is_featured
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      ${productColumns.has("size_id") ? "LEFT JOIN sizes default_size ON p.size_id = default_size.size_id" : ""}
      ${productColumns.has("color_id") ? "LEFT JOIN colors default_color ON p.color_id = default_color.color_id" : ""}
      WHERE p.item_id = ? AND p.status = 'active'
      LIMIT 1
      `,
      [productId]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const product = products[0];
    const [productImages] = await db.query(
      `
      SELECT image
      FROM product_images
      WHERE item_id = ?
      ORDER BY is_main DESC, sort_order ASC, image_id ASC
      `,
      [productId]
    );
    const [variantRows] = await db.query(
      `
      SELECT
        v.variant_id,
        s.name AS size,
        c.color_id AS color_id,
        c.name AS color,
        c.hex_code AS color_hex,
        v.stock_quantity AS stock,
        v.price,
        v.discount,
        v.image
      FROM product_variants v
      LEFT JOIN sizes s ON s.size_id = v.size_id
      LEFT JOIN colors c ON c.color_id = v.color_id
      WHERE v.item_id = ? AND v.status = 'active'
      ORDER BY s.name, c.name
      `,
      [productId]
    );

    const variants = variantRows.map((variant) => ({
      variant_id: variant.variant_id,
      size: variant.size || "",
      color: variant.color || "",
      color_id: variant.color_id,
      color_hex: variant.color_hex || "",
      stock: Number(variant.stock) || 0,
      price: Number(variant.price) || 0,
      discount: Number(variant.discount) || 0,
      image: getImageSource(variant.image),
    }));
    const images = [
      getImageSource(product.main_image),
      ...productImages.map((image) => getImageSource(image.image)),
      ...variants.map((variant) => variant.image),
    ].filter((image, index, allImages) => image && allImages.indexOf(image) === index);

    const colors = [
      ...new Map(
        variants
          .filter((variant) => variant.color)
          .map((variant) => [
            variant.color_id || variant.color,
            {
              color_id: variant.color_id || variant.color,
              name: variant.color,
              hex_code: variant.color_hex,
              image:
                variant.image ||
                variants.find((item) => item.color === variant.color)?.image ||
                images[0],
            },
          ])
      ).values(),
    ];
    if (product.default_color && !colors.some((color) => color.name === product.default_color)) {
      colors.push({
        color_id: product.color_id,
        name: product.default_color,
        hex_code: product.default_color_hex || "",
        image: images[0] || null,
      });
    }
    const sizes = [...new Set([
      ...variants.map((variant) => variant.size),
      product.default_size,
    ].filter(Boolean))];
    const variantStock = variants.reduce(
      (total, variant) => total + variant.stock,
      0
    );
    const { product_qty: fallbackQty, ...productData } = product;

    return NextResponse.json({
      success: true,
      product: {
        ...productData,
        qty: variants.length ? variantStock : Number(fallbackQty) || 0,
        description: sanitizeProductDescription(product.description),
        id: product.item_id,
        name: product.title,
        category: product.category_name || "",
        image: images[0] || null,
        images,
        colors,
        sizes,
        variants,
        rating: 0,
        reviews: 0,
        sizeGuide: {},
      },
    });
  } catch (error) {
    console.error("GET USER PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load product." },
      { status: 500 }
    );
  }
}
