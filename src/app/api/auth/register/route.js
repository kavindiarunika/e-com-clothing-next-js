import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (firstName.length > 100 || lastName.length > 100 || phone.length > 20) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email) || email.length > 150) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUsers = await query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, phone]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Your account has been created.",
        data: {
          user_id: result.insertId,
          first_name: firstName,
          last_name: lastName,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("User registration error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create your account right now." },
      { status: 500 }
    );
  }
}