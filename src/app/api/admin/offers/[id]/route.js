
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { saveProductImage } from "@/lib/productImageStorage";

/* =====================================================
   UPDATE OFFER
===================================================== */

export async function PUT(
  request,
  { params }
) {
  try {

    const { id } = await params;

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

    /* ================================================
       IF NEW IMAGE WAS UPLOADED
    ================================================= */

    if (
      bannerImage &&
      typeof bannerImage !== "string"
    ) {

      const imagePath =
        await saveProductImage(bannerImage);

      const [result] =
        await pool.query(
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
            imagePath,
            link || null,
            start_date || null,
            end_date || null,
            status,
            id,
          ]
        );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Offer not found.",
          },
          {
            status: 404,
          }
        );
      }

    } else {

      /* ================================================
         UPDATE WITHOUT CHANGING IMAGE
      ================================================= */

      const [result] =
        await pool.query(
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
            start_date || null,
            end_date || null,
            status,
            id,
          ]
        );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Offer not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Offer updated successfully.",
    });

  } catch (error) {

    console.error(
      "UPDATE OFFER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update offer.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   DELETE OFFER
===================================================== */

export async function DELETE(
  request,
  { params }
) {
  try {

    const { id } = await params;

    const [result] =
      await pool.query(
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
          message:
            "Offer not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Offer deleted successfully.",
    });

  } catch (error) {

    console.error(
      "DELETE OFFER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete offer.",
      },
      {
        status: 500,
      }
    );
  }
}
