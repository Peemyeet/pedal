"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { BahtTextBelow } from "@/components/BahtTextBelow";
import { useCart } from "@/components/CartProvider";
import { createOrderFromLines } from "@/lib/create-order";
import {
  loadLastOrderNumber,
  loadCheckoutAddress,
  saveCheckoutAddress,
  saveLastOrderNumber,
} from "@/lib/cart-storage";
import { BRAND } from "@/lib/brand";
import { useSession } from "next-auth/react";
import { shippingFeeForUnitQuantity } from "@/lib/shipping-tiers";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

export default function CheckoutPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { items, ready, clearCart, subtotal, shippingTotal, grandTotal } = useCart();
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [shipName, setShipName] = useState("");
  const [shipAddr, setShipAddr] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [addressLocked, setAddressLocked] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [docNo, setDocNo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const last = loadLastOrderNumber();
    const next = (last ?? 0) + 1;
    if (next > 0) {
      setDocNo(`pdl${next.toString().padStart(5, "0")}`);
    }
  }, []);

  useEffect(() => {
    const saved = loadCheckoutAddress();
    if (!saved) return;
    setShipName(saved.shippingName);
    setShipAddr(saved.shippingAddress);
    setShipZip(saved.shippingPostalCode);
    setShipPhone(saved.shippingPhone);
    setAddressLocked(true);
  }, []);

  useEffect(() => {
    const n = session?.user?.name?.trim();
    if (n) {
      setShipName((prev) => (prev === "" ? n : prev));
    }
  }, [session?.user?.name]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/login?callbackUrl=/checkout");
    }
  }, [authStatus, router]);

  if (authStatus === "loading" || !ready) {
    return <p className="app-card p-6 text-[var(--muted)]">กำลังโหลด…</p>;
  }
  if (!session) {
    return <p className="app-card p-6">กำลังไปหน้าเข้าสู่ระบบ…</p>;
  }

  const hasOver = items.some((i) => i.quantity > i.stock);
  if (items.length === 0) {
    return (
      <div className="app-card p-6">
        <h1 className="app-page-title">ชำระเงิน</h1>
        <p className="mt-2 text-[var(--muted)]">ยังไม่มีสินค้าใส่ตะกร้า</p>
        <Link href="/shop" className="app-btn-primary mt-4 inline-block">
          ไปเลือกสินค้า
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-8 print:hidden">
      <div>
        <h1 className="app-page-title">ยืนยันคำสั่งซื้อ</h1>
        {docNo ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--accent)]/45 bg-[var(--accent)]/10 px-4 py-2.5">
            <span className="text-sm font-semibold text-[var(--muted)] sm:text-base">เลขที่ใบสั่งซื้อ</span>
            <span className="font-mono text-xl font-bold tracking-wide text-[var(--foreground)] sm:text-2xl">
              {docNo}
            </span>
          </div>
        ) : null}
      </div>

      {hasOver ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
          จำนวนไม่เท่ากับสต็อก กรุณา{" "}
          <Link className="font-semibold text-[var(--accent)]" href="/cart">
            แก้ตะกร้า
          </Link>{" "}
          ก่อน
        </p>
      ) : null}
      <section className="app-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">1) สรุปรายการสินค้า</h2>
        <div className="mt-4 app-table-shell overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-base">
            <thead className="app-thead">
              <tr>
                <th className="app-th">สินค้า</th>
                <th className="app-th w-32">ราคา/หน่วย</th>
                <th className="app-th w-32">จำนวน</th>
                <th className="app-th w-32">ส่ง/แถว</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const lineShip = shippingFeeForUnitQuantity(row.quantity);
                return (
                  <tr key={row.productId} className="border-t border-[var(--border)]">
                    <td className="px-2 py-2.5 sm:px-4">
                      {row.sku ? <span className="text-[var(--muted)]">[{row.sku}] </span> : null}
                      {row.name}
                    </td>
                    <td className="px-2 py-2.5 tabular-nums sm:px-4">{formatThb(row.price)} ฿</td>
                    <td className="px-2 py-2.5 font-medium tabular-nums sm:px-4">{row.quantity}</td>
                    <td className="px-2 py-2.5 tabular-nums sm:px-4">{lineShip} ฿</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2 text-base">
          <div className="flex justify-between gap-4">
            <span className="text-[var(--muted)]">ยอดสินค้า</span>
            <span className="tabular-nums font-medium">{formatThb(subtotal)} บาท</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[var(--muted)]">ค่าส่ง</span>
            <span className="tabular-nums font-medium">{formatThb(shippingTotal)} บาท</span>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="text-right">
            <div className="text-xl font-bold sm:text-2xl">
              รวม {formatThb(grandTotal)} บาท
            </div>
            <BahtTextBelow amount={grandTotal} className="mt-2 text-sm text-[var(--muted)] sm:ml-auto" />
          </div>
        </div>
      </section>

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">2) ข้อมูลผู้รับและที่อยู่จัดส่ง</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="app-label">ชื่อผู้รับ</label>
            <input
              className="mt-2 w-full min-h-12 max-w-2xl px-4 text-base"
              value={shipName}
              onChange={(e) => setShipName(e.target.value)}
              required
              autoComplete="name"
              readOnly={addressLocked}
            />
          </div>
          <div>
            <label className="app-label">ที่อยู่</label>
            <textarea
              className="mt-2 w-full min-h-24 max-w-2xl px-4 py-2 text-base"
              value={shipAddr}
              onChange={(e) => setShipAddr(e.target.value)}
              required
              placeholder="บ้านเลขที่ หมู่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด"
              readOnly={addressLocked}
            />
          </div>
          <div className="grid gap-4 sm:max-w-2xl sm:grid-cols-2">
            <div>
              <label className="app-label">รหัสไปรษณีย์</label>
              <input
                className="mt-2 w-full min-h-12 px-4 text-base"
                value={shipZip}
                onChange={(e) => setShipZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                maxLength={5}
                placeholder="5 หลัก"
                required
                autoComplete="postal-code"
                readOnly={addressLocked}
              />
            </div>
            <div>
              <label className="app-label">โทร (ไม่บังคับ)</label>
              <input
                className="mt-2 w-full min-h-12 px-4 text-base"
                value={shipPhone}
                onChange={(e) => setShipPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
                readOnly={addressLocked}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="app-label">หมายเหตุการชำระ (ถ้ามี — เช่น จะอัปโหลดสลิปต่อ)</label>
          <textarea
            className="mt-2 w-full min-h-24 max-w-2xl px-4 py-2 text-base"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="จะอ้างอิงในขั้นโอนเงิน / แจ้งร้านทีหลัง"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              saveCheckoutAddress({
                shippingName: shipName.trim(),
                shippingAddress: shipAddr.trim(),
                shippingPostalCode: shipZip.trim(),
                shippingPhone: shipPhone.trim(),
              });
              setAddressLocked(true);
              setSaveMsg("บันทึกที่อยู่แล้ว ครั้งถัดไประบบจะเติมให้");
              window.setTimeout(() => setSaveMsg(null), 2500);
            }}
            className="app-btn-secondary"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={() => {
              setAddressLocked(false);
              setSaveMsg("เปิดแก้ไขข้อมูลที่อยู่แล้ว");
              window.setTimeout(() => setSaveMsg(null), 1500);
            }}
            className="app-btn-secondary"
          >
            แก้ไข
          </button>
          {saveMsg ? <p className="text-sm font-medium text-emerald-700">{saveMsg}</p> : null}
        </div>
      </section>

      {err ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/cart" className="app-btn-secondary text-center sm:inline-block">
          กลับตะกร้า
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="app-btn-secondary"
        >
          พิมพ์ข้อมูลใบสั่งซื้อ
        </button>
        <button
          type="button"
          className="app-btn-primary"
          disabled={hasOver || pending}
          onClick={() => {
            if (hasOver) return;
            setErr(null);
            start(async () => {
              const res = await createOrderFromLines(
                items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                {
                  paymentNote: note,
                  shippingName: shipName,
                  shippingAddress: shipAddr,
                  shippingPostalCode: shipZip,
                  shippingPhone: shipPhone || null,
                },
              );
              if ("error" in res) {
                setErr(res.error ?? "ไม่สามารถยืนยันคำสั่ง");
                return;
              }
              saveLastOrderNumber(res.orderNumber);
              clearCart();
              router.push(`/account/orders/${res.orderId}/pay?new=1`);
            });
          }}
        >
          {pending ? "กำลังบันทึก…" : "ไปชำระเงิน"}
        </button>
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        หมายเหตุ: โอนเงินและอัปโหลดหลักฐาน แจ้งยอดตามที่ร้านกำหนด — แอดมินสามารถยืนยันต่อในเมนู{" "}
        <span className="text-[var(--foreground)]">ออเดอร์เว็บ</span> ได้
      </p>
    </div>

    <section className="hidden print:block">
      <div className="app-card space-y-6 p-6 text-slate-900 print:rounded-none print:border-0 print:shadow-none">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">ใบเสนอราคา</h1>
          <p className="mt-2 text-base text-slate-600">
            สร้างเมื่อ {new Date().toLocaleString("th-TH")}
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-2xl font-bold">ข้อมูลลูกค้า</h2>
          <dl className="grid gap-3 text-lg sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">ชื่อ (ในใบ)</dt>
              <dd>{shipName || session.user?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">ติดต่อ</dt>
              <dd>{shipPhone || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">หมายเหตุ</dt>
              <dd className="whitespace-pre-wrap">
                {shipAddr
                  ? `${shipAddr}${shipZip ? ` รหัสไปรษณีย์ ${shipZip}` : ""}`
                  : "—"}
              </dd>
            </div>
            {note ? (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">หมายเหตุเพิ่มเติม</dt>
                <dd className="whitespace-pre-wrap">{note}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--border)]">
          <h2 className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4 text-xl font-bold">
            รายการสินค้า
          </h2>
          <table className="w-full text-left text-base">
            <thead className="app-thead bg-white">
              <tr>
                <th className="app-th">รหัส</th>
                <th className="app-th">สินค้า</th>
                <th className="app-th">จำนวน</th>
                <th className="app-th">ราคา/หน่วย</th>
                <th className="app-th">ค่าส่ง</th>
                <th className="app-th text-right">รวมแถว</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const lineShip = shippingFeeForUnitQuantity(row.quantity);
                const lineTotal = row.price * row.quantity + lineShip;
                return (
                  <tr key={row.productId} className="border-t border-[var(--border)]">
                    <td className="px-6 py-3 font-mono text-sm">{row.sku ?? "—"}</td>
                    <td className="px-6 py-3 font-medium">{row.name}</td>
                    <td className="px-6 py-3 tabular-nums">{row.quantity}</td>
                    <td className="px-6 py-3 tabular-nums">{formatThb(row.price)} บาท</td>
                    <td className="px-6 py-3 tabular-nums">{formatThb(lineShip)} บาท</td>
                    <td className="px-6 py-3 text-right tabular-nums">{formatThb(lineTotal)} บาท</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-[var(--border)] bg-[var(--surface-muted)]/50 px-6 py-5 text-lg">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">ยอดสินค้า</span>
              <span className="tabular-nums">{formatThb(subtotal)} บาท</span>
            </div>
            <div className="mt-3 flex justify-between gap-4">
              <span className="text-slate-600">ค่าส่งรวม</span>
              <span className="tabular-nums">{formatThb(shippingTotal)} บาท</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-[var(--border)] pt-4">
              <span className="text-2xl font-bold">รวมทั้งสิ้น</span>
              <div className="text-right">
                <span className="block text-4xl font-bold tabular-nums">{formatThb(grandTotal)} บาท</span>
                <BahtTextBelow amount={grandTotal} className="mt-1 text-sm text-slate-600" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
    </>
  );
}
