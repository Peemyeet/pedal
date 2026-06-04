import { heatLabel } from "@/lib/utils";

export function HeatBadge({ level }: { level: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-800">
      <span>ความเผ็ด</span>
      <span aria-label={`${level} จาก 5`}>{heatLabel(level)}</span>
    </div>
  );
}
