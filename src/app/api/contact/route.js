import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const CONTACT_EMAIL = "kumuduniwijayanthi87@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Please submit a valid contact message." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, message: "Please submit a valid contact message." },
      { status: 400 }
    );
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!name || name.length > 100) {
    return NextResponse.json(
      { success: false, message: "Please enter your name (up to 100 characters)." },
      { status: 400 }
    );
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 150 || /[\r\n]/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (!subject || subject.length > 150) {
    return NextResponse.json(
      { success: false, message: "Please enter a subject (up to 150 characters)." },
      { status: 400 }
    );
  }

  if (!message || message.length > 5000) {
    return NextResponse.json(
      { success: false, message: "Please enter a message of up to 5,000 characters." },
      { status: 400 }
    );
  }

  const smtpPort = Number(process.env.SMTP_PORT);
  if (
    !process.env.SMTP_HOST ||
    !Number.isInteger(smtpPort) ||
    smtpPort < 1 ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    return NextResponse.json(
      { success: false, message: "Email delivery is not configured." },
      { status: 503 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: CONTACT_EMAIL,
      replyTo: { name, address: email },
      subject: `Velora contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent. Thank you for contacting Velora.",
    });
  } catch (error) {
    console.error("Contact message email error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send your message right now. Please try again later." },
      { status: 500 }
    );
  }
}
