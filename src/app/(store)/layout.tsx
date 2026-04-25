import { Footer } from "@/components/Footer";
import { StoreNav } from "@/components/StoreNav";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `${BRAND.shortName} — ร้านออนไลน์`,
  description: `${BRAND.name} — เลือกสินค้า สั่งซื้อ ชำระเงินออนไลน์`,
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="app-store-scene print:hidden" aria-hidden>
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-amber-100/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-slate-200/20 blur-3xl" />
      </div>
      <StoreNav />
      <main className="relative z-0 flex-1 px-3 py-6 sm:px-6 sm:py-8 md:py-10 lg:px-8">
        <div className="mx-auto w-full min-w-0 max-w-6xl lg:max-w-7xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
