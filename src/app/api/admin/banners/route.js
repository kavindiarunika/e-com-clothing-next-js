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
      banners: banners.map((banner) => ({
        ...banner,
        image: normalizeBannerImage(banner.image),
      })),
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

    let imageValue = "";

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
        imageValue,
        button_text || null,
        button_link || null,
        Number.isFinite(sort_order) ? sort_order : 0,
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