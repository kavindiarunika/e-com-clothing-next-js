import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();

    // ==========================================
    // CHECK ADMIN LOGIN
    // ==========================================

    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // DASHBOARD QUERIES
    // ==========================================

    const [
      products,
      customers,
      orders,
      revenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      sales,
      paymentStatus,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      // TOTAL PRODUCTS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM products
      `),

      // TOTAL CUSTOMERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'customer'
      `),

      // TOTAL ORDERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM orders
      `),

      // TOTAL REVENUE
      pool.query(`
        SELECT
          COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE payment_status = 'paid'
        AND order_status != 'cancelled'
      `),

      // PENDING ORDERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM orders
        WHERE order_status = 'pending'
      `),

      // PROCESSING ORDERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM orders
        WHERE order_status = 'processing'
      `),

      // SHIPPED ORDERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM orders
        WHERE order_status = 'shipped'
      `),

      // DELIVERED ORDERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM orders
        WHERE order_status = 'delivered'
      `),

      // CANCELLED ORDERS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM orders
        WHERE order_status = 'cancelled'
      `),

      // LAST 7 DAYS SALES
      pool.query(`
        SELECT
          DATE(order_date) AS day,
          COALESCE(SUM(total_amount), 0) AS sales,
          COUNT(*) AS orders
        FROM orders
        WHERE order_date >= DATE_SUB(
          CURDATE(),
          INTERVAL 6 DAY
        )
        AND payment_status = 'paid'
        AND order_status != 'cancelled'
        GROUP BY DATE(order_date)
        ORDER BY day ASC
      `),

      // PAYMENT STATUS
      pool.query(`
        SELECT
          payment_status,
          COUNT(*) AS total
        FROM orders
        GROUP BY payment_status
      `),

      // LOW STOCK VARIANTS
      pool.query(`
        SELECT COUNT(*) AS total
        FROM inventory
        WHERE available_quantity <= 5
      `),

      // RECENT ORDERS
      pool.query(`
        SELECT
          o.order_id,
          o.order_date AS created_at,
          o.total_amount,
          o.order_status AS status,
          u.first_name,
          u.last_name
        FROM orders o
        LEFT JOIN users u
          ON o.user_id = u.user_id
        ORDER BY o.order_id DESC
        LIMIT 5
      `),
    ]);

    // ==========================================
    // PAYMENT STATUS SUMMARY
    // ==========================================

    const paymentSummary = {
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
    };

    paymentStatus[0].forEach((item) => {
      if (
        Object.prototype.hasOwnProperty.call(
          paymentSummary,
          item.payment_status
        )
      ) {
        paymentSummary[item.payment_status] =
          Number(item.total || 0);
      }
    });

    // ==========================================
    // RETURN DATA
    // ==========================================

    return Response.json({
      success: true,

      data: {
        // MAIN STATISTICS
        stats: {
          products: Number(
            products[0][0].total || 0
          ),

          lowStock: Number(
            lowStock[0][0].total || 0
          ),

          customers: Number(
            customers[0][0].total || 0
          ),

          orders: Number(
            orders[0][0].total || 0
          ),

          revenue: Number(
            revenue[0][0].total || 0
          ),
        },

        // ORDER STATUS
        orderStatus: {
          pending: Number(
            pendingOrders[0][0].total || 0
          ),

          processing: Number(
            processingOrders[0][0].total || 0
          ),

          shipped: Number(
            shippedOrders[0][0].total || 0
          ),

          delivered: Number(
            deliveredOrders[0][0].total || 0
          ),

          cancelled: Number(
            cancelledOrders[0][0].total || 0
          ),
        },

        // SALES
        sales: sales[0].map((item) => ({
          day: item.day,
          sales: Number(item.sales || 0),
          orders: Number(item.orders || 0),
        })),

        recentOrders: recentOrders[0],

        // PAYMENT STATUS
        paymentStatus: paymentSummary,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Dashboard loading failed",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}