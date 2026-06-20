export function LoadingDots({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dotSize = size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <span
      className={`inline-flex items-center justify-center ${gap} ${className ?? ""}`}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`loading-dot rounded-full bg-current ${dotSize}`}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}
