import { getPool } from "@/lib/db";
import {
  CUSTOMER_COOKIE_NAME,
  verifyCustomerToken,
} from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("item_id");

  if (!itemId || !/^\d+$/.test(itemId) || Number(itemId) < 1) {
    return Response.json(
      { success: false, message: "A valid product ID is required." },
      { status: 400 }
    );
  }

  try {
    const pool = getPool();
    const [reviews] = await pool.execute(
      `SELECT
         r.review_id,
         r.rating,
         r.review_text,
         r.created_at,
         CONCAT_WS(' ', u.first_name, u.last_name) AS reviewer_name
       FROM reviews r
       INNER JOIN users u ON u.user_id = r.user_id
       WHERE r.item_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC, r.review_id DESC`,
      [Number(itemId)]
    );

    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const customer = token ? verifyCustomerToken(token) : null;
    let purchases = [];
    let hasPurchased = false;
    let isAuthenticated = false;

    if (customer) {
      const [activeCustomers] = await pool.execute(
        "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 'active' LIMIT 1",
        [customer.user_id]
      );

      if (activeCustomers.length > 0) {
        isAuthenticated = true;
        const [customerPurchases] = await pool.execute(
          `SELECT DISTINCT
             o.order_id,
             o.order_date,
             EXISTS (
               SELECT 1
               FROM reviews r
               WHERE r.order_id = o.order_id
                 AND r.item_id = ?
             ) AS has_review
           FROM orders o
           INNER JOIN order_items oi
             ON oi.order_id = o.order_id AND oi.item_id = ?
           WHERE o.user_id = ?
             AND o.order_status = 'delivered'
           ORDER BY o.order_date DESC, o.order_id DESC`,
          [Number(itemId), Number(itemId), customer.user_id]
        );

        hasPurchased = customerPurchases.length > 0;
        purchases = customerPurchases
          .filter((purchase) => !Number(purchase.has_review))
          .map(({ order_id, order_date }) => ({
            order_id,
            order_date,
          }));
      }
    }

    return Response.json({
      success: true,
      reviews,
      is_authenticated: isAuthenticated,
      has_purchased: hasPurchased,
      eligible_purchases: purchases,
    });
  } catch (error) {
    console.error("Review GET API Error:", error);
    return Response.json(
      { success: false, message: "Failed to load product reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const customer = token ? verifyCustomerToken(token) : null;

  if (!customer) {
    return Response.json(
      { success: false, message: "Please sign in to submit a review." },
      { status: 401 }
    );
  }

  let connection;

  try {
    const { item_id, order_id, rating, review_text } = await request.json();
    const itemId = Number(item_id);
    const orderId = Number(order_id);
    const reviewRating = Number(rating);
    const reviewText = String(review_text || "").trim();

    if (
      !Number.isInteger(itemId) ||
      itemId < 1 ||
      !Number.isInteger(orderId) ||
      orderId < 1 ||
      !Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5 ||
      !reviewText
    ) {
      return Response.json(
        { success: false, message: "Please provide a valid name, rating, and review." },
        { status: 400 }
      );
    }

    const pool = getPool();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [activeCustomers] = await connection.execute(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 'active' LIMIT 1",
      [customer.user_id]
    );

    if (activeCustomers.length === 0) {
      await connection.rollback();
      return Response.json(
        { success: false, message: "Your customer account is not active. Please sign in again." },
        { status: 401 }
      );
    }

    const [purchases] = await connection.execute(
      `SELECT o.order_id
       FROM orders o
       WHERE o.order_id = ?
         AND o.user_id = ?
         AND o.order_status = 'delivered'
         AND EXISTS (
           SELECT 1
           FROM order_items oi
           WHERE oi.order_id = o.order_id
             AND oi.item_id = ?
         )
       FOR UPDATE`,
      [orderId, customer.user_id, itemId]
    );

    if (purchases.length === 0) {
      await connection.rollback();
      return Response.json(
        { success: false, message: "You can review this product after it has been delivered in one of your orders." },
        { status: 403 }
      );
    }

    const [existingReviews] = await connection.execute(
      "SELECT review_id FROM reviews WHERE order_id = ? AND item_id = ? LIMIT 1 FOR UPDATE",
      [orderId, itemId]
    );

    if (existingReviews.length > 0) {
      await connection.rollback();
      return Response.json(
        { success: false, message: "You have already submitted a review for this purchase." },
        { status: 409 }
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO reviews (item_id, user_id, order_id, rating, review_text, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [itemId, customer.user_id, orderId, reviewRating, reviewText]
    );
    await connection.commit();

    return Response.json(
      {
        success: true,
        review: {
          review_id: result.insertId,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Review transaction rollback error:", rollbackError);
      }
    }

    console.error("Review POST API Error:", error);
    return Response.json(
      { success: false, message: "Failed to submit review." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}