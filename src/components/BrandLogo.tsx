import Image from "next/image";
import { LOGO_HEIGHT, LOGO_PATH, LOGO_WIDTH, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  height = 40,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  const width = Math.round((LOGO_WIDTH / LOGO_HEIGHT) * height);

  return (
    <Image
      src={LOGO_PATH}
      alt={BRAND_NAME}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height, width: "auto", maxWidth: width }}
    />
  );
}
