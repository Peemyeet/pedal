import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaymentSlipUploader } from "../PaymentSlipUploader";
import { markOrderPaid, uploadPaymentSlip } from "./actions";

export const dynamic = "force-dynamic";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatOrderNo(n: number) {
  return `pdl${n.toString().padStart(5, "0")}`;
}

type OrderDelegate = {
  findFirst: (args: {
    where: { id: string; userId: string };
    select: {
      id: true;
      number: true;
      status: true;
      grandTotal: true;
      paymentNote: true;
      paymentSlipPath: true;
      paymentSlipUploadedAt: true;
      paymentSubmittedAt: true;
    };
  }) => Promise<{
    id: string;
    number: number;
    status: "PENDING" | "CANCELLED" | "COMPLETED";
    grandTotal: number;
    paymentNote: string | null;
    paymentSlipPath: string | null;
    paymentSlipUploadedAt: Date | null;
    paymentSubmittedAt: Date | null;
  } | null>;
};

export default async function MyOrderPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ slip?: string; slip_error?: string }>;
}) {
  const s = await auth();
  if (!s?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const orderRepo = (prisma as unknown as { order: OrderDelegate }).order;
  const order = await orderRepo.findFirst({
    where: { id, userId: s.user.id },
    select: {
      id: true,
      number: true,
      status: true,
      grandTotal: true,
      paymentNote: true,
      paymentSlipPath: true,
      paymentSlipUploadedAt: true,
      paymentSubmittedAt: true,
    },
  });
  if (!order) {
    notFound();
  }

  const canPay = order.status === "PENDING" && !order.paymentSubmittedAt;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className="text-sm font-semibold text-[var(--accent)] transition hover:underline"
        >
          ← ออเดอร์ของฉัน
        </Link>
        <h1 className="app-page-title mt-3">ชำระเงิน</h1>
        <p className="app-page-lead mt-2 text-base">
          เลขที่คำสั่งซื้อ {formatOrderNo(order.number)} · ยอดที่ต้องชำระ{" "}
          <span className="font-semibold">{formatThb(order.grandTotal)} บาท</span>
        </p>
      </div>

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">QR ชำระเงิน</h2>
        <div className="mt-4 flex h-64 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] text-center text-sm text-[var(--muted)]">
          QR ชำระเงิน (แนบให้ทีหลัง)
        </div>
        <div className="mt-4 w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <h3 className="text-base font-semibold text-[var(--foreground)]">รายละเอียดบัญชีธนาคารผู้ขาย</h3>
          <div className="mt-2 space-y-1 text-sm sm:text-base">
            <p>
              <span className="text-[var(--muted)]">ธนาคาร:</span> <span className="font-medium">กรุณาเพิ่มภายหลัง</span>
            </p>
            <p>
              <span className="text-[var(--muted)]">ชื่อบัญชี:</span> <span className="font-medium">กรุณาเพิ่มภายหลัง</span>
            </p>
            <p>
              <span className="text-[var(--muted)]">เลขบัญชี:</span> <span className="font-mono font-medium">xxx-x-xxxxx-x</span>
            </p>
          </div>
        </div>
        {order.paymentNote ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            หมายเหตุเดิม: <span className="text-[var(--foreground)]">{order.paymentNote}</span>
          </p>
        ) : null}
      </section>

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">แนบสลิป</h2>
        {!canPay ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
            ออเดอร์นี้ไม่อยู่ในสถานะรอชำระเงินแล้ว
          </p>
        ) : null}
        <div className="mt-4">
          <PaymentSlipUploader
            disabled={!canPay}
            orderId={order.id}
            uploadAction={uploadPaymentSlip}
          />
        </div>
        {sp.slip === "1" ? (
          <p className="mt-2 text-sm font-medium text-emerald-700">แนบสลิปเรียบร้อยแล้ว</p>
        ) : null}
        {sp.slip_error === "size" ? (
          <p className="mt-2 text-sm font-medium text-red-700">ไฟล์ใหญ่เกินไป (สูงสุด 8MB)</p>
        ) : null}
        {sp.slip_error === "type" ? (
          <p className="mt-2 text-sm font-medium text-red-700">รองรับเฉพาะ JPG, PNG, WEBP หรือ PDF</p>
        ) : null}
        {order.paymentSlipPath ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            หลักฐานล่าสุด:{" "}
            <a
              href={order.paymentSlipPath}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              เปิดไฟล์หลักฐาน
            </a>
            {order.paymentSlipUploadedAt
              ? ` · อัปโหลดเมื่อ ${order.paymentSlipUploadedAt.toLocaleString("th-TH")}`
              : ""}
          </p>
        ) : null}
        {canPay ? (
          <form action={markOrderPaid} className="mt-4">
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="app-btn-primary">
              ยืนยันชำระเงินแล้ว
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            ชำระเงินแล้วเมื่อ {order.paymentSubmittedAt?.toLocaleString("th-TH")}
          </p>
        )}
      </section>
    </div>
  );
}
