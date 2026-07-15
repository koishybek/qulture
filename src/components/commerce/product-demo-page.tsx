"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { DemoProductView } from "@/lib/commerce/catalog";
import { commerceText, type CommerceLocale } from "@/lib/commerce/locale";

import { formatKzt, useCart } from "./cart-provider";

function lineId(variantId: string): string {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  return `${variantId}-${suffix}`;
}

export function ProductDemoPage({ locale, product }: { locale: CommerceLocale; product: DemoProductView }) {
  const { addLines } = useCart();
  const firstAvailable = product.variants.find((variant) => variant.available > 0);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [notice, setNotice] = useState("");
  const selected = product.variants.find((variant) => variant.id === selectedId);
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);

  function addToCart() {
    if (!selected || selected.available < 1) return;
    addLines([{
      id: lineId(selected.id), productId: product.id, variantId: selected.id, slug: product.slug,
      name: product.name, nameByLocale: product.nameByLocale,
      role: product.category === "BOTTOM" ? "pants" : "top",
      color: selected.color, colorByLocale: selected.colorByLocale, size: selected.size,
      quantity: 1, unitPrice: product.price, currency: "KZT", demo: true,
      availability: selected.available <= 2 ? "low_stock" : "in_stock",
      variantOptions: product.variants.filter((variant) => variant.available > 0).map((variant) => ({
        variantId: variant.id, size: variant.size, color: variant.color, colorByLocale: variant.colorByLocale,
        unitPrice: product.price, availability: variant.available <= 2 ? "low_stock" as const : "in_stock" as const,
      })),
    }]);
    setNotice(t("Demo item added.", "Demo-позиция добавлена.", "Demo позиция қосылды."));
    window.dispatchEvent(new CustomEvent("qulture:open-cart"));
  }

  return (
    <section className="demo-pdp" data-testid={`demo-product-${product.slug}`}>
      <div className="demo-rail">DEMO PDP — FIXTURE DATA — NO PUBLIC SALE</div>
      <div className="demo-pdp__layout">
        <div className="demo-pdp__media"><Image alt="" fill priority sizes="(max-width: 900px) 100vw, 58vw" src="/media/hero/hero-poster.png" /><span>DEMO / {product.category}</span></div>
        <div className="demo-pdp__details">
          <div className="demo-pdp__head"><p className="q-meta">{product.category} / GRAPHITE DEMO</p><h1>{product.name}</h1><p>{product.description}</p><strong>{formatKzt(product.price, locale)}</strong></div>
          <fieldset className="demo-size-picker"><legend>{t("Size", "Размер", "Өлшем")}</legend><div>{product.variants.map((variant) => <button aria-pressed={variant.id === selectedId} disabled={variant.available < 1} key={variant.id} onClick={() => setSelectedId(variant.id)} type="button"><span>{variant.size}</span><small>{variant.available} DEMO</small></button>)}</div></fieldset>
          <button className="q-button q-button--solid demo-pdp__add" disabled={!selected} onClick={addToCart} type="button">{t("Add demo item", "Добавить demo-позицию", "Demo позицияны қосу")}<span aria-hidden="true">→</span></button>
          <p aria-live="polite" className="q-status" data-kind="success">{notice}</p>
          <Link className="q-text-link" href={`/${locale}/build-a-set?demo=1`}>{t("Choose a second module", "Подобрать второй модуль", "Екінші модульді таңдау")}</Link>
          <dl className="demo-pdp__facts"><div><dt>DATA SOURCE</dt><dd>SEEDED DEMO FIXTURE</dd></div><div><dt>PAYMENT</dt><dd>DEVELOPMENT MOCK ONLY</dd></div><div><dt>PUBLIC VISIBILITY</dt><dd>DISABLED</dd></div></dl>
        </div>
      </div>
    </section>
  );
}
