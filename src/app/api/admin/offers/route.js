
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { saveProductImage } from "@/lib/productImageStorage";

function formatStoredImage(value) {
  if (!value) return null;
  if (typeof value === "string") return value;

  return Buffer.from(value).toString("base64");
}

/* =====================================================
   GET ALL OFFERS
===================================================== */

export async function GET() {
  try {
    const [offers] = await pool.query(`
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
      ORDER BY created_at DESC
    `);

    const formattedOffers = offers.map((offer) => ({
      ...offer,

      banner_image: formatStoredImage(
        offer.banner_image
      ),
    }));

    return NextResponse.json({
      success: true,
      offers: formattedOffers,
    });

  } catch (error) {

    console.error(
      "GET OFFERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch offers.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   CREATE OFFER
===================================================== */

export async function POST(request) {
  try {

    const formData =
      await request.formData();

    const title =
      formData.get("title");

    const description =
      formData.get("description");

    const link =
      formData.get("link");

    const start_date =
      formData.get("start_date");

    const end_date =
      formData.get("end_date");

    const status =
      formData.get("status") ||
      "active";

    const bannerImage =
      formData.get("banner_image");

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Offer title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      start_date &&
      end_date &&
      new Date(end_date) <
        new Date(start_date)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End date cannot be before start date.",
        },
        {
          status: 400,
        }
      );
    }

    let imagePath = null;

    if (
      bannerImage &&
      typeof bannerImage !== "string"
    ) {
      imagePath = await saveProductImage(bannerImage);
    }

    const [result] =
      await pool.query(
        `
        INSERT INTO offers (
          title,
          description,
          banner_image,
          link,
          start_date,
          end_date,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          title.trim(),
          description || null,
          imagePath,
          link || null,
          start_date || null,
          end_date || null,
          status,
        ]
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Offer added successfully.",
        offer_id:
          result.insertId,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "CREATE OFFER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create offer.",
      },
      {
        status: 500,
      }
    );
  }
}
