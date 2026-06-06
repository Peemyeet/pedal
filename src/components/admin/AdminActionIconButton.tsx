import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  receipt:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100",
  parcel:
    "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400 hover:bg-sky-100",
  archive:
    "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400 hover:bg-violet-100",
} as const;

export function AdminActionIconButton({
  label,
  onClick,
  disabled,
  loading,
  variant,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: keyof typeof VARIANT_STYLES;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_STYLES[variant]
      )}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}

export function IconReceipt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
    >
      <path d="M9 2.5h6a1 1 0 0 1 1 1v9.5" />
      <path d="M9 13 10 14l1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
      <path d="M10.5 6h3" />
      <path d="M10.5 8.5h3" />
      <path d="M10.5 11h2.2" />
      <path d="M11.2 15.8v2.2" />
      <path d="M9.8 16.9h3" />
    </svg>
  );
}

export function IconParcelSlip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
    >
      <path d="M4 7.5 12 3l8 4.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17V7.5z" />
      <path d="M4 7.5 12 12l8-4.5" />
      <path d="M12 12v8" />
      <rect x="7.5" y="8.5" width="9" height="5.5" rx="0.5" />
      <path d="M8.8 10.2h6.4" />
      <path d="M8.8 12h6.4" />
      <path d="M8.8 13.5h4.2" />
    </svg>
  );
}

export function IconArchive({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
    >
      <rect x="2" y="4" width="20" height="5" rx="1" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  );
}
