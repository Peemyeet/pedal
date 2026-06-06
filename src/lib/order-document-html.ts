import { DEFAULT_SHOP_SETTINGS, type ShopSettingsData } from "@/lib/shop-settings";
import {
  calculateShippingFee,
  calculateTotalWeightKg,
} from "@/lib/shipping";
import { bahtToThaiText } from "@/lib/thai-baht-text";

export type OrderDocumentItem = {
  id: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
};

export type OrderDocumentPayload = {
  id: string;
  orderNumber: string;
  source: "WEBSITE" | "WHOLESALE";
  shopName: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  notes?: string | null;
  total: number;
  shippingFee?: number;
  createdAt: string;
  items: OrderDocumentItem[];
  shopSettings?: ShopSettingsData;
};

export type OrderDocumentType = "receipt" | "quotation";

const QUOTATION_TABLE_ROWS = 5;

type DocumentTemplateConfig = {
  pageTitle: string;
  titleTh: string;
  titleEn: string;
  numberPrefix: "QT" | "RC";
  getIssuedAt: (data: OrderDocumentPayload) => Date;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBahtAmount(baht: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(baht);
}

function formatQuotationDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** ราคารวม VAT IN — แยกยอดก่อน VAT กับส่วน VAT 7% ที่อยู่ในราคา (ไม่บวกเพิ่ม) */
function splitVatInclusive(total: number) {
  const grandTotal = total;
  const vat = Math.round((grandTotal * 7) / 107 * 100) / 100;
  const subtotalExVat = Math.round((grandTotal - vat) * 100) / 100;
  return { subtotalExVat, vat, grandTotal };
}

function resolveDocumentAmounts(data: OrderDocumentPayload) {
  const productSubtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtOrder,
    0
  );
  const totalWeightKg = calculateTotalWeightKg(
    data.items.map((item) => ({ quantity: item.quantity }))
  );

  let shippingFee = data.shippingFee ?? 0;
  if (shippingFee <= 0) {
    shippingFee = calculateShippingFee(
      data.items.map((item) => ({ quantity: item.quantity }))
    );
  }

  const computedGrand = productSubtotal + shippingFee;
  let grandTotal = computedGrand;
  if (data.total > computedGrand) {
    grandTotal = data.total;
    if (shippingFee <= 0 && data.total > productSubtotal) {
      shippingFee = data.total - productSubtotal;
    }
  }

  const discount = 0;
  const totalAfterDiscount = grandTotal - discount;
  const { subtotalExVat, vat } = splitVatInclusive(totalAfterDiscount);

  return {
    productSubtotal,
    totalWeightKg,
    shippingFee,
    discount,
    subtotalExVat,
    vat,
    grandTotal: totalAfterDiscount,
  };
}

