import db from "@/lib/db";
import { NextResponse } from "next/server";

function normalizeHeroBannerImage(value) {
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

export async function GET() {
  try {
    const [heroBanners] = await db.query(
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
      WHERE status = 'active'
      ORDER BY sort_order ASC, banner_id DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: heroBanners.map((banner) => ({
        ...banner,
        image: normalizeHeroBannerImage(banner.image),
      })),
    });
  } catch (error) {
    console.error("Error fetching hero banners:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error fetching hero banners",
      },
      { status: 500 }
    );
  }
}
