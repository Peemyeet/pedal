"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateFulfillment } from "@/app/quotations/actions";

function shorten(text: string, max = 280) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type Props = {
  quotationId: string;
  initialPaymentConfirmed: boolean;
  initialPaymentTransactionRef: string | null;
  initialShipped: boolean;
  initialTracking: string | null;
  hasCustomer: boolean;
  billingAddress: string | null;
  shippingAddress: string | null;
  initialDispatchSource: string | null;
};

export function FulfillmentPanel({
  quotationId,
  initialPaymentConfirmed,
  initialPaymentTransactionRef,
  initialShipped,
  initialTracking,
  hasCustomer,
  billingAddress,
  shippingAddress,
  initialDispatchSource,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(initialPaymentConfirmed);
  const [paymentTransactionRef, setPaymentTransactionRef] = useState(
    initialPaymentTransactionRef ?? "",
  );
  const [shipped, setShipped] = useState(initialShipped);
  const [trackingNumber, setTrackingNumber] = useState(initialTracking ?? "");

  const bill = billingAddress?.trim() || "";
  const ship = shippingAddress?.trim() || "";
  const hasBill = !!bill;
  const hasShip = !!ship;
  const showDispatchPicker = hasCustomer && hasBill && hasShip;

  const [dispatchSource, setDispatchSource] = useState<"billing" | "shipping">(() => {
    if (initialDispatchSource === "billing") return "billing";
    return "shipping";
  });

  useEffect(() => {
    setPaymentConfirmed(initialPaymentConfirmed);
    setPaymentTransactionRef(initialPaymentTransactionRef ?? "");
    setShipped(initialShipped);
    setTrackingNumber(initialTracking ?? "");
  }, [
    initialPaymentConfirmed,
    initialPaymentTransactionRef,
    initialShipped,
    initialTracking,
  ]);

  useEffect(() => {
    if (initialDispatchSource === "billing") setDispatchSource("billing");
    else if (initialDispatchSource === "shipping") setDispatchSource("shipping");
  }, [initialDispatchSource]);

  function dispatchPayload(): { dispatchAddressSource?: "billing" | "shipping" } {
    if (!hasCustomer) return {};
    if (hasBill && hasShip) {
      return { dispatchAddressSource: dispatchSource };
    }
    if (hasBill) return { dispatchAddressSource: "billing" };
    if (hasShip) return { dispatchAddressSource: "shipping" };
    return {};
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateFulfillment(quotationId, {
        paymentConfirmed,
        paymentTransactionRef,
        shipped,
        trackingNumber,
        ...dispatchPayload(),
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if (paymentConfirmed && shipped) {
        router.push(`/quotations/${quotationId}/postal`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="app-card p-4 sm:p-6 md:p-8">
      <h2 className="mb-3 text-xl font-bold">ชำระเงินและจัดส่ง</h2>
      <p className="mb-6 text-base leading-relaxed text-[var(--muted)]">
        บันทึกลงฐานข้อมูล — สถานะจะสะท้อนที่เมนู &quot;ยืนยันแล้ว · ชำระเงินและส่งของ&quot;
      </p>
      <div className="space-y-5 text-base">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={paymentConfirmed}
            onChange={(e) => {
              const on = e.target.checked;
              setPaymentConfirmed(on);
              if (!on) setPaymentTransactionRef("");
            }}
            className="h-5 w-5 rounded border-[var(--border)]"
          />
          <span>ยืนยันการชำระเงินแล้ว</span>
        </label>
        {paymentConfirmed ? (
          <div>
            <label className="app-label">
              เลขที่อ้างอิงการโอน / ใบทำธุรกรรม <span className="text-red-600">*</span>
            </label>
            <input
              value={paymentTransactionRef}
              onChange={(e) => setPaymentTransactionRef(e.target.value)}
              placeholder="เช่น เลขอ้างอิงจากธนาคารหรือสลิป"
              className="mt-2 min-h-12 w-full max-w-md px-4 text-base"
            />
          </div>
        ) : null}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={shipped}
            onChange={(e) => setShipped(e.target.checked)}
            className="h-5 w-5 rounded border-[var(--border)]"
          />
          <span>ส่งของแล้ว</span>
        </label>
        <div>
          <label className="app-label">เลขพัสดุ / ขนส่ง (ถ้ามี)</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            disabled={!shipped}
            className="mt-2 min-h-12 w-full max-w-md px-4 text-base disabled:bg-[var(--surface-muted)]"
          />
        </div>
      </div>

      {showDispatchPicker ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
          <h3 className="text-base font-bold text-[var(--foreground)]">
            เลือกที่อยู่สำหรับจัดส่งพัสดุ
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            เลือกว่าจะใช้ที่อยู่ใดเป็นปลายทางจัดส่ง (อัปเดตในใบและหน้าไปรษณีย์เมื่อบันทึก)
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 has-[:checked]:border-[var(--accent)] has-[:checked]:ring-2 has-[:checked]:ring-[var(--accent-ring)]">
              <input
                type="radio"
                name="fulfillment-dispatch"
                className="mt-1"
                checked={dispatchSource === "billing"}
                onChange={() => setDispatchSource("billing")}
              />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">ที่อยู่ออกบิล</span>
                <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-[var(--muted)]">
                  {shorten(bill, 400)}
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 has-[:checked]:border-[var(--accent)] has-[:checked]:ring-2 has-[:checked]:ring-[var(--accent-ring)]">
              <input
                type="radio"
                name="fulfillment-dispatch"
                className="mt-1"
                checked={dispatchSource === "shipping"}
                onChange={() => setDispatchSource("shipping")}
              />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">ที่อยู่จัดส่ง</span>
                <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-[var(--muted)]">
                  {shorten(ship, 400)}
                </p>
              </div>
            </label>
          </div>
        </div>
      ) : hasCustomer && (hasBill || hasShip) ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-base text-[var(--muted)]">
          {hasBill && !hasShip
            ? "ใช้ที่อยู่ออกบิลเป็นที่อยู่จัดส่ง (บันทึกอัตโนมัติเมื่อกดบันทึก)"
            : "ใช้ที่อยู่จัดส่ง (บันทึกอัตโนมัติเมื่อกดบันทึก)"}
        </div>
      ) : hasCustomer ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-base text-amber-950">
          ไม่มีที่อยู่ออกบิลและที่อยู่จัดส่งในลูกค้า — จะใช้ที่อยู่จากตอนยืนยันสั่งซื้อเดิม
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-base font-medium text-red-600">{error}</p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="app-btn-primary mt-8 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก…" : "บันทึกการชำระเงินและการส่งของ"}
      </button>
    </section>
  );
}
