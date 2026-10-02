import { getPool } from '@/lib/db';
import { getImageSource } from '@/lib/productImageSource';
import { NextResponse } from 'next/server';

const db = getPool();

// GET - Get all products
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // optional filter: active/inactive/out_of_stock
    const category_id = searchParams.get('category_id'); // optional filter
    const featured = searchParams.get('featured'); // optional: "1" or "0"
    const [productColumnRows] = await db.query("SHOW COLUMNS FROM products");
    const productColumns = new Set(productColumnRows.map((column) => column.Field));
    const productSizeId = productColumns.has("size_id") ? "p.size_id" : "NULL";
    const productColorId = productColumns.has("color_id") ? "p.color_id" : "NULL";
    const productQty = productColumns.has("qty") ? "p.qty" : "0";

    let query = `
      SELECT
        p.item_id,
        p.title,
        p.description,
        p.price,
        p.discount,
        p.category_id,
        ${productSizeId} AS size_id,
        ${productColorId} AS color_id,
        ${productQty} AS product_qty,
        ${productColumns.has("size_id") ? "default_size.name" : "NULL"} AS default_size,
        ${productColumns.has("color_id") ? "default_color.name" : "NULL"} AS default_color,
        ${productColumns.has("color_id") ? "default_color.hex_code" : "NULL"} AS default_color_hex,
        c.name AS category_name,
        p.sku,
        p.brand,
        p.tags,
        p.status,
        p.is_featured,
        p.is_best_selling,
        p.created_at,
        p.updated_at,
        p.main_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ${productColumns.has("size_id") ? "LEFT JOIN sizes default_size ON p.size_id = default_size.size_id" : ""}
      ${productColumns.has("color_id") ? "LEFT JOIN colors default_color ON p.color_id = default_color.color_id" : ""}
      WHERE 1 = 1
    `;
    const params = [];

    if (status) {
      query += " AND p.status = ?";
      params.push(status);
    }

    if (category_id) {
      query += " AND p.category_id = ?";
      params.push(category_id);
    }

    if (featured === "1") {
      query += " AND p.is_featured = TRUE";
    }

    query += " ORDER BY p.created_at DESC, p.item_id DESC";

    const [products] = await db.query(query, params);

    let variantRows = [];
    if (products.length > 0) {
      const productIds = products.map((product) => product.item_id);
      [variantRows] = await db.query(
        `SELECT
           pv.variant_id,
           pv.item_id,
           pv.stock_quantity AS stock,
           pv.price,
           pv.discount,
           s.name AS size,
           c.color_id,
           c.name AS color,
           c.hex_code AS color_hex
         FROM product_variants pv
         LEFT JOIN sizes s ON s.size_id = pv.size_id
         LEFT JOIN colors c ON c.color_id = pv.color_id
         WHERE pv.status = 'active'
           AND pv.item_id IN (${productIds.map(() => "?").join(", ")})
         ORDER BY pv.item_id, pv.variant_id`,
        productIds
      );
    }

    const variantsByProduct = new Map();
    for (const variant of variantRows) {
      const productVariants = variantsByProduct.get(variant.item_id) || [];
      productVariants.push({
        ...variant,
        stock: Number(variant.stock) || 0,
        price: Number(variant.price) || 0,
        discount: Number(variant.discount) || 0,
      });
      variantsByProduct.set(variant.item_id, productVariants);
    }

    // Attach a URL to fetch the main image instead of embedding the blob
    const data = products.map((product) => {
      const variants = variantsByProduct.get(product.item_id) || [];
      const totalStock = variants.reduce((total, variant) => total + variant.stock, 0);
      const { product_qty: fallbackQty, ...productData } = product;
      return {
        ...productData,
        qty: variants.length ? totalStock : Number(fallbackQty) || 0,
        image: getImageSource(product.main_image),
        main_image: undefined,
        variants,
        sizes: [...new Set([
          ...variants.map((variant) => variant.size),
          product.default_size,
        ].filter(Boolean))],
        colors: [
          ...new Map(
            [
              ...variants
                .filter((variant) => variant.color)
                .map((variant) => [variant.color_id || variant.color, { name: variant.color }]),
              ...(product.default_color
                ? [[product.color_id || product.default_color, {
                    color_id: product.color_id,
                    name: product.default_color,
                    hex_code: product.default_color_hex,
                  }]]
                : []),
            ]
          ).values(),
        ],
        total_stock: variants.length ? totalStock : Number(fallbackQty) || 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}