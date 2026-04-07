import { amountToThaiBahtText } from "@/lib/baht-text";

/** ข้อความจำนวนเงินเป็นคำไทย แสดงใต้ตัวเลข */
export function BahtTextBelow({
  amount,
  className = "mt-1 text-sm leading-relaxed text-[var(--muted)]",
}: {
  amount: number;
  className?: string;
}) {
  return <p className={className}>{amountToThaiBahtText(amount)}</p>;
}
