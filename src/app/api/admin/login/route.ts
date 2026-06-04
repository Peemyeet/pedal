import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminLogin, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const admin = await verifyAdminLogin(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  await createSession(admin.id, admin.email);
  return NextResponse.json({ ok: true, name: admin.name });
}
