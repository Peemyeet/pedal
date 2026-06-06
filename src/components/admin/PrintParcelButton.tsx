"use client";

import type { ShopSettingsData } from "@/lib/shop-settings-data";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/shop-settings-data";

type ParcelItem = {
  productName: string;
  quantity: number;
};

type PrintParcelButtonProps = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  items: ParcelItem[];
  trackingNumber?: string | null;
  shopName?: string | null;
  updatedAt?: string;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTotalBaht(baht: number) {
  return `${new Intl.NumberFormat("th-TH").format(baht)} บาท`;
}

function formatDeliveryTimestamp(date: Date) {
  return date.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTrackingNumber(trackingNumber?: string | null) {
  const value = trackingNumber?.trim();
  if (!value) return "***-***-**";
  return value;
}

function formatItemsSummary(items: ParcelItem[]) {
  if (items.length === 0) return "-";
  return items.map((item) => `${item.productName} x ${item.quantity}`).join(" • ");
}

function formatReceiverBlock(
  customerName: string,
  shopName: string | null | undefined,
  address: string,
  phone: string
) {
  const nameLine = shopName?.trim()
    ? `${customerName.startsWith("คุณ") ? customerName : `คุณ${customerName}`} ${shopName}`
    : customerName.startsWith("คุณ")
      ? customerName
      : `คุณ${customerName}`;

  return [nameLine, address, `โทร. ${phone}`].join("\n");
}

function parcelSlipHtml(props: PrintParcelButtonProps, shop: ShopSettingsData) {
  const {
    orderNumber,
    customerName,
    phone,
    address,
    total,
    items,
    trackingNumber,
    shopName,
    updatedAt,
  } = props;
  const senderPhone = shop.phones[0] ?? "";
  const senderBlock = [
    shop.shortName,
    shop.address,
    senderPhone ? `โทร. ${senderPhone}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const receiverBlock = formatReceiverBlock(customerName, shopName, address, phone);
  const recordedAt = formatDeliveryTimestamp(
    updatedAt ? new Date(updatedAt) : new Date()
  );

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>ใบจัดส่งไปรษณีย์ ${escapeHtml(orderNumber)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: "Sarabun", "TH Sarabun New", Arial, sans-serif;
      color: #111827;
      background: #fff;
    }
    .sheet {
      max-width: 760px;
      margin: 0 auto;
      border: 1px solid #111827;
      border-radius: 14px;
      overflow: hidden;
      padding: 22px 24px 18px;
    }
    .header {
      text-align: center;
      padding-bottom: 14px;
      border-bottom: 1px solid #cbd5e1;
    }
    .title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .subtitle {
      margin: 6px 0 0;
      font-size: 14px;
      color: #64748b;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 16px;
    }
    .box {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 14px 14px;
      min-height: 170px;
    }
    .box-label {
      font-size: 12px;
      color: #64748b;
      padding-bottom: 8px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .box-content {
      font-size: 14px;
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .box-content::first-line {
      font-weight: 700;
    }
    .parcel-box {
      margin-top: 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 14px 14px;
    }
    .parcel-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 28px;
      margin-top: 10px;
    }
    .field {
      margin-bottom: 12px;
    }
    .field:last-child { margin-bottom: 0; }
    .field-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 3px;
    }
    .field-value {
      font-size: 14px;
      line-height: 1.45;
      word-break: break-word;
    }
    .footer {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    @media print {
      body { padding: 0; }
      .sheet { max-width: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="header">
      <h1 class="title">ใบจัดส่งไปรษณีย์</h1>
      <p class="subtitle">อ้างอิงใบเสนอราคาเลขที่ ${escapeHtml(orderNumber)}</p>
    </header>

    <div class="parties">
      <div class="box">
        <div class="box-label">ผู้ส่ง</div>
        <div class="box-content">${escapeHtml(senderBlock)}</div>
      </div>
      <div class="box">
        <div class="box-label">ผู้รับ</div>
        <div class="box-content">${escapeHtml(receiverBlock)}</div>
      </div>
    </div>

    <div class="parcel-box">
      <div class="box-label">พัสดุ / ขนส่ง</div>
      <div class="parcel-grid">
        <div>
          <div class="field">
            <div class="field-label">เลขพัสดุ / ขนส่ง</div>
            <div class="field-value">${escapeHtml(formatTrackingNumber(trackingNumber))}</div>
          </div>
          <div class="field">
            <div class="field-label">รายการสินค้าในพัสดุ</div>
            <div class="field-value">${escapeHtml(formatItemsSummary(items))}</div>
          </div>
          <div class="field">
            <div class="field-label">ยอดรวม (อ้างอิง)</div>
            <div class="field-value">${escapeHtml(formatTotalBaht(total))}</div>
          </div>
        </div>
        <div>
          <div class="field">
            <div class="field-label">เลขอ้างอิงชำระเงิน</div>
            <div class="field-value">${escapeHtml(orderNumber)}</div>
          </div>
          <div class="field">
            <div class="field-label">บันทึกส่งของ</div>
            <div class="field-value">${escapeHtml(recordedAt)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      ใช้สำหรับนำไปลงทะเบียนหรือติดกับพัสดุที่จุดรับฝากไปรษณีย์
    </div>
  </div>

  <script>
    window.onload = () => setTimeout(() => window.print(), 250);
  </script>
</body>
</html>`;
}

export function PrintParcelButton(props: PrintParcelButtonProps) {
  async function handlePrint() {
    const win = window.open("", "_blank", "width=900,height=820");
    if (!win) return;

    let shop: ShopSettingsData = DEFAULT_SHOP_SETTINGS;
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        shop = (await res.json()) as ShopSettingsData;
      }
    } catch {
      /* use defaults */
    }

    win.document.open();
    win.document.write(parcelSlipHtml(props, shop));
    win.document.close();
  }

  return (
    <button
      type="button"
      onClick={() => void handlePrint()}
      className="inline-flex rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
    >
      ใบปะหน้าพัสดุ
    </button>
  );
}
