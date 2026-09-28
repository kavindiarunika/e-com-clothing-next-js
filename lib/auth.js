import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_token";

const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_key";

export function createAdminToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

export async function getAdmin() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Auth error:", error.message);
    return null;
  }
}

export function isAdmin(admin) {
  return Boolean(
    admin &&
      (admin.role === "admin" || admin.role === "super_admin")
  );
}