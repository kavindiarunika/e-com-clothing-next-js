import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { saveProductImage } from "@/lib/productImageStorage";

function normalizeBannerImage(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const text = value.trim();

    if (
      text.startsWith("/") ||
      text.startsWith("http") ||
      text.startsWith("data:") ||
      text.startsWith("blob:")
    ) {
      return text;
    }

    const looksLikeBase64 = /^[A-Za-z0-9+/\r\n=]+$/.test(text);

    if (looksLikeBase64) {
      return `data:image/jpeg;base64,${text}`;
    }

    return text;
  }

  if (Buffer.isBuffer(value)) {
    const decoded = value.toString("utf8");

    if (
      decoded.startsWith("/") ||
      decoded.startsWith("http") ||
      decoded.startsWith("data:") ||
      decoded.startsWith("blob:")
    ) {
      return decoded;
    }

    const looksLikeBase64 = /^[A-Za-z0-9+/\r\n=]+$/.test(decoded);

    if (looksLikeBase64 && decoded.length > 20) {
      return `data:image/jpeg;base64,${decoded}`;
    }

    return `data:image/jpeg;base64,${value.toString("base64")}`;
  }

  const byteValue = Buffer.from(value);
  const decoded = byteValue.toString("utf8");

  if (
    decoded.startsWith("/") ||
    decoded.startsWith("http") ||
    decoded.startsWith("data:") ||
    decoded.startsWith("blob:")
  ) {
    return decoded;
  }

  return `data:image/jpeg;base64,${byteValue.toString("base64")}`;
}

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
      banner: {
        ...banners[0],
        image: normalizeBannerImage(banners[0].image),
      },
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
    const formData = await request.formData();

    const title = formData.get("title")?.toString() || "";
    const subtitle = formData.get("subtitle")?.toString() || "";
    const imageFile = formData.get("image");
    const imageUrl = formData.get("image_url")?.toString() || "";
    const button_text = formData.get("button_text")?.toString() || "";
    const button_link = formData.get("button_link")?.toString() || "";
    const sort_order = Number(formData.get("sort_order") || 0);
    const start_date = formData.get("start_date")?.toString() || null;
    const end_date = formData.get("end_date")?.toString() || null;
    const status = formData.get("status")?.toString() || "active";

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

    const [existingBanner] = await pool.query(
      `SELECT image FROM hero_banners WHERE banner_id = ?`,
      [bannerId]
    );

    let imageValue = existingBanner?.[0]?.image || "";

    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      imageValue = await saveProductImage(imageFile);
    } else if (imageUrl && imageUrl.trim()) {
      imageValue = imageUrl.trim();
    }

    if (!imageValue) {
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
        imageValue,
        button_text || null,
        button_link || null,
        Number.isFinite(sort_order) ? sort_order : 0,
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