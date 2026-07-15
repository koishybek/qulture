"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

export function AnalyticsBridge({ locale }: { locale: "ru" | "kz" }) {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("PAGE_VIEW", { path: pathname }, { locale });

    const sent = new Set<number>();
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percentage = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of [25, 50, 75, 100]) {
        if (percentage >= threshold && !sent.has(threshold)) {
          sent.add(threshold);
          trackEvent("SCROLL_DEPTH", { path: pathname, percentage: threshold }, { locale });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [locale, pathname]);

  return null;
}
