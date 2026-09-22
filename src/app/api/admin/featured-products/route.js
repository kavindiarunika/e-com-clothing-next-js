import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    if (!(await getAdmin())) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const [products] = await getPool().query(`
      SELECT p.item_id, p.title, p.main_image, p.price, p.status,
             p.is_featured, p.is_best_selling, c.name AS category_name
      FROM products p LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE p.is_featured = 1 OR p.is_best_selling = 1
      ORDER BY p.updated_at DESC
    `);
    return Response.json({ success: true, products });
  } catch (error) {
    console.error("Featured products GET error:", error);
    return Response.json({ success: false, message: "Failed to load featured products" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!(await getAdmin())) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { item_id, is_featured, is_best_selling } = await request.json();
    if (!item_id) return Response.json({ success: false, message: "Product id is required" }, { status: 400 });
    await getPool().execute(
      "UPDATE products SET is_featured = ?, is_best_selling = ? WHERE item_id = ?",
      [Boolean(is_featured), Boolean(is_best_selling), item_id]
    );
    return Response.json({ success: true });
  } catch (error) {
    console.error("Featured products PUT error:", error);
    return Response.json({ success: false, message: "Failed to update featured product" }, { status: 500 });
  }
}
