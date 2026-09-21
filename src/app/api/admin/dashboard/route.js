import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();
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

    const [
      products,
      customers,
      orders,
      revenue,
      lowStock,
      sales,
      recentOrders,
    ] = await Promise.all([
      // ==========================================
      // TOTAL PRODUCTS
      // ==========================================
      pool.query(
        `SELECT COUNT(*) AS total
         FROM products`
      ),

      // ==========================================
      // TOTAL CUSTOMERS
      // ==========================================
      pool.query(
        `SELECT COUNT(*) AS total
         FROM users
         WHERE role = 'customer'`
      ),

      // ==========================================
      // TOTAL ORDERS
      // ==========================================
      pool.query(
        `SELECT COUNT(*) AS total
         FROM orders`
      ),

      // ==========================================
      // TOTAL REVENUE
      // ==========================================
      // orders table uses order_status,
      // NOT status.
      pool.query(
        `SELECT COALESCE(
          SUM(total_amount), 0
        ) AS total
        FROM orders
        WHERE order_status != 'cancelled'`
      ),

      // ==========================================
      // LOW STOCK
      // ==========================================
      // stock_quantity is in product_variants,
      // NOT products.
      pool.query(
        `SELECT COUNT(*) AS total
         FROM product_variants
         WHERE stock_quantity <= 5
         AND status = 'active'`
      ),

      // ==========================================
      // SALES - LAST 7 DAYS
      // ==========================================
      pool.query(
        `SELECT
          DATE(created_at) AS day,
          COALESCE(SUM(total_amount), 0) AS sales
        FROM orders
        WHERE created_at >= DATE_SUB(
          CURDATE(),
          INTERVAL 6 DAY
        )
        AND order_status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY day`
      ),

      // ==========================================
      // RECENT ORDERS
      // ==========================================
      pool.query(
        `SELECT
          order_id,
          user_id,
          total_amount,
          payment_status,
          order_status,
          order_date,
          created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 8`
      ),
    ]);

    return Response.json({
      success: true,

      data: {
        stats: {
          products: products[0][0].total,
          customers: customers[0][0].total,
          orders: orders[0][0].total,
          revenue: revenue[0][0].total,
          lowStock: lowStock[0][0].total,
        },

        sales: sales[0],

        recentOrders: recentOrders[0],
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return Response.json(
      {
        success: false,
        message: "Dashboard loading failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}