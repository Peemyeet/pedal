"use client";

import { useEffect, useState } from "react";
import { LoadingDots } from "./LoadingDots";

type Customer = {
  id: string;
  shopName: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  taxId: string | null;
  notes: string | null;
};

const emptyForm = {
  shopName: "",
  customerName: "",
  phone: "",
  email: "",
  address: "",
  taxId: "",
  notes: "",
};

export function B2BCustomerManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEntered, setConfirmEntered] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successEntered, setSuccessEntered] = useState(false);

  useEffect(() => {
    if (!confirmOpen) {
      setConfirmEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setConfirmEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [confirmOpen]);

  useEffect(() => {
    if (!successOpen) {
      setSuccessEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSuccessEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [successOpen]);

  function closeConfirm() {
    setConfirmEntered(false);
    window.setTimeout(() => setConfirmOpen(false), 180);
  }

  function closeSuccess(onDone?: () => void) {
    setSuccessEntered(false);
    window.setTimeout(() => {
      setSuccessOpen(false);
      onDone?.();
    }, 180);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      shopName: customer.shopName ?? "",
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email ?? "",
      address: customer.address,
      taxId: customer.taxId ?? "",
      notes: customer.notes ?? "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setConfirmOpen(true);
      return;
    }
    await saveCustomer();
  }

  async function saveCustomer() {
    setLoading(true);
    setError("");

    const url = editingId ? `/api/admin/customers/${editingId}` : "/api/admin/customers";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    if (editingId) {
      setCustomers((prev) => prev.map((c) => (c.id === editingId ? data : c)));
      setConfirmEntered(false);
      window.setTimeout(() => {
        setConfirmOpen(false);
        setSuccessOpen(true);
        window.setTimeout(() => {
          closeSuccess(resetForm);
        }, 900);
      }, 180);
      return;
    }

    setCustomers((prev) => [data, ...prev]);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบลูกค้านี้?")) return;
    const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <form onSubmit={(e) => void handleSubmit(e)} className="rounded-xl bg-white p-4 ring-1 ring-stone-200 lg:col-span-2">
        <h2 className="text-sm font-semibold">{editingId ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า B2B"}</h2>
        <div className="mt-3 space-y-2">
          <Input label="ชื่อร้าน" value={form.shopName} onChange={(v) => setForm({ ...form, shopName: v })} />
          <Input label="ชื่อผู้ติดต่อ *" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
          <Input label="โทร *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="อีเมล" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div>
            <label className="block text-xs font-medium text-stone-600">ที่อยู่ *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="mt-0.5 w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm"
            />
          </div>
          <Input label="เลขภาษี" value={form.taxId} onChange={(v) => setForm({ ...form, taxId: v })} />
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? <LoadingDots /> : editingId ? "บันทึก" : "เพิ่มลูกค้า"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs">
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-3">
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-3 py-2">ร้าน / ลูกค้า</th>
                <th className="px-3 py-2">โทร</th>
                <th className="px-3 py-2 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-stone-500">
                    ยังไม่มีลูกค้า B2B
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-t border-stone-100">
                    <td className="px-3 py-2">
                      <p className="font-medium">{c.shopName || c.customerName}</p>
                      {c.shopName && <p className="text-[11px] text-stone-500">{c.customerName}</p>}
                    </td>
                    <td className="px-3 py-2">{c.phone}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => startEdit(c)} className="text-red-600 hover:underline">
                        แก้ไข
                      </button>
                      <button type="button" onClick={() => void handleDelete(c.id)} className="ml-3 text-stone-500 hover:underline">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
            confirmEntered ? "bg-black/45" : "bg-black/0"
          }`}
          style={{
            animation: confirmEntered
              ? "modal-backdrop-in 0.22s ease-out"
              : "modal-backdrop-out 0.2s ease-in forwards",
          }}
          onClick={() => !loading && closeConfirm()}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-confirm-title"
            className="w-full max-w-[17rem] rounded-xl bg-white p-4 shadow-2xl ring-1 ring-stone-200/80"
            style={{
              animation: confirmEntered
                ? "modal-panel-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
                : "modal-panel-out 0.2s ease-in forwards",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="customer-confirm-title" className="text-base font-semibold text-stone-900">
              Are you sure?
            </h3>
            <p className="mt-1.5 text-xs text-stone-600">ยืนยันการบันทึกการแก้ไขข้อมูลลูกค้านี้</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void saveCustomer()}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? <LoadingDots /> : "ยืนยัน"}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm()}
                disabled={loading}
                className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
            successEntered ? "bg-black/45" : "bg-black/0"
          }`}
          style={{
            animation: successEntered
              ? "modal-backdrop-in 0.22s ease-out"
              : "modal-backdrop-out 0.2s ease-in forwards",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-success-title"
            className="w-full max-w-[17rem] rounded-xl bg-white p-4 text-center shadow-2xl ring-1 ring-stone-200/80"
            style={{
              animation: successEntered
                ? "modal-panel-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
                : "modal-panel-out 0.2s ease-in forwards",
            }}
          >
            <div
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100"
              style={{ animation: "success-circle-pop 0.35s ease-out" }}
            >
              <svg
                className="h-6 w-6 text-emerald-600"
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
            <p
              id="customer-success-title"
              className="mt-3 text-base font-semibold text-stone-900"
              style={{ animation: "success-text-in 0.3s ease-out 0.18s both" }}
            >
              แก้ไขสำเร็จ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm"
      />
    </div>
  );
}

export type B2BCustomerOption = Customer;
