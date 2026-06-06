import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminLogin, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

function missingEnvResponse() {
  return NextResponse.json(
    {
      error:
        "เซิร์ฟเวอร์ยังตั้งค่าไม่ครบ (DATABASE_URL / JWT_SECRET) — ตรวจใน Vercel Environment Variables",
    },
    { status: 503 }
  );
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL?.trim()) return missingEnvResponse();
  if (!process.env.JWT_SECRET?.trim()) return missingEnvResponse();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const admin = await verifyAdminLogin(
      parsed.data.email,
      parsed.data.password
    );
    if (!admin) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    await createSession(admin.id, admin.email);
    return NextResponse.json({ ok: true, name: admin.name });
  } catch (error) {
    console.error("[admin/login]", error);
    return NextResponse.json(
      {
        error:
          "เชื่อมต่อฐานข้อมูลไม่สำเร็จ — ตรวจ DATABASE_URL ว่าใช้ Neon pooler (-pooler)",
      },
      { status: 503 }
    );
  }
}
