"use client";

import { useEffect } from "react";

export function LocaleDocument({ locale }: { locale: "ru" | "kz" }) {
  useEffect(() => {
    document.documentElement.lang = locale === "kz" ? "kk" : "ru";
  }, [locale]);
  return null;
}
