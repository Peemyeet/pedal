"use client";

import { useEffect } from "react";

export function AutoPrintOnLoad({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => {
      window.print();
    }, 250);
    return () => window.clearTimeout(id);
  }, [enabled]);

  return null;
}
