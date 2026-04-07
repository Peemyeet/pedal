"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createAndQuoteQuotation } from "@/app/quotations/actions";
import { BahtTextBelow } from "@/components/BahtTextBelow";
import { shippingFeeForUnitQuantity } from "@/lib/shipping-tiers";

type Product = { id: string; name: string; price: number; sku: string | null; stock: number };

type CustomerRow = {
  id: string;
  category: string;
  customerCode: string;
  name: string | null;
  address: string | null;
  orderNote: string | null;
  lastPurchaseNote: string | null;
};

type LineRow = {
  productId: string;
  quantity: number;
  lineShipping: number;
  unitPrice: number;
};

function lineDefaults(
  product: Product | undefined,
  quantity: number,
): Pick<LineRow, "unitPrice" | "lineShipping"> {
  const ship = shippingFeeForUnitQuantity(quantity);
  if (!product) {
    return { unitPrice: 0, lineShipping: ship };
  }
  return { unitPrice: product.price, lineShipping: ship };
}

export function NewQuotationForm({
  products,
  customers,
}: {
  products: Product[];
  customers: CustomerRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [customerId, setCustomerId] = useState<string>("");
  const [lines, setLines] = useState<LineRow[]>(() => {
    const p0 = products[0];
    if (!p0) return [];
    const d = lineDefaults(p0, 1);
    return [{ productId: p0.id, quantity: 1, ...d }];
  });

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId],
  );

  function addLine() {
    const p = products[0];
    if (!p) return;
    const d = lineDefaults(p, 1);
    setLines((prev) => [
      ...prev,
      { productId: p.id, quantity: 1, ...d },
    ]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<LineRow>) {
    setLines((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        if ("quantity" in patch) {
          next.lineShipping = shippingFeeForUnitQuantity(next.quantity);
        }
        return next;
      }),
    );
  }

  function onProductChange(index: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    setLines((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const d = lineDefaults(p, row.quantity);
        return {
          ...row,
          productId,
          unitPrice: d.unitPrice,
          lineShipping: d.lineShipping,
        };
      }),
    );
  }

  const { subtotal, shippingSum, grandTotal } = useMemo(() => {
    let sub = 0;
    for (const row of lines) {
      const up = Number.isFinite(row.unitPrice) ? Math.max(0, row.unitPrice) : 0;
      sub += up * row.quantity;
    }
    const ship = lines.reduce((s, r) => s + shippingFeeForUnitQuantity(r.quantity), 0);
    return { subtotal: sub, shippingSum: ship, grandTotal: sub + ship };
  }, [lines]);

  function goReview() {
    setError(null);
    if (customers.length > 0 && !customerId) {
      setError("กรุณาเลือกข้อมูลลูกค้า");
      return;
    }
    setStep("review");
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createAndQuoteQuotation({
        customerId: customerId || null,
        lines: lines.map((r) => ({
          productId: r.productId,
          quantity: r.quantity,
          shippingFee: shippingFeeForUnitQuantity(r.quantity),
          unitPrice: Number.isFinite(r.unitPrice) ? Math.max(0, r.unitPrice) : 0,
        })),
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.push("/quotations/quoted");
      router.refresh();
    });
  }

  if (!products.length) {
    return (
      <p className="app-card border-amber-200/80 bg-amber-50/90 px-5 py-4 text-base text-amber-950">
        ยังไม่มีรายการในคลัง — ไปที่เมนู <strong>คลังสินค้า</strong> เพื่อเพิ่มรายการก่อน
      </p>
    );
  }

  if (step === "review") {
    return (
      <div className="space-y-8">
        <section className="app-card p-4 sm:p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold">สรุปก่อนส่งใบเสนอราคา</h2>
          <p className="text-base text-[var(--muted)]">
            ตรวจสอบข้อมูลด้านล่าง หากถูกต้องกดยืนยันส่งใบ
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <h3 className="app-label text-[var(--foreground)]">ลูกค้า</h3>
            <p className="mt-2 text-base font-semibold">
              {selectedCustomer ? (
                <>
                  [{selectedCustomer.category}] {selectedCustomer.customerCode}
                  {selectedCustomer.name
                    ? ` · ${selectedCustomer.name.replace(/\s+/g, " ")}`
                    : ""}
                </>
              ) : (
                "ไม่ระบุ"
              )}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              ชื่อ ที่อยู่ ติดต่อ และหมายเหตุจะถูกบันทึกจากข้อมูลลูกค้าในระบบอัตโนมัติ (ไม่แสดงในขั้นตอนแก้ไข)
            </p>
          </div>

          <div className="app-table-shell mt-5">
            <table className="w-full min-w-[560px] text-left text-base">
              <thead className="app-thead">
                <tr>
                  <th className="app-th">สินค้า</th>
                  <th className="app-th">จำนวน</th>
                  <th className="app-th">ราคา/หน่วย</th>
                  <th className="app-th">ค่าจัดส่ง</th>
                  <th className="app-th text-right">รวมแถว</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((row, index) => {
                  const p = products.find((x) => x.id === row.productId);
                  if (!p) return null;
                  const up = Number.isFinite(row.unitPrice) ? Math.max(0, row.unitPrice) : 0;
                  const lineSub = up * row.quantity;
                  const ship = shippingFeeForUnitQuantity(row.quantity);
                  const lineGross = lineSub + ship;
                  return (
                    <tr key={index} className="border-t border-[var(--border)]">
                      <td className="px-2 py-2.5 sm:px-4 sm:py-3">
                        {p.sku ? `[${p.sku}] ` : ""}
                        {p.name}
                      </td>
                      <td className="px-2 py-2.5 tabular-nums sm:px-4 sm:py-3">{row.quantity}</td>
                      <td className="px-2 py-2.5 tabular-nums sm:px-4 sm:py-3">{up.toLocaleString("th-TH")} บาท</td>
                      <td className="px-2 py-2.5 tabular-nums sm:px-4 sm:py-3">{ship.toLocaleString("th-TH")} บาท</td>
                      <td className="px-2 py-2.5 text-right tabular-nums sm:px-4 sm:py-3">
                        {lineGross.toLocaleString("th-TH")} บาท
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 border-t border-[var(--border)] pt-6 text-base">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--muted)]">ยอดสินค้า</span>
              <span className="tabular-nums font-medium">{subtotal.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--muted)]">ค่าขนส่งรวม (ทุกแถว)</span>
              <span className="tabular-nums font-medium">{shippingSum.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4 text-lg font-bold sm:flex-row sm:justify-between sm:gap-4 sm:border-t-0 sm:pt-0">
              <span className="shrink-0">รวมทั้งสิ้น</span>
              <div className="font-normal sm:text-right">
                <span className="block tabular-nums text-xl font-bold">
                  {grandTotal.toLocaleString("th-TH")} บาท
                </span>
                <BahtTextBelow
                  amount={grandTotal}
                  className="mt-2 max-w-md text-sm font-normal leading-relaxed text-[var(--muted)] sm:ml-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => setStep("edit")} className="app-btn-secondary">
            กลับไปแก้ไข
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="app-btn-primary disabled:opacity-60"
          >
            {pending ? "กำลังบันทึก…" : "ยืนยันส่งใบเสนอราคา"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="app-card p-4 sm:p-6 md:p-8">
        <h2 className="mb-5 text-xl font-bold">ข้อมูลลูกค้า</h2>
        {customers.length > 0 ? (
          <div>
            <label className="app-label">เลือกข้อมูลลูกค้า</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-2 min-h-12 w-full max-w-full px-4 text-base sm:max-w-xl"
            >
              <option value="">— เลือกข้อมูลลูกค้า —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.category}] {c.customerCode}
                  {c.name ? ` · ${c.name.replace(/\s+/g, " ").slice(0, 48)}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              ระบบจะบันทึกชื่อ ที่อยู่ ติดต่อ และหมายเหตุจากข้อมูลลูกค้าเมื่อส่งใบ (ไม่แสดงช่องกรอกที่นี่)
            </p>
          </div>
        ) : (
          <p className="text-base text-amber-900">
            ยังไม่มีลูกค้าในระบบ — ไปที่เมนู <strong>ลูกค้า</strong> หรือนำเข้า Excel ก่อน
          </p>
        )}
      </section>

      <section className="app-card p-4 sm:p-6 md:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">รายการสินค้า</h2>
          <button
            type="button"
            onClick={addLine}
            className="app-btn-secondary shrink-0 py-2.5 text-sm font-semibold"
          >
            + เพิ่มแถว
          </button>
        </div>
        <p className="mb-4 rounded-2xl bg-[var(--surface-muted)] p-4 text-sm leading-relaxed text-[var(--muted)]">
          เลือกสินค้าแล้วกำหนดราคาต่อหน่วยในใบได้เอง — ค่าจัดส่งคิดอัตโนมัติตามจำนวนหน่วยต่อแถว: 1=50, 2=80,
          3=100, 4–8=110, 9–10=140, 11–12=160 บาท (เกิน 12 ชิ้นใช้ 160 บาท)
        </p>
        <div className="space-y-4">
          {lines.map((row, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:p-5"
            >
              <div className="min-w-0 w-full sm:min-w-[12rem] sm:flex-1">
                <label className="app-label text-sm">สินค้า</label>
                <select
                  value={row.productId}
                  onChange={(e) => onProductChange(index, e.target.value)}
                  className="mt-2 min-h-12 w-full px-3 text-base"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku ? `[${p.sku}] ` : ""}
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:gap-4">
                <div className="min-w-0 sm:w-28">
                  <label className="app-label text-sm">ราคา/หน่วย</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.unitPrice}
                    onChange={(e) =>
                      updateLine(index, {
                        unitPrice: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="mt-2 min-h-12 w-full px-3 text-base"
                  />
                </div>
                <div className="min-w-0 sm:w-28">
                  <label className="app-label text-sm">จำนวน</label>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) =>
                      updateLine(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="mt-2 min-h-12 w-full px-3 text-base"
                  />
                </div>
              </div>
              <div className="flex w-full flex-wrap items-end justify-between gap-3 border-t border-[var(--border)] pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
                <div className="min-w-0 sm:min-w-[7.5rem]">
                  <label className="app-label text-sm">ค่าจัดส่ง</label>
                  <p className="mt-2 tabular-nums text-base font-semibold sm:mt-3">
                    {shippingFeeForUnitQuantity(row.quantity).toLocaleString("th-TH")} บาท
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[var(--muted)]">ตามจำนวน</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:underline disabled:opacity-40"
                  disabled={lines.length <= 1}
                >
                  ลบแถว
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6 text-base text-[var(--muted)] sm:text-right">
          <p className="leading-relaxed">
            ยอดสินค้า {subtotal.toLocaleString("th-TH")} บาท + ค่าส่งรวม{" "}
            {shippingSum.toLocaleString("th-TH")} บาท
          </p>
          <p className="mt-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            รวม {grandTotal.toLocaleString("th-TH")} บาท
          </p>
          <div className="mx-auto mt-2 max-w-xl sm:ml-auto sm:mr-0">
            <BahtTextBelow
              amount={grandTotal}
              className="text-left text-sm leading-relaxed text-[var(--muted)] sm:text-right"
            />
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
          {error}
        </p>
      ) : null}

      <button type="button" onClick={goReview} className="app-btn-primary">
        ดูสรุปก่อนส่งใบเสนอราคา
      </button>
    </div>
  );
}
