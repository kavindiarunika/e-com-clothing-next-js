import { NextResponse } from "next/server";
import {
  createGuestToken,
  CUSTOMER_COOKIE_NAME,
  GUEST_COOKIE_NAME,
} from "@/lib/auth";
import { query } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_LIMITS = {
  first_name: 100,
  last_name: 100,
  email: 150,
  phone: 20,
  whatsapp_number: 20,
  postal_code: 20,
  address_line1: 255,
  address_line2: 255,
  city: 100,
  district: 100,
};

function readField(body, camelName, snakeName) {
  return String(body[camelName] ?? body[snakeName] ?? "").trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Guest details must be provided as an object." },
        { status: 400 }
      );
    }

    const guest = {
      first_name: readField(body, "firstName", "first_name"),
      last_name: readField(body, "lastName", "last_name"),
      email: readField(body, "email", "email").toLowerCase(),
      phone: readField(body, "phone", "phone"),
      whatsapp_number: readField(body, "whatsappNumber", "whatsapp_number"),
      postal_code: readField(body, "postalCode", "postal_code"),
      address_line1:
        readField(body, "addressLine1", "address_line1") ||
        readField(body, "address", "address"),
      address_line2: readField(body, "addressLine2", "address_line2"),
      city: readField(body, "city", "city"),
      district: readField(body, "district", "district"),
    };

    if (!guest.first_name || !guest.phone || !guest.address_line1) {
      return NextResponse.json(
        {
          success: false,
          message: "First name, phone, and address line 1 are required.",
        },
        { status: 400 }
      );
    }

    const oversizedField = Object.keys(FIELD_LIMITS).find(
      (field) => guest[field].length > FIELD_LIMITS[field]
    );
    if (oversizedField) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (guest.email && !EMAIL_PATTERN.test(guest.email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO guest_customers (
         first_name, last_name, email, phone, whatsapp_number,
         postal_code, address_line1, address_line2, city, district
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guest.first_name,
        guest.last_name || null,
        guest.email || null,
        guest.phone,
        guest.whatsapp_number || null,
        guest.postal_code || null,
        guest.address_line1,
        guest.address_line2 || null,
        guest.city || null,
        guest.district || null,
      ]
    );

    const guestId = Number(result.insertId);
    const response = NextResponse.json(
      {
        success: true,
        message: "Guest checkout session created.",
        data: { guest_id: guestId, ...guest },
      },
      { status: 201 }
    );

    response.cookies.set(GUEST_COOKIE_NAME, createGuestToken({
      guest_id: guestId,
      email: guest.email || null,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to start guest checkout right now." },
      { status: 500 }
    );
  }
}
