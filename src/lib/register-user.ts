"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const USERNAME_RE = /^[a-z0-9_]{3,32}$/;

export async function registerUser(input: {
  name: string;
  username: string;
  password: string;
  email?: string;
}) {
  const name = input.name?.trim() ?? "";
  const username = input.username?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";
  const emailRaw = input.email?.trim();
  const email =
    emailRaw && emailRaw.includes("@") && emailRaw.length >= 4 ? emailRaw.toLowerCase() : undefined;
  if (name.length < 2) {
    return { error: "กรุณากรอกชื่อ" } as const;
  }
  if (!USERNAME_RE.test(username)) {
    return {
      error: "ชื่อผู้ใช้ 3–32 ตัว ใช้ตัวอักษร a–z ตัวเลข และ _ เท่านั้น",
    } as const;
  }
  if (password.length < 8) {
    return { error: "รหัสผ่านอย่างน้อย 8 ตัว" } as const;
  }
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return { error: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" } as const;
  }
  if (email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return { error: "อีเมลนี้ถูกใช้แล้ว" } as const;
    }
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await prisma.user.create({
      data: {
        name,
        username,
        email: email ?? null,
        password: passwordHash,
        role: "CUSTOMER",
      },
    });
    return { ok: true as const };
  } catch {
    return { error: "ลงทะเบียนไม่สำเร็จ" } as const;
  }
}
