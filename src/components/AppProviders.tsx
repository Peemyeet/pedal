"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { CartProvider } from "@/components/CartProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
