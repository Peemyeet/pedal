import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { BRAND } from "@/lib/brand";
import { AdminSessionBar } from "./AdminSessionBar";

export const metadata = {
  title: `หลังบ้าน · ${BRAND.shortName}`,
  description: `${BRAND.name} — คลัง ลูกค้า ใบเสนอราคา`,
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="app-admin-scene" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200/30 via-transparent to-slate-100/40" />
        <div className="absolute -right-1/4 top-0 h-[50vh] w-[70%] max-w-3xl rounded-full bg-slate-300/25 blur-3xl" />
      </div>
      <AdminSessionBar />
      <Nav />
      <main className="relative z-0 flex-1 px-3 py-6 sm:px-6 sm:py-8 md:py-10 lg:px-8">
        <div className="mx-auto w-full min-w-0 max-w-6xl lg:max-w-7xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
