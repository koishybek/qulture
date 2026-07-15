"use client";

import Image from "next/image";
import { useState } from "react";

import type { DemoBundleView, DemoProductView } from "@/lib/commerce/catalog";

import { formatKzt, useCart } from "./cart-provider";

function createGroupId(): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `demo-set-${suffix}`;
}

function initialVariant(product: DemoProductView | undefined): string {
  return product?.variants.find((variant) => variant.available > 0)?.id ?? "";
}

export function BuildSetDemoPage({
  bundle,
  locale,
}: {
  bundle: DemoBundleView;
  locale: "ru" | "kz";
}) {
  const isRu = locale === "ru";
  const { addLines } = useCart();
  const top = bundle.products.find((product) => product.role === "top");
  const pants = bundle.products.find((product) => product.role === "pants");
  const [topVariantId, setTopVariantId] = useState(() => initialVariant(top));
  const [pantsVariantId, setPantsVariantId] = useState(() => initialVariant(pants));
  const [notice, setNotice] = useState("");
  const selectedTop = top?.variants.find((variant) => variant.id === topVariantId);
  const selectedPants = pants?.variants.find(
    (variant) => variant.id === pantsVariantId,
  );
  const baseTotal = (top?.price ?? 0) + (pants?.price ?? 0);
  const discount = Math.round((baseTotal * bundle.discountPercent) / 100);
  const total = baseTotal - discount;

  function addSet() {
    if (!top || !pants || !selectedTop || !selectedPants) return;
    const groupId = createGroupId();
    addLines([
      {
        id: `${groupId}-${selectedTop.id}`,
        productId: top.id,
        variantId: selectedTop.id,
        slug: top.slug,
        name: top.name,
        role: "top",
        color: selectedTop.color,
        size: selectedTop.size,
        quantity: 1,
        unitPrice: top.price,
        currency: "KZT",
        demo: true,
        availability: selectedTop.available <= 2 ? "low_stock" : "in_stock",
        bundleGroupId: groupId,
        bundleDiscountPercent: bundle.discountPercent,
        variantOptions: top.variants.filter((variant) => variant.available > 0).map((variant) => ({ variantId: variant.id, size: variant.size, color: variant.color, unitPrice: top.price, availability: variant.available <= 2 ? "low_stock" as const : "in_stock" as const })),
      },
      {
        id: `${groupId}-${selectedPants.id}`,
        productId: pants.id,
        variantId: selectedPants.id,
        slug: pants.slug,
        name: pants.name,
        role: "pants",
        color: selectedPants.color,
        size: selectedPants.size,
        quantity: 1,
        unitPrice: pants.price,
        currency: "KZT",
        demo: true,
        availability: selectedPants.available <= 2 ? "low_stock" : "in_stock",
        bundleGroupId: groupId,
        bundleDiscountPercent: bundle.discountPercent,
        variantOptions: pants.variants.filter((variant) => variant.available > 0).map((variant) => ({ variantId: variant.id, size: variant.size, color: variant.color, unitPrice: pants.price, availability: variant.available <= 2 ? "low_stock" as const : "in_stock" as const })),
      },
    ]);
    setNotice(isRu ? "Demo-комплект добавлен." : "Demo жиынтық қосылды.");
    window.dispatchEvent(new CustomEvent("qulture:open-cart"));
  }

  if (!top || !pants) {
    return (
      <section className="q-page">
        <div className="demo-rail">DEMO FIXTURE INCOMPLETE</div>
        <p>{isRu ? "Компоненты demo-комплекта не найдены." : "Demo жиынтық бөліктері табылмады."}</p>
      </section>
    );
  }

  return (
    <section className="build-set-demo" data-testid="demo-build-set">
      <div className="demo-rail">DEMO BUILD-A-SET — INDEPENDENT SIZES — MOCK PAYMENT</div>
      <header className="build-set-demo__header">
        <div>
          <p className="q-meta">QULTURE / MODULAR SYSTEM</p>
          <h1 className="q-display q-display--medium">{bundle.name}</h1>
        </div>
        <p>{bundle.description}</p>
      </header>
      <div className="build-set-demo__builder">
        <SetModule
          locale={locale}
          onChange={setTopVariantId}
          position="01"
          priority
          product={top}
          selectedId={topVariantId}
        />
        <SetModule
          locale={locale}
          onChange={setPantsVariantId}
          position="02"
          product={pants}
          selectedId={pantsVariantId}
        />
        <aside className="build-set-demo__summary">
          <p className="q-meta">03 / {isRu ? "Комплект" : "Жиынтық"}</p>
          <h2>{isRu ? "Размеры выбираются отдельно" : "Өлшемдер бөлек таңдалады"}</h2>
          <div className="build-set-demo__chosen">
            <span>TOP</span><strong>{selectedTop?.size ?? "—"}</strong>
            <span>PANTS</span><strong>{selectedPants?.size ?? "—"}</strong>
          </div>
          <dl>
            <div><dt>DEMO SUBTOTAL</dt><dd>{formatKzt(baseTotal, locale)}</dd></div>
            <div><dt>BUNDLE {bundle.discountPercent}%</dt><dd>− {formatKzt(discount, locale)}</dd></div>
            <div><dt>DEMO TOTAL</dt><dd>{formatKzt(total, locale)}</dd></div>
          </dl>
          <button
            className="q-button q-button--solid"
            data-testid="add-set-to-cart"
            disabled={!selectedTop || !selectedPants}
            onClick={addSet}
            type="button"
          >
            {isRu ? "Добавить комплект" : "Жиынтықты қосу"}
            <span aria-hidden="true">→</span>
          </button>
          <p aria-live="polite" className="q-status" data-kind="success">{notice}</p>
          <small>
            {isRu
              ? "Итог будет заново рассчитан сервером по данным БД. Реального списания нет."
              : "Қорытынды ДБ деректерімен серверде қайта есептеледі. Нақты төлем жоқ."}
          </small>
        </aside>
      </div>
    </section>
  );
}

function SetModule({
  locale,
  onChange,
  position,
  priority = false,
  product,
  selectedId,
}: {
  locale: "ru" | "kz";
  onChange: (id: string) => void;
  position: string;
  priority?: boolean;
  product: DemoBundleView["products"][number];
  selectedId: string;
}) {
  const isRu = locale === "ru";
  return (
    <article className="build-module">
      <div className="build-module__media">
        <Image
          alt=""
          fill
          loading="eager"
          priority={priority}
          sizes="(max-width: 900px) 100vw, 33vw"
          src="/media/hero/hero-poster.png"
        />
        <span>{product.role.toUpperCase()}</span>
      </div>
      <div className="build-module__body">
        <p className="q-meta">{position} / {product.role}</p>
        <h2>{product.name}</h2>
        <fieldset className="demo-size-picker">
          <legend>{isRu ? "Свой размер" : "Жеке өлшем"}</legend>
          <div>
            {product.variants.map((variant) => (
              <button
                aria-pressed={selectedId === variant.id}
                data-testid={product.role === "top" ? "top-size" : "pants-size"}
                disabled={variant.available < 1}
                key={variant.id}
                onClick={() => onChange(variant.id)}
                type="button"
              >
                <span>{variant.size}</span>
                <small>{variant.available} DEMO</small>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </article>
  );
}
