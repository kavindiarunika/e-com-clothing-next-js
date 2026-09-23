import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   GET BANNERS
========================================= */

export async function GET() {
  try {
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

    const pool = getPool();

    const [banners] = await pool.query(`
      SELECT
        banner_id,
        title,
        subtitle,
        image,
        button_text,
        button_link,
        sort_order,
        start_date,
        end_date,
        status,
        created_at
      FROM hero_banners
      ORDER BY sort_order ASC, banner_id DESC
    `);

    return Response.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error(
      "Banners GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load banners",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   CREATE BANNER
========================================= */

export async function POST(request) {
  try {
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

    const body = await request.json();

    const {
      title,
      subtitle,
      image,
      button_text,
      button_link,
      sort_order,
      start_date,
      end_date,
      status,
    } = body;

    if (!image || !image.trim()) {
      return Response.json(
        {
          success: false,
          message: "Banner image is required",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "active",
      "inactive",
    ];

    const finalStatus =
      allowedStatuses.includes(status)
        ? status
        : "active";

    const pool = getPool();

    const [result] = await pool.query(
      `
      INSERT INTO hero_banners (
        title,
        subtitle,
        image,
        button_text,
        button_link,
        sort_order,
        start_date,
        end_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title || null,
        subtitle || null,
        image.trim(),
        button_text || null,
        button_link || null,
        Number(sort_order) || 0,
        start_date || null,
        end_date || null,
        finalStatus,
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Banner created successfully",
        banner_id: result.insertId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Banners POST API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to create banner",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}