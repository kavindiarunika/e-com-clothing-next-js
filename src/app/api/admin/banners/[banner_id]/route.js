import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   GET SINGLE BANNER
========================================= */

export async function GET(
  request,
  { params }
) {
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

    const bannerId = params.banner_id;

    const pool = getPool();

    const [banners] = await pool.query(
      `
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
      WHERE banner_id = ?
      `,
      [bannerId]
    );

    if (banners.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Banner not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      banner: banners[0],
    });
  } catch (error) {
    console.error(
      "Banner GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load banner",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   UPDATE BANNER
========================================= */

export async function PUT(
  request,
  { params }
) {
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

    const bannerId = params.banner_id;

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

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        {
          success: false,
          message: "Invalid banner status",
        },
        {
          status: 400,
        }
      );
    }

    const pool = getPool();

    const [result] = await pool.query(
      `
      UPDATE hero_banners
      SET
        title = ?,
        subtitle = ?,
        image = ?,
        button_text = ?,
        button_link = ?,
        sort_order = ?,
        start_date = ?,
        end_date = ?,
        status = ?
      WHERE banner_id = ?
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
        status,
        bannerId,
      ]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Banner not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Banner updated successfully",
    });
  } catch (error) {
    console.error(
      "Banner PUT API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to update banner",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   DELETE BANNER
========================================= */

export async function DELETE(
  request,
  { params }
) {
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

    const bannerId = params.banner_id;

    const pool = getPool();

    const [result] = await pool.query(
      `
      DELETE FROM hero_banners
      WHERE banner_id = ?
      `,
      [bannerId]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Banner not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error(
      "Banner DELETE API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to delete banner",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}