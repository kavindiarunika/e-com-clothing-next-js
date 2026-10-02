import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE_NAME, verifyCustomerToken } from "@/lib/auth";
import { query } from "@/lib/db";

const PROFILE_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "whatsapp_number",
  "postal_code",
  "address_line1",
  "address_line2",
  "city",
  "district",
];

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

function getCustomer(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  return token ? verifyCustomerToken(token) : null;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Please sign in to view your profile." },
    { status: 401 }
  );
}

export async function GET(request) {
  const customer = getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const users = await query(
      `SELECT ${PROFILE_FIELDS.join(", ")} FROM users
       WHERE user_id = ? AND role = 'customer' AND status = 'active'
       LIMIT 1`,
      [customer.user_id]
    );

    if (!users.length) return unauthorized();

    return NextResponse.json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Get customer profile error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const customer = getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const body = await request.json();
    const values = PROFILE_FIELDS.map((field) =>
      String(body[field] ?? "").trim()
    );
    const profile = Object.fromEntries(
      PROFILE_FIELDS.map((field, index) => [field, values[index]])
    );

    if (!profile.first_name || !profile.email) {
      return NextResponse.json(
        { success: false, message: "First name and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const oversizedField = PROFILE_FIELDS.find(
      (field) => profile[field].length > FIELD_LIMITS[field]
    );
    if (oversizedField) {
      return NextResponse.json(
        { success: false, message: "One or more profile fields are too long." },
        { status: 400 }
      );
    }

    const existingUsers = await query(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ? LIMIT 1",
      [profile.email.toLowerCase(), customer.user_id]
    );
    if (existingUsers.length) {
      return NextResponse.json(
        { success: false, message: "That email is already in use." },
        { status: 409 }
      );
    }

    profile.email = profile.email.toLowerCase();
    await query(
      `UPDATE users SET ${PROFILE_FIELDS.map((field) => `${field} = ?`).join(", ")}
       WHERE user_id = ? AND role = 'customer'`,
      [...PROFILE_FIELDS.map((field) => profile[field]), customer.user_id]
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "That email is already in use." },
        { status: 409 }
      );
    }

    console.error("Update customer profile error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update your profile." },
      { status: 500 }
    );
  }
}