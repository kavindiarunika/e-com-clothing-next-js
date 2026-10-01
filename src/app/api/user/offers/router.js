import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const offers = await query(`
      SELECT
        offer_id,
        title,
        description,
        banner_image,
        link,
        start_date,
        end_date,
        status,
        created_at
      FROM offers
      WHERE status = 'active'
      ORDER BY offer_id DESC
    `);
    const formattedOffers = offers.map((offer) => ({
      ...offer,
      banner_image: Buffer.isBuffer(offer.banner_image)
        ? offer.banner_image.toString("utf8")
        : offer.banner_image,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOffers,
    });

  } catch (error) {
    console.error("Get offers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch offers",
      },
      { status: 500 }
    );
  }
}