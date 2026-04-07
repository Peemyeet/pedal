"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useState } from "react";

function canvasToMultiPagePdf(canvas: HTMLCanvasElement, fileName: string) {
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}

export function QuotationExportBar({
  quotationNumber,
  printRootId = "quotation-print-root",
}: {
  quotationNumber: number;
  printRootId?: string;
}) {
  const [busy, setBusy] = useState<"jpeg" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baseName = `quotation-${quotationNumber}`;

  async function runCapture() {
    const el = document.getElementById(printRootId);
    if (!el) {
      throw new Error("ไม่พบส่วนเอกสารใบเสนอราคา");
    }
    return html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });
  }

  const toolBtn =
    "app-btn-secondary min-h-11 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 print:hidden";
  const primaryToolBtn =
    "app-btn-primary min-h-11 px-4 py-2.5 text-sm font-semibold print:hidden";

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
      {error ? (
        <p className="max-w-full text-sm font-medium text-red-600 sm:max-w-md sm:text-right">
          {error}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => {
            setError(null);
            window.print();
          }}
          className={toolBtn}
        >
          พิมพ์
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={async () => {
            setError(null);
            setBusy("jpeg");
            try {
              const canvas = await runCapture();
              await new Promise<void>((resolve, reject) => {
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      reject(new Error("สร้างไฟล์ภาพไม่สำเร็จ"));
                      return;
                    }
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${baseName}.jpg`;
                    a.click();
                    URL.revokeObjectURL(url);
                    resolve();
                  },
                  "image/jpeg",
                  0.92,
                );
              });
            } catch (e) {
              setError(e instanceof Error ? e.message : "บันทึก JPEG ไม่สำเร็จ");
            } finally {
              setBusy(null);
            }
          }}
          className={toolBtn}
        >
          {busy === "jpeg" ? "กำลังสร้าง…" : "บันทึก JPEG"}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={async () => {
            setError(null);
            setBusy("pdf");
            try {
              const canvas = await runCapture();
              canvasToMultiPagePdf(canvas, `${baseName}.pdf`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "บันทึก PDF ไม่สำเร็จ");
            } finally {
              setBusy(null);
            }
          }}
          className={primaryToolBtn}
        >
          {busy === "pdf" ? "กำลังสร้าง…" : "บันทึก PDF"}
        </button>
      </div>
    </div>
  );
}
