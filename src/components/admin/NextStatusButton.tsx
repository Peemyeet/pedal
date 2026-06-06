"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrderStatusLabel } from "@/lib/utils";
import { openReceiptPopup } from "./openReceiptPopup";

const WEBSITE_FLOW = ["CONFIRMED", "PENDING", "WAITING_SHIPMENT", "SHIPPED"];
const WHOLESALE_FLOW = [
  "QUOTATION",
  "CONFIRMED",
  "PAID",
  "WAITING_SHIPMENT",
  "SHIPPED",
];

function getNextStatus(source: "web" | "wholesale", currentStatus: string) {
  const flow = source === "web" ? WEBSITE_FLOW : WHOLESALE_FLOW;
  const index = flow.indexOf(currentStatus);
  if (index < 0 || index >= flow.length - 1) return null;
  return flow[index + 1];
}

function getNextStatusLabel(
  source: "web" | "wholesale",
  nextStatus: string
) {
  if (source === "web" && nextStatus === "WAITING_SHIPMENT") {
    return "ชำระเงินแล้ว";
  }
  return getOrderStatusLabel(
    nextStatus,
    source === "web" ? "WEBSITE" : "WHOLESALE"
  );
}

export function NextStatusButton({
  orderId,
  source,
  currentStatus,
}: {
  orderId: string;
  source: "web" | "wholesale";
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const nextStatus = getNextStatus(source, currentStatus);
  const needsTrackingInput = currentStatus === "WAITING_SHIPMENT";
  const needsPaymentProof =
    (source === "wholesale" && currentStatus === "CONFIRMED") ||
    (source === "web" &&
      currentStatus === "PENDING" &&
      nextStatus === "WAITING_SHIPMENT");
  const isConfirmPaymentStep = source === "wholesale" && currentStatus === "PAID";
  const shouldGoToUnpaidAfterQuotationConfirm =
    source === "wholesale" &&
    currentStatus === "QUOTATION" &&
    nextStatus === "CONFIRMED";
  const shouldGoToUnshippedAfterPayment =
    source === "wholesale" && currentStatus === "CONFIRMED" && nextStatus === "PAID";

  useEffect(() => {
    if (!visible) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [visible]);

  if (!nextStatus) {
    return null;
  }

  function openModal() {
    setSuccess(false);
    setError("");
    setTrackingNumber("");
    setPaymentSlip(null);
    setPaymentSlipPreview("");
    setPaymentReference("");
    setVisible(true);
  }

  function closeModal() {
    setEntered(false);
    if (paymentSlipPreview) {
      URL.revokeObjectURL(paymentSlipPreview);
    }
    window.setTimeout(() => {
      setVisible(false);
      setSuccess(false);
      setError("");
      setPaymentSlip(null);
      setPaymentSlipPreview("");
      setPaymentReference("");
    }, 220);
  }

  function onPaymentSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setPaymentSlip(file);
    if (file.type.startsWith("image/")) {
      setPaymentSlipPreview(URL.createObjectURL(file));
    } else {
      setPaymentSlipPreview("");
    }
  }

  async function handleNext() {
    if (!nextStatus || loading) return;
    if (needsTrackingInput && !trackingNumber.trim()) {
      setError("กรุณากรอกเลขพัสดุก่อนยืนยัน");
      return;
    }
    if (needsPaymentProof && !paymentSlip) {
      setError("กรุณาแนบหลักฐานการชำระเงิน");
      return;
    }
    if (needsPaymentProof && !paymentReference.trim()) {
      setError("กรุณากรอกเลขอ้างอิง");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let paymentSlipPath: string | undefined;
      if (needsPaymentProof && paymentSlip) {
        const formData = new FormData();
        formData.append("file", paymentSlip);
        const uploadRes = await fetch(
          `/api/admin/orders/${orderId}/payment-slip`,
          { method: "POST", body: formData }
        );
        const uploadData = (await uploadRes.json()) as {
          path?: string;
          error?: string;
        };
        if (!uploadRes.ok || !uploadData.path) {
          setError(uploadData.error ?? "อัปโหลดหลักฐานไม่สำเร็จ");
          return;
        }
        paymentSlipPath = uploadData.path;
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          ...(needsTrackingInput ? { trackingNumber: trackingNumber.trim() } : {}),
          ...(paymentSlipPath ? { paymentSlipPath } : {}),
          ...(needsPaymentProof
            ? { paymentReference: paymentReference.trim() }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "อัปเดตสถานะไม่สำเร็จ");
        return;
      }

      setSuccess(true);
      window.setTimeout(() => {
        closeModal();
        if (isConfirmPaymentStep) {
          void openReceiptPopup(orderId);
        }
        if (shouldGoToUnshippedAfterPayment) {
          router.push("/admin/orders/wholesale?filter=UNSHIPPED");
          return;
        }
        if (shouldGoToUnpaidAfterQuotationConfirm) {
          router.push("/admin/orders/wholesale?filter=UNPAID");
          return;
        }
        router.refresh();
      }, 1400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={loading}
        className="inline-flex rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {loading
          ? "..."
          : needsPaymentProof
            ? "ยืนยันการชำระเงิน"
            : shouldGoToUnpaidAfterQuotationConfirm
              ? "ยืนยันแล้ว"
              : isConfirmPaymentStep
              ? "ยืนยันรับเงิน"
              : needsTrackingInput
                ? "กรอกเลขพัสดุ"
                : "Next"}
      </button>

      {visible && nextStatus && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
            entered ? "bg-black/45" : "bg-black/0"
          }`}
          style={{ animation: entered ? "modal-backdrop-in 0.22s ease-out" : undefined }}
          onClick={() => !loading && !success && closeModal()}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="next-status-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-200/80"
            style={{
              animation: entered
                ? "modal-panel-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
                : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
                  style={{ animation: "success-circle-pop 0.45s ease-out" }}
                >
                  <svg
                    className="h-9 w-9 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      style={{
                        strokeDasharray: 24,
                        animation: "success-check-draw 0.35s ease-out 0.2s forwards",
                        strokeDashoffset: 24,
                      }}
                    />
                  </svg>
                </div>
                <p className="mt-4 text-lg font-semibold text-stone-900">
                  ยืนยันแล้ว
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  เปลี่ยนเป็น{" "}
                  <span className="font-medium text-emerald-700">
                    {getNextStatusLabel(source, nextStatus)}
                  </span>{" "}
                  เรียบร้อย
                </p>
              </div>
            ) : (
              <>
                <h3
                  id="next-status-title"
                  className="text-lg font-semibold text-stone-900"
                >
                  {needsPaymentProof
                    ? "ยืนยันการชำระเงิน"
                    : "ยืนยันเปลี่ยนสถานะ"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {needsPaymentProof ? (
                    <>
                      แนบหลักฐานการชำระเงิน แล้วกดยืนยันเพื่อเปลี่ยนเป็น{" "}
                      <span className="font-semibold text-red-700">
                        {getNextStatusLabel(source, nextStatus)}
                      </span>
                    </>
                  ) : needsTrackingInput ? (
                    <>กรอกเลขพัสดุเพื่อยืนยันการจัดส่ง</>
                  ) : (
                    <>
                      เปลี่ยนไปสถานะถัดไปเป็น{" "}
                      <span className="font-semibold text-red-700">
                        {getNextStatusLabel(source, nextStatus)}
                      </span>{" "}
                      ใช่ไหม?
                    </>
                  )}
                </p>
                {needsPaymentProof && (
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-stone-700">
                      หลักฐานการชำระเงิน *
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                      onChange={onPaymentSlipChange}
                      className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-red-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-red-700"
                    />
                    {paymentSlipPreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={paymentSlipPreview}
                        alt="ตัวอย่างสลิป"
                        className="max-h-48 rounded-xl border border-stone-200 object-contain"
                      />
                    )}
                    {paymentSlip && !paymentSlipPreview && (
                      <p className="text-sm text-stone-600">
                        แนบไฟล์: {paymentSlip.name}
                      </p>
                    )}
                    <p className="text-xs text-stone-500">
                      รองรับ JPG, PNG, WEBP, GIF หรือ PDF ไม่เกิน 8 MB
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-stone-700">
                        เลขอ้างอิง *
                      </label>
                      <input
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="เช่น เลขที่อ้างอิงการโอน / Transaction ID"
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>
                )}
                {needsTrackingInput && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-stone-700">
                      เลขพัสดุ
                    </label>
                    <input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="เช่น TH1234567890"
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                )}
                {error && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleNext()}
                    disabled={loading}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "กำลังบันทึก..." : "ยืนยัน"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
