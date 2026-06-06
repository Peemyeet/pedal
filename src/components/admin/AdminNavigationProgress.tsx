"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInternalAdminLink(href: string) {
  if (!href.startsWith("/admin")) return false;
  if (href.startsWith("//")) return false;
  return true;
}

export function AdminNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pendingNavRef = useRef(false);
  const routeKeyRef = useRef(routeKey);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      if (!isInternalAdminLink(href)) return;

      const url = new URL(href, window.location.origin);
      const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
      if (nextKey === routeKeyRef.current) return;

      pendingNavRef.current = true;
      setLoading(true);
      setProgress(18);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;

    routeKeyRef.current = routeKey;

    if (!pendingNavRef.current) return;

    pendingNavRef.current = false;
    setProgress(100);

    const timeout = window.setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [routeKey]);

  useEffect(() => {
    if (!loading) return;

    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 88 ? current : current + 6 + Math.random() * 8));
    }, 180);

    return () => window.clearInterval(interval);
  }, [loading]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      aria-hidden="true"
    >
      <div className="h-0.5 bg-red-100">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_12px_rgba(220,38,38,0.45)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
