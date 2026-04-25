"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmPurchase } from "@/app/(admin)/quotations/actions";

function shorten(text: string, max = 220) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function ConfirmPurchaseSection({
  quotationId,
  hasCustomer,
  billingAddress,
  shippingAddress,
  quotationNote,
}: {
  quotationId: string;
  hasCustomer: boolean;
  billingAddress: string | null;
  shippingAddress: string | null;
  quotationNote: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const bill = billingAddress?.trim() || "";
  const ship = shippingAddress?.trim() || "";
  const hasBill = !!bill;
  const hasShip = !!ship;
  const note = quotationNote?.trim() || "";

  const needChooseBoth = hasCustomer && hasBill && hasShip;

  const [addressSource, setAddressSource] = useState<"billing" | "shipping">(() =>
    hasShip ? "shipping" : "billing",
  );

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await confirmPurchase(
        quotationId,
        needChooseBoth ? { addressSource } : undefined,
      );
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.push("/quotations/fulfillment");
      router.refresh();
    });
  }

  return (
    <section className="app-card space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h2 className="text-xl font-bold">ยืนยันการสั่งซื้อ</h2>
      </div>

      {needChooseBoth ? (
        <div className="space-y-3">
          <h3 className="text-base font-bold">เลือกที่อยู่สำหรับจัดส่ง</h3>
          <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-softer)]">
            <input
              type="radio"
              name="addr"
              className="mt-1"
              checked={addressSource === "shipping"}
              onChange={() => setAddressSource("shipping")}
            />
            <div className="min-w-0 flex-1 text-sm">
              <span className="font-medium">ที่อยู่จัดส่ง</span>
              <p className="mt-1 whitespace-pre-wrap break-words text-[var(--muted)]">
                {shorten(ship, 400)}
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-softer)]">
            <input
              type="radio"
              name="addr"
              className="mt-1"
              checked={addressSource === "billing"}
              onChange={() => setAddressSource("billing")}
            />
            <div className="min-w-0 flex-1 text-sm">
              <span className="font-medium">ที่อยู่ออกบิล</span>
              <p className="mt-1 whitespace-pre-wrap break-words text-[var(--muted)]">
                {shorten(bill, 400)}
              </p>
            </div>
          </label>
        </div>
      ) : hasCustomer && !hasBill && !hasShip && note ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950">
          <p className="font-medium">จะใช้หมายเหตุในใบ</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed opacity-90">
            {shorten(note, 500)}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "กำลังบันทึก…" : "ลูกค้ายืนยันซื้อแล้ว"}
        </button>
        <Link
          href={`/quotations/${quotationId}/quote`}
          className="app-btn-secondary min-h-12 w-full px-6 py-3 text-base font-semibold sm:w-auto"
        >
          พิมพ์
        </Link>
      </div>
    </section>
  );
}
