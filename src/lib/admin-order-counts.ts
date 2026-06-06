import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSidebarCounts } from "@/lib/legacy";

const getCachedSidebarCounts = unstable_cache(
  getSidebarCounts,
  ["admin-sidebar-counts"],
  { revalidate: 30, tags: ["admin-orders"] }
);

export const getAdminSidebarOrderCounts = cache(getCachedSidebarCounts);
