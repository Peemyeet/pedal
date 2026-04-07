import Image from "next/image";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-3 py-8 sm:px-4 sm:py-10 md:flex-row md:items-center md:justify-between lg:max-w-7xl lg:px-8">
        <div className="max-w-md text-base leading-relaxed text-[var(--foreground)]">
          <p className="text-lg font-semibold">{BRAND.name}</p>
          {BRAND.addressLines.map((line) => (
            <p key={line} className="mt-1 text-[var(--muted)]">
              {line}
            </p>
          ))}
          <p className="mt-3">
            <a
              href={BRAND.telHref}
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {BRAND.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 justify-start md:justify-end">
          <Image
            src="/branding/logo-with-address.png"
            alt={BRAND.name}
            width={320}
            height={120}
            className="h-auto max-h-28 w-full max-w-[280px] rounded-xl object-contain object-left shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]/50 sm:max-h-32 sm:max-w-xs md:object-right"
            priority={false}
          />
        </div>
      </div>
    </footer>
  );
}
