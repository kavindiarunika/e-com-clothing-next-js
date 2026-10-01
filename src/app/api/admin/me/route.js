import { getAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getAdmin();

  if (!admin) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    admin,
  });
}