function buildStyledOrderDocumentHtml(
  data: OrderDocumentPayload,
  shop: ShopSettingsData,
  config: DocumentTemplateConfig
) {
  const issuedAt = config.getIssuedAt(data);
  const documentNumber = `${config.numberPrefix}-${data.orderNumber}`;
  const customerName = data.shopName?.trim() || data.customerName;
  const contactPerson = data.customerName;
  const companyPhone = shop.phones[0] ?? "";
  const {
    totalWeightKg,
    shippingFee,
    discount,
    subtotalExVat,
    vat,
    grandTotal,
  } = resolveDocumentAmounts(data);

  const itemRows = data.items.map((item, index) => {
    const lineTotal = item.quantity * item.priceAtOrder;
    return `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(item.productName)}</td>
        <td class="center">${item.quantity}</td>
        <td class="amount">${escapeHtml(formatBahtAmount(item.priceAtOrder))}</td>
        <td class="amount">${escapeHtml(formatBahtAmount(lineTotal))}</td>
      </tr>
    `;
  });

  const shippingRow =
    shippingFee > 0
      ? `
      <tr>
        <td class="center">${data.items.length + 1}</td>
        <td>ค่าจัดส่ง (${totalWeightKg} กก.) <span class="qt-muted">/ Shipping</span></td>
        <td class="center">—</td>
        <td class="amount">—</td>
        <td class="amount">${escapeHtml(formatBahtAmount(shippingFee))}</td>
      </tr>
    `
      : "";

  const lineCount = data.items.length + (shippingFee > 0 ? 1 : 0);
  const emptyRows = Array.from(
    { length: Math.max(0, QUOTATION_TABLE_ROWS - lineCount) },
    (_, i) => {
      const rowNo = lineCount + i + 1;
      return `<tr class="empty-row"><td class="center">${rowNo}</td><td></td><td></td><td></td><td></td></tr>`;
    }
  ).join("");

  const remark = data.notes?.trim()
    ? escapeHtml(data.notes.trim())
    : shop.quotationNote?.trim()
      ? escapeHtml(shop.quotationNote.trim())
      : "—";

  return documentShell(
    `${config.pageTitle} ${escapeHtml(data.orderNumber)}`,
    quotationStyles(),
    `
    <div class="qt-accent"></div>

    <div class="qt-top">
      <div class="qt-header-row">
        <div class="qt-brand">
          <div class="qt-logo">
            <span class="qt-logo-text">${escapeHtml(shop.shortName.slice(0, 2))}</span>
          </div>
          <div class="qt-company">
            <div class="qt-company-name">${escapeHtml(shop.shortName)}</div>
            <div class="qt-company-line">${escapeHtml(shop.address)}</div>
            <div class="qt-company-line qt-muted">${escapeHtml(shop.addressEn)}</div>
            <div class="qt-company-line">โทร. ${escapeHtml(companyPhone)}</div>
          </div>
        </div>
        <div class="qt-page">หน้า 1 / 1</div>
      </div>

      <div class="qt-hero-row">
        <div class="qt-hero">
          <h1 class="qt-title">${escapeHtml(config.titleTh)}</h1>
          <p class="qt-title-en">${escapeHtml(config.titleEn)}</p>
        </div>
        <div class="qt-meta-card">
          <div class="qt-meta-item"><span class="qt-meta-k">No.</span><span class="qt-meta-v">${escapeHtml(documentNumber)}</span></div>
          <div class="qt-meta-item"><span class="qt-meta-k">Date</span><span class="qt-meta-v">${escapeHtml(formatQuotationDate(issuedAt))}</span></div>
          <div class="qt-meta-item"><span class="qt-meta-k">ชื่อผู้ติดต่อ</span><span class="qt-meta-v">${escapeHtml(contactPerson)}</span></div>
        </div>
      </div>
    </div>

    <div class="qt-customer-box">
      <div class="qt-customer-left">
        <div class="qt-section-label">ข้อมูลลูกค้า / Customer</div>
        <div class="field"><span class="k">ลูกค้า</span> ${escapeHtml(customerName)}</div>
        <div class="field"><span class="k">ที่อยู่</span> ${escapeHtml(data.address)}</div>
        <div class="field"><span class="k">โทรศัพท์</span> ${escapeHtml(data.phone)}</div>
        <div class="field qt-muted"><span class="k">แฟกซ์</span> —</div>
        <div class="field qt-muted"><span class="k">เลขประจำตัวผู้เสียภาษี</span> —</div>
      </div>
      <div class="qt-customer-right">
        <div class="qt-section-label">ฝ่ายขาย / Sales</div>
        <div class="field qt-muted"><span class="k">Salesperson</span> —</div>
        <div class="field"><span class="k">Sale's Phone</span> ${escapeHtml(companyPhone)}</div>
      </div>
    </div>

    <table class="qt-items">
      <thead>
        <tr>
          <th>No.<span>ลำดับ</span></th>
          <th>Description<span>รายการ</span></th>
          <th>Qty<span>จำนวน</span></th>
          <th>Unit Price<span>ราคา/หน่วย</span></th>
          <th>Total<span>จำนวนเงิน</span></th>
        </tr>
      </thead>
      <tbody>${itemRows.join("")}${shippingRow}${emptyRows}</tbody>
    </table>

    <div class="qt-footer">
      <div class="qt-remark">
        <div class="qt-remark-head">
          <span>Remark</span>
          <span class="qt-muted">หมายเหตุ</span>
        </div>
        <div class="qt-remark-body">${remark}</div>
      </div>
      <div class="qt-summary-wrap">
        <table class="qt-summary">
          <tr><td>รวมเงิน / Total</td><td>${escapeHtml(formatBahtAmount(subtotalExVat))}</td></tr>
          <tr><td>ส่วนลด / Discount</td><td>${escapeHtml(formatBahtAmount(discount))}</td></tr>
          <tr><td>ราคารวมส่วนลด / Total-Discount</td><td>${escapeHtml(formatBahtAmount(subtotalExVat - discount))}</td></tr>
          <tr class="vat-row"><td>ภาษีมูลค่าเพิ่ม / VAT <em>(7% VAT IN)</em></td><td>${escapeHtml(formatBahtAmount(vat))}</td></tr>
          <tr class="grand-row"><td>เงินรวมทั้งสิ้น / Grand Total</td><td>${escapeHtml(formatBahtAmount(grandTotal))}</td></tr>
        </table>
      </div>
    </div>

    <div class="qt-words">
      <span class="qt-words-label">เงินรวมทั้งสิ้น (Grand Total)</span>
      <span class="qt-words-value">${escapeHtml(bahtToThaiText(grandTotal))}</span>
    </div>`
  );
}

