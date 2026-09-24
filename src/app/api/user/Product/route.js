import { getPool } from '@/lib/db';
import { NextResponse } from 'next/server';

const db = getPool();

// GET - Get all products
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // optional filter: active/inactive/out_of_stock
    const category_id = searchParams.get('category_id'); // optional filter
    const featured = searchParams.get('featured'); // optional: "1" or "0"

    let query = `
      SELECT
        p.item_id,
        p.title,
        p.description,
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
        p.updated_at,
        CASE WHEN p.main_image IS NOT NULL THEN 1 ELSE 0 END AS has_main_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
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

    query += " ORDER BY p.item_id DESC";

    const [products] = await db.query(query, params);

    // Attach a URL to fetch the main image instead of embedding the blob
    const data = products.map((p) => ({
      ...p,
      main_image_url: p.has_main_image
        ? `/api/products/${p.item_id}/image`
        : null,
    }));

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