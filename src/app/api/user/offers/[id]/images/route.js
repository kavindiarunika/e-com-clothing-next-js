import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const offers = await query(
      `
      SELECT banner_image
      FROM offers
      WHERE offer_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!offers.length || !offers[0].banner_image) {
      return new NextResponse("Image not found", {
        status: 404,
      });
    }

    return new NextResponse(offers[0].banner_image, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });

  } catch (error) {
    console.error("Get offer image error:", error);

    return new NextResponse("Failed to load image", {
      status: 500,
    });
  }
}