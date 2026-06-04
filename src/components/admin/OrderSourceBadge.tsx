import { ORDER_SOURCE_LABEL } from "@/lib/utils";

export function OrderSourceBadge({ source }: { source: string }) {
  return (
    <span
      className={
        source === "WHOLESALE"
          ? "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900"
          : "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-900"
      }
    >
      {ORDER_SOURCE_LABEL[source] ?? source}
    </span>
  );
}