function buildReceiptHtml(data: OrderDocumentPayload, shop: ShopSettingsData) {
  return buildStyledOrderDocumentHtml(data, shop, {
    pageTitle: "ใบเสร็จรับเงิน",
    titleTh: "ใบเสร็จรับเงิน",
    titleEn: "RECEIPT",
    numberPrefix: "RC",
    getIssuedAt: () => new Date(),
  });
}

export function buildQuotationHtml(data: OrderDocumentPayload, shop: ShopSettingsData) {
  return buildStyledOrderDocumentHtml(data, shop, {
    pageTitle: "ใบเสนอราคา",
    titleTh: "ใบเสนอราคา",
    titleEn: "QUOTATION",
    numberPrefix: "QT",
    getIssuedAt: (payload) => new Date(payload.createdAt),
  });
}

export function buildOrderDocumentHtml(
  data: OrderDocumentPayload,
  type: OrderDocumentType
) {
  const shop = data.shopSettings ?? DEFAULT_SHOP_SETTINGS;
  if (type === "quotation") return buildQuotationHtml(data, shop);
  return buildReceiptHtml(data, shop);
}

function documentShell(title: string, styles: string, body: string) {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>${styles}</style>
</head>
<body>
  <div class="actions">
    <button class="btn btn-secondary" onclick="window.close()">ปิดหน้าต่าง</button>
    <button class="btn btn-primary" onclick="window.print()">พิมพ์ / Save PDF</button>
  </div>
  <div class="sheet">${body}</div>
  <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`;
}

function sharedStyles() {
  return `
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: "Sarabun", "TH Sarabun New", sans-serif;
      color: #1c1917;
      background: #f5f5f4;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
    }
    .actions { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; max-width: 210mm; margin-left: auto; margin-right: auto; }
    .btn { border: 0; border-radius: 8px; padding: 9px 16px; cursor: pointer; font-weight: 600; font-size: 13px; font-family: inherit; }
    .btn-primary { background: #dc2626; color: #fff; }
    .btn-secondary { background: #78716c; color: #fff; }
    .sheet {
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
      position: relative;
    }
    @media print {
      .actions { display: none; }
      body { padding: 0; background: #fff; }
      .sheet { box-shadow: none; border-radius: 0; }
    }
  `;
}

function quotationStyles() {
  return `${sharedStyles()}
    .qt-accent { height: 5px; background: linear-gradient(90deg, #dc2626 0%, #ea580c 100%); }
    .qt-top { padding: 20px 24px 16px; border-bottom: 1px solid #e7e5e4; }
    .qt-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .qt-brand { display: flex; gap: 14px; align-items: center; }
    .qt-logo {
      width: 72px; height: 72px; flex-shrink: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
      border: 2px solid #fecaca;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(220,38,38,.12);
    }
    .qt-logo-text { font-size: 24px; font-weight: 800; color: #dc2626; letter-spacing: -0.5px; }
    .qt-company-name { font-size: 20px; font-weight: 800; color: #1c1917; margin-bottom: 4px; letter-spacing: -0.2px; }
    .qt-company-line { font-size: 12.5px; line-height: 1.55; color: #44403c; }
    .qt-muted { color: #78716c !important; }
    .qt-page { font-size: 11px; color: #a8a29e; white-space: nowrap; padding-top: 4px; }

    .qt-hero-row {
      display: flex; justify-content: space-between; align-items: flex-end;
      gap: 20px; margin-top: 18px;
    }
    .qt-hero { flex: 1; }
    .qt-title { margin: 0; font-size: 26px; font-weight: 800; color: #1c1917; letter-spacing: 0.3px; }
    .qt-title-en {
      margin: 4px 0 0; font-size: 13px; font-weight: 700; color: #dc2626;
      letter-spacing: 2px; text-transform: uppercase;
    }
    .qt-meta-card {
      background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px;
      padding: 10px 14px; min-width: 240px;
    }
    .qt-meta-item { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; line-height: 1.8; }
    .qt-meta-k { color: #78716c; font-weight: 600; white-space: nowrap; }
    .qt-meta-v { color: #1c1917; font-weight: 700; text-align: right; }

    .qt-customer-box {
      margin: 16px 24px 0;
      display: grid; grid-template-columns: 1fr 200px; gap: 0;
      background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; overflow: hidden;
    }
    .qt-customer-left { padding: 14px 16px; border-right: 1px solid #e7e5e4; }
    .qt-customer-right { padding: 14px 16px; background: #f5f5f4; }
    .qt-section-label {
      font-size: 10px; font-weight: 700; color: #dc2626;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }
    .qt-customer-box .field { font-size: 12.5px; line-height: 1.65; margin-bottom: 3px; color: #292524; }
    .qt-customer-box .k { font-weight: 700; color: #57534e; margin-right: 4px; }

    table.qt-items {
      width: calc(100% - 48px); margin: 16px 24px 0;
      border-collapse: separate; border-spacing: 0;
      font-size: 12.5px; border: 1px solid #e7e5e4; border-radius: 10px; overflow: hidden;
    }
    table.qt-items thead tr { background: linear-gradient(180deg, #fef2f2 0%, #fff1f2 100%); }
    table.qt-items th {
      padding: 10px 10px; text-align: center; font-weight: 700; color: #991b1b;
      border-bottom: 2px solid #fecaca; font-size: 12px;
    }
    table.qt-items th span { display: block; font-weight: 500; font-size: 10px; color: #78716c; margin-top: 1px; }
    table.qt-items td { padding: 8px 10px; border-bottom: 1px solid #f5f5f4; vertical-align: middle; color: #292524; }
    table.qt-items tbody tr:last-child td { border-bottom: none; }
    table.qt-items tbody tr:nth-child(even) td { background: #fafaf9; }
    table.qt-items tbody tr.empty-row td { color: #d6d3d1; }
    table.qt-items .center { text-align: center; width: 44px; color: #78716c; font-weight: 600; }
    table.qt-items .amount { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    table.qt-items td:nth-child(3) { text-align: center; width: 56px; }
    table.qt-items td:nth-child(2) { font-weight: 500; }

    .qt-footer {
      display: grid; grid-template-columns: 1fr 270px; gap: 12px;
      margin: 16px 24px 0; align-items: stretch;
    }
    .qt-remark {
      border: 1px solid #e7e5e4; border-radius: 10px; padding: 12px 14px;
      background: #fafaf9; min-height: 130px;
    }
    .qt-remark-head { display: flex; gap: 8px; align-items: baseline; margin-bottom: 8px; }
    .qt-remark-head span:first-child { font-weight: 700; font-size: 12px; color: #44403c; }
    .qt-remark-head .qt-muted { font-size: 11px; }
    .qt-remark-body { font-size: 12.5px; color: #57534e; min-height: 60px; white-space: pre-wrap; line-height: 1.55; }

    .qt-summary-wrap { border: 1px solid #e7e5e4; border-radius: 10px; overflow: hidden; }
    table.qt-summary { width: 100%; border-collapse: collapse; font-size: 12px; }
    table.qt-summary td { padding: 7px 12px; border-bottom: 1px solid #f5f5f4; color: #44403c; }
    table.qt-summary td:last-child { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; color: #1c1917; white-space: nowrap; }
    table.qt-summary tr.vat-row td { background: #fffbeb; }
    table.qt-summary tr.vat-row em { font-style: normal; font-size: 10px; color: #78716c; }
    table.qt-summary tr.grand-row td {
      background: linear-gradient(90deg, #fef2f2, #fff7ed);
      font-weight: 800; font-size: 13px; color: #991b1b; border-bottom: none;
    }
    table.qt-summary tr.grand-row td:last-child { font-size: 14px; color: #dc2626; }

    .qt-words {
      margin: 12px 24px 20px;
      padding: 12px 16px;
      background: linear-gradient(90deg, #fef2f2 0%, #fff7ed 100%);
      border: 1px solid #fecaca; border-radius: 10px;
      display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline;
    }
    .qt-words-label { font-size: 12px; font-weight: 700; color: #78716c; }
    .qt-words-value { font-size: 13px; font-weight: 800; color: #991b1b; }
  `;
}
