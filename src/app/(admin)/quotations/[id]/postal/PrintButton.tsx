"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="app-btn-secondary print:hidden min-h-11 py-2.5 text-sm font-semibold"
    >
      ยืนยัน
    </button>
  );
}
