/** แปลงจำนวนเงิน (บาท) เป็นข้อความไทย เช่น 1,234.56 → (หนึ่งพันสองร้อยสามสิบสี่บาห้าสิบหกสตางค์... */

const DIGIT = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];

function readThreeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  let s = "";
  if (h > 0) s += DIGIT[h] + "ร้อย";
  if (t === 1) {
    s += "สิบ";
    if (o === 1) s += "เอ็ด";
    else if (o > 0) s += DIGIT[o];
  } else if (t === 2) {
    s += "ยี่สิบ";
    if (o > 0) s += DIGIT[o];
  } else if (t > 0) {
    s += DIGIT[t] + "สิบ";
    if (o === 1) s += "เอ็ด";
    else if (o > 0) s += DIGIT[o];
  } else if (o > 0) {
    s += DIGIT[o];
  }
  return s;
}

/** อ่าน 0–999,999 (ล้านตัดออกไประดับบน) */
function readUpTo999999(n: number): string {
  if (n <= 0) return "";
  const lak = Math.floor(n / 100000);
  const r1 = n % 100000;
  const tenK = Math.floor(r1 / 10000);
  const r2 = r1 % 10000;
  const oneK = Math.floor(r2 / 1000);
  const r3 = r2 % 1000;
  let s = "";
  if (lak > 0) s += DIGIT[lak] + "แสน";
  if (tenK > 0) s += DIGIT[tenK] + "หมื่น";
  if (oneK > 0) s += DIGIT[oneK] + "พัน";
  if (r3 > 0) s += readThreeDigits(r3);
  return s;
}

export function integerToThaiWords(n: number): string {
  if (n === 0) return "ศูนย์";
  if (n < 0) return "ลบ" + integerToThaiWords(-n);
  const parts: string[] = [];
  let x = n;
  while (x > 0) {
    parts.unshift(readUpTo999999(x % 1000000));
    x = Math.floor(x / 1000000);
  }
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const isLast = i === parts.length - 1;
    if (!isLast) {
      out += (p || "ศูนย์") + "ล้าน";
    } else {
      out += p;
    }
  }
  return out;
}

/** จำนวนเงินจริง (ทศนิยมเป็นสตางค์สูงสุด 2 ตำแหน่ง) */
export function amountToThaiBahtText(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return "จำนวนไม่ถูกต้อง";
  }
  const totalSt = Math.min(Math.round(amount * 100), Number.MAX_SAFE_INTEGER);
  const baht = Math.floor(totalSt / 100);
  const satang = totalSt % 100;
  let text = integerToThaiWords(baht) + "บาท";
  if (satang === 0) {
    text += "ถ้วน";
  } else {
    text += integerToThaiWords(satang) + "สตางค์";
  }
  return text;
}
