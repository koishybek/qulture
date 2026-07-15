import { cache } from "react";
import { db } from "@/lib/db";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export const getSiteSettings = cache(async () => {
  return db.siteSettings.findUnique({ where: { id: "default" } });
});

export function publicDefaultLocale(value: unknown): Locale {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (normalized === "RU") return "ru";
  if (normalized === "KZ") return "kz";
  return defaultLocale;
}

export function jsonObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function localizedSettings(value: unknown, locale: Locale) {
  return jsonObject(jsonObject(value)[locale]);
}

export function stringSetting(value: unknown, fallback?: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function internalAsset(value: unknown, fallback: string) {
  const path = stringSetting(value);
  return path?.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

const colorTokens = ["background", "surface", "text", "inverse", "inverse-text", "graphite", "muted", "border", "inverse-border", "accent", "success", "warning", "error"] as const;

export function siteCssVariables(palette: unknown, typography: unknown) {
  const styles: Record<string, string> = {};
  const colors = jsonObject(palette);
  for (const token of colorTokens) {
    const value = stringSetting(colors[token]);
    if (value && value.length <= 80) styles[`--${token}`] = value;
  }

  const type = jsonObject(typography);
  const fontSans = stringSetting(type.fontSans);
  const fontSerif = stringSetting(type.fontSerif);
  if (fontSans && fontSans.length <= 240) styles["--font-sans"] = fontSans;
  if (fontSerif && fontSerif.length <= 240) styles["--font-serif"] = fontSerif;
  return styles;
}

export function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()).slice(0, 8)
    : [];
}
