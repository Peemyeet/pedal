/** แปลงจำนวนเงินเป็นตัวอักษรไทย (บาทถ้วน) */
export function bahtToThaiText(amount: number): string {
  const baht = Math.floor(amount);
  const satang = Math.round((amount - baht) * 100);

  if (baht === 0 && satang === 0) return "ศูนย์บาทถ้วน";

  let text = `${numberToThai(baht)}บาท`;
  if (satang > 0) {
    text += numberToThai(satang) + "สตางค์";
  } else {
    text += "ถ้วน";
  }
  return text;
}

function numberToThai(num: number): string {
  if (num === 0) return "";

  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const parts: string[] = [];
  let n = num;
  let segment = 0;

  while (n > 0) {
    const chunk = n % 1_000_000;
    if (chunk > 0) {
      parts.unshift(readChunk(chunk, digits, positions));
      if (segment > 0) parts[0] = "ล้าน" + parts[0];
    }
    n = Math.floor(n / 1_000_000);
    segment++;
  }

  return parts.join("");
}

function readChunk(
  num: number,
  digits: string[],
  positions: string[]
): string {
  if (num === 0) return "";

  let result = "";
  const str = num.toString().padStart(6, "0");

  for (let i = 0; i < str.length; i++) {
    const digit = Number(str[i]);
    const pos = str.length - i - 1;

    if (digit === 0) continue;

    if (pos === 1 && digit === 1) {
      result += "สิบ";
    } else if (pos === 1 && digit === 2) {
      result += "ยี่สิบ";
    } else if (pos === 0 && digit === 1 && str.length > 1 && str[i - 1] !== "0") {
      result += "เอ็ด";
    } else {
      result += digits[digit] + positions[pos];
    }
  }

  return result;
}
