import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AddToCartButton } from "./AddToCartButton";

export const dynamic = "force-dynamic";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

export default async function ShopPage() {
  const session = await auth();
  const products = await prisma.product.findMany({
    where: { active: true, stock: { gte: 0 } },
    orderBy: [{ sku: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      sku: true,
      stock: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-title">
          {session?.user?.username ? `สวัสดี ${session.user.username}` : "ร้านค้า"}
        </h1>
        <p className="app-page-lead mt-2 max-w-2xl text-base sm:text-lg">
          เลือกสินค้าใส่ตะกร้า จากนั้นไปที่ <strong>ตะกร้า</strong> แล้วกด
          นำรายการไปสร้างใบเสนอราคา
        </p>
      </div>

      {products.length === 0 ? (
        <p className="app-card border-amber-200/80 bg-amber-50/90 px-5 py-4 text-base text-amber-950">
          ยังไม่มีสินค้าในหน้าร้าน — ไปที่ <strong>คลังสินค้า</strong> เพื่อเพิ่มและเปิดใช้งานสินค้า
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const cartProduct = {
              id: p.id,
              name: p.name,
              price: p.price,
              sku: p.sku,
              stock: p.stock,
            };
            return (
              <li
                key={p.id}
                className="app-card flex flex-col p-4 sm:p-5"
              >
                <h2 className="text-lg font-bold leading-snug">
                  {p.sku ? <span className="text-[var(--muted)]">[{p.sku}] </span> : null}
                  {p.name}
                </h2>
                {p.description ? (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                    {p.description}
                  </p>
                ) : (
                  <p className="mt-2 flex-1 text-sm text-[var(--muted)]" aria-hidden>
                    &nbsp;
                  </p>
                )}
                <div className="mt-4 space-y-1">
                  <p className="text-base font-semibold sm:text-lg">
                    {formatThb(p.price)} บาท
                  </p>
                  <p className="text-sm text-[var(--muted)]">คงเหลือ {p.stock} ชิ้น</p>
                </div>
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <AddToCartButton product={cartProduct} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
