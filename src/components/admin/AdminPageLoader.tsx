export function AdminPageLoader() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
      role="status"
      aria-live="polite"
      aria-label="กำลังโหลด"
    >
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full border-[3px] border-red-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-red-600" />
        <div className="absolute inset-[10px] rounded-full bg-red-50" />
      </div>
      <p className="text-sm font-medium tracking-wide text-stone-500 animate-pulse">
        กำลังโหลด...
      </p>
    </div>
  );
}
