"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="app-btn-secondary w-full sm:w-auto"
    >
      พิมพ์ / บันทึกเป็น PDF
    </button>
  );
}
