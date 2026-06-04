import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getShopSettings, updateShopSettings } from "@/lib/shop-settings";

const settingsSchema = z.object({
  shortName: z.string().min(1).max(100),
  nameTh: z.string().min(1).max(200),
  nameEn: z.string().max(200),
  address: z.string().min(1).max(500),
  addressEn: z.string().max(500),
  taxId: z.string().max(50),
  phones: z.array(z.string().min(1)).min(1),
  fax: z.string().max(50),
  email: z.string().max(200),
  website: z.string().max(200),
  logoInitials: z.string().min(1).max(10),
  quotationNote: z.string().max(1000),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getShopSettings());
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  await updateShopSettings(parsed.data);
  return NextResponse.json(await getShopSettings());
}
