import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get single offer
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const offers = await query(
      `
      SELECT
        offer_id,
        title,
        description,
        link,
        start_date,
        end_date,
        status,
        created_at
      FROM offers
      WHERE offer_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!offers.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Offer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: offers[0],
    });
  } catch (error) {
    console.error("Get offer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch offer",
      },
      { status: 500 }
    );
  }
}


// PUT - Update offer
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const bannerImage = formData.get("banner_image");
    const link = formData.get("link");
    const startDate = formData.get("start_date") || null;
    const endDate = formData.get("end_date") || null;
    const status = formData.get("status") || "active";

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 }
      );
    }

    let result;

    // If new image is uploaded
    if (bannerImage && bannerImage.size > 0) {
      const imageBuffer = Buffer.from(
        await bannerImage.arrayBuffer()
      );

      result = await query(
        `
        UPDATE offers
        SET
          title = ?,
          description = ?,
          banner_image = ?,
          link = ?,
          start_date = ?,
          end_date = ?,
          status = ?
        WHERE offer_id = ?
        `,
        [
          title.trim(),
          description || null,
          imageBuffer,
          link || null,
          startDate,
          endDate,
          status,
          id,
        ]
      );
    } else {
      // Update without changing existing image
      result = await query(
        `
        UPDATE offers
        SET
          title = ?,
          description = ?,
          link = ?,
          start_date = ?,
          end_date = ?,
          status = ?
        WHERE offer_id = ?
        `,
        [
          title.trim(),
          description || null,
          link || null,
          startDate,
          endDate,
          status,
          id,
        ]
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Offer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer updated successfully",
    });
  } catch (error) {
    console.error("Update offer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update offer",
      },
      { status: 500 }
    );
  }
}


// DELETE - Delete offer
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await query(
      `
      DELETE FROM offers
      WHERE offer_id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Offer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete offer",
      },
      { status: 500 }
    );
  }
}