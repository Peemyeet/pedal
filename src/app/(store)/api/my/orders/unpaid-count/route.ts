import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  const count = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: "PENDING",
      paymentSubmittedAt: null,
    },
  });

  return NextResponse.json({ count }, { status: 200 });
}
