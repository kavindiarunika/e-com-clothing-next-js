
import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description = null,
      main_image = null,
      price = 0,
      discount = 0,
      category_id = null,
      sku = null,
      brand = null,
      tags = [],
      status = "active",
      is_featured = false,
      is_best_selling = false,
    } = body;

    if (!title || !String(title).trim()) {
      return Response.json(
        { success: false, message: "Product title is required" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.execute(
      `
        INSERT INTO products (
          title,
          description,
          main_image,
          price,
          discount,
          category_id,
          sku,
          brand,
          tags,
          status,
          is_featured,
          is_best_selling
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(title).trim(),
        description,
        main_image,
        Number(price) || 0,
        Number(discount) || 0,
        category_id || null,
        sku || null,
        brand || null,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        status,
        Boolean(is_featured),
        Boolean(is_best_selling),
      ]
    );

    return Response.json(
      { success: true, item_id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Products API Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get database connection
    const pool = getPool();

    // Check admin authentication
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get all products
    // Only fields that exist in the products table are selected
    const [products] = await pool.query(`
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
        p.tags,
        p.status,
        p.is_featured,
        p.is_best_selling,
        p.created_at,
        p.updated_at,

        c.name AS category_name

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.category_id

      ORDER BY p.item_id DESC
    `);

    // Convert MySQL JSON tags into JavaScript array
    const formattedProducts = products.map((product) => {
      let tags = [];

      if (product.tags) {
        try {
          tags =
            typeof product.tags === "string"
              ? JSON.parse(product.tags)
              : product.tags;
        } catch (error) {
          tags = [];
        }
      }

      return {
        ...product,
        tags,
        is_featured: Boolean(product.is_featured),
        is_best_selling: Boolean(product.is_best_selling),
      };
    });

    return Response.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Products API Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
