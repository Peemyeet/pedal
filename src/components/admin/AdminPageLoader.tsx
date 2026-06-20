export function AdminPageLoader() {
  return (
    <div
      className="flex min-h-[28vh] flex-col items-center justify-center gap-3 py-10"
      role="status"
      aria-live="polite"
      aria-label="กำลังโหลด"
    >
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-red-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-red-600" />
        <div className="absolute inset-[7px] rounded-full bg-red-50" />
      </div>
      <p className="text-xs font-medium tracking-wide text-stone-500 animate-pulse">
        กำลังโหลด...
      </p>
    </div>
  );
}
