import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    const [sizes] = await pool.execute(
      "SELECT size_id, name FROM sizes ORDER BY size_id"
    );

    return NextResponse.json({ success: true, sizes });
  } catch (error) {
    console.error("Get public sizes error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load sizes." },
      { status: 500 }
    );
  }
}
