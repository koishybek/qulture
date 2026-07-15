"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";

export type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  role: "top" | "pants" | "single";
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  currency: "KZT";
  demo: boolean;
  availability: "in_stock" | "low_stock" | "preorder";
  eta?: string;
  mediaSrc?: string;
  mediaAlt?: string;
  bundleGroupId?: string;
  bundleDiscountPercent?: number;
  variantOptions?: Array<{
    variantId: string;
    size: string;
    color: string;
    unitPrice: number;
    availability: "in_stock" | "low_stock" | "preorder";
    eta?: string;
    mediaSrc?: string;
    mediaAlt?: string;
  }>;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  addLines: (lines: CartLine[]) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, patch: Partial<Pick<CartLine, "quantity" | "size" | "color" | "variantId" | "unitPrice" | "availability" | "eta" | "mediaSrc" | "mediaAlt">>) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "qulture-cart-v1";

function calculate(lines: CartLine[]) {
  let subtotal = 0;
  let discount = 0;
  const groups = new Map<string, CartLine[]>();

  for (const line of lines) {
    subtotal += line.unitPrice * line.quantity;
    if (line.bundleGroupId) groups.set(line.bundleGroupId, [...(groups.get(line.bundleGroupId) ?? []), line]);
  }

  for (const group of groups.values()) {
    const roles = new Set(group.map((line) => line.role));
    if (!roles.has("top") || !roles.has("pants")) continue;
    const percentage = Math.max(...group.map((line) => line.bundleDiscountPercent ?? 0));
    discount += Math.round(group.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) * (percentage / 100));
  }

  return { subtotal, discount, total: subtotal - discount };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { version: 1; lines: CartLine[] };
          if (parsed.version === 1 && Array.isArray(parsed.lines)) setLines(parsed.lines);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, lines }));
  }, [hydrated, lines]);

  const addLines = useCallback((incoming: CartLine[]) => {
    setLines((current) => {
      const next = [...current];
      for (const line of incoming) {
        const existingIndex = next.findIndex((candidate) => candidate.variantId === line.variantId && candidate.bundleGroupId === line.bundleGroupId);
        if (existingIndex >= 0) {
          next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + line.quantity };
        } else {
          next.push(line);
        }
      }
      return next;
    });
    window.dispatchEvent(new CustomEvent("qulture:cart-updated"));
    trackEvent("ADD_TO_CART", { lineCount: incoming.length, demo: incoming.some((line) => line.demo) });
  }, []);

  const removeLine = useCallback((id: string) => setLines((current) => current.filter((line) => line.id !== id)), []);
  const updateLine = useCallback((id: string, patch: Partial<Pick<CartLine, "quantity" | "size" | "color" | "variantId" | "unitPrice" | "availability" | "eta" | "mediaSrc" | "mediaAlt">>) => {
    setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch, quantity: Math.max(1, patch.quantity ?? line.quantity) } : line));
    if (patch.size) trackEvent("SELECT_SIZE", { source: "cart" });
  }, []);
  const clear = useCallback(() => setLines([]), []);
  const totals = useMemo(() => calculate(lines), [lines]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    ...totals,
    addLines,
    removeLine,
    updateLine,
    clear,
  }), [addLines, clear, lines, removeLine, totals, updateLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

export function formatKzt(amount: number, locale: "ru" | "kz" = "ru") {
  return new Intl.NumberFormat(locale === "ru" ? "ru-KZ" : "kk-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(amount);
}
