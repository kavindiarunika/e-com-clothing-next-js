import { getPool } from '@/lib/db';
import { NextResponse } from 'next/server';

const db = getPool();

export async function GET(req, { params }) {
  try {
    const { item_id } = params;

    const [rows] = await db.query(
      "SELECT main_image FROM products WHERE item_id = ?",
      [item_id]
    );

    if (rows.length === 0 || !rows[0].main_image) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    return new NextResponse(rows[0].main_image, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg", // adjust if you store mixed formats
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}