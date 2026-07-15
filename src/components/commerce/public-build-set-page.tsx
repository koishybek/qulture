"use client";

import Image from "next/image";
import { useState } from "react";

import type {
  PublicBundleComponentView,
  PublicBundleView,
  PublicCatalogLocale,
  PublicVariantView,
} from "@/lib/commerce/public-catalog";

import { useCart } from "./cart-provider";

function formatMoney(
  amount: number,
  currency: string,
  locale: PublicCatalogLocale,
): string {
  try {
    return new Intl.NumberFormat(locale === "ru" ? "ru-KZ" : "kk-KZ", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

function initialVariant(component: PublicBundleComponentView | undefined) {
  return (
    component?.product.variants.find((variant) => variant.canAddToCart)?.id ??
    component?.product.variants[0]?.id ??
    ""
  );
}

function selectedVariant(
  component: PublicBundleComponentView | undefined,
  id: string,
): PublicVariantView | undefined {
  return component?.product.variants.find((variant) => variant.id === id);
}

function availabilityLabel(
  variant: PublicVariantView,
  locale: PublicCatalogLocale,
): string {
  const labels =
    locale === "ru"
      ? {
          in_stock: "В наличии",
          low_stock: "Осталось немного",
          preorder: "Предзаказ",
          unavailable: "Недоступно",
        }
      : {
          in_stock: "Қолда бар",
          low_stock: "Аз қалды",
          preorder: "Алдын ала тапсырыс",
          unavailable: "Қолжетімсіз",
        };
  return labels[variant.availability];
}

function createGroupId(): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `set-${suffix}`;
}

function cartAvailability(variant: PublicVariantView) {
  if (variant.availability === "preorder") return "preorder" as const;
  if (variant.availability === "low_stock") return "low_stock" as const;
  return "in_stock" as const;
}

function SetModule({
  component,
  locale,
  onChange,
  position,
  selectedId,
}: {
  component: PublicBundleComponentView;
  locale: PublicCatalogLocale;
  onChange: (id: string) => void;
  position: string;
  selectedId: string;
}) {
  const isRu = locale === "ru";
  const selected = selectedVariant(component, selectedId);
  const media = selected?.media[0] ?? component.product.media[0];
  return (
    <article className="build-module">
      <div className="build-module__media">
        {media ? (
          <Image
            alt={media.alt}
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
            src={media.src}
          />
        ) : null}
        <span>
          {media
            ? component.role.toUpperCase()
            : isRu
              ? "МЕДИА ГОТОВИТСЯ"
              : "МЕДИА ДАЙЫНДАЛУДА"}
        </span>
      </div>
      <div className="build-module__body">
        <p className="q-meta">{position} / {component.role}</p>
        <h2>{component.product.name}</h2>
        <fieldset className="demo-size-picker">
          <legend>{isRu ? "Цвет и размер" : "Түс пен өлшем"}</legend>
          <div>
            {component.product.variants.map((variant) => (
              <button
                aria-pressed={selectedId === variant.id}
                key={variant.id}
                onClick={() => onChange(variant.id)}
                type="button"
              >
                <span>{variant.color} · {variant.size}</span>
                <small>{availabilityLabel(variant, locale)}</small>
              </button>
            ))}
          </div>
        </fieldset>
        {selected?.priceMinor !== null && selected?.priceMinor !== undefined ? (
          <strong>
            {formatMoney(
              selected.priceMinor * component.requiredQuantity,
              component.product.currency,
              locale,
            )}
          </strong>
        ) : (
          <small>{isRu ? "Цена уточняется" : "Бағасы нақтылануда"}</small>
        )}
      </div>
    </article>
  );
}

export function PublicBuildSetPage({
  bundle,
  locale,
}: {
  bundle: PublicBundleView;
  locale: PublicCatalogLocale;
}) {
  const isRu = locale === "ru";
  const { addLines } = useCart();
  const top = bundle.components.find((component) => component.role === "top");
  const pants = bundle.components.find((component) => component.role === "pants");
  const [topVariantId, setTopVariantId] = useState(() => initialVariant(top));
  const [pantsVariantId, setPantsVariantId] = useState(() => initialVariant(pants));
  const [notice, setNotice] = useState("");
  const selectedTop = selectedVariant(top, topVariantId);
  const selectedPants = selectedVariant(pants, pantsVariantId);

  if (!top || !pants) {
    return (
      <section className="q-page" role="status">
        <p className="q-meta">QULTURE / SET STATUS</p>
        <h1>
          {isRu
            ? "Комплект пока нельзя собрать"
            : "Жинақты әзірге құру мүмкін емес"}
        </h1>
        <p>
          {isRu
            ? "Для опубликованного комплекта нужны верхний и нижний модули."
            : "Жарияланған жинаққа жоғарғы және төменгі модульдер қажет."}
        </p>
      </section>
    );
  }

  const topComponent = top;
  const pantsComponent = pants;

  const topTotal =
    selectedTop?.priceMinor === null || selectedTop?.priceMinor === undefined
      ? null
      : selectedTop.priceMinor * topComponent.requiredQuantity;
  const pantsTotal =
    selectedPants?.priceMinor === null || selectedPants?.priceMinor === undefined
      ? null
      : selectedPants.priceMinor * pantsComponent.requiredQuantity;
  const subtotal =
    topTotal === null || pantsTotal === null ? null : topTotal + pantsTotal;
  const discount =
    subtotal === null
      ? null
      : bundle.discount.type === "PERCENTAGE"
        ? Math.min(
            subtotal,
            Math.round((subtotal * bundle.discount.value) / 10_000),
          )
        : Math.min(subtotal, bundle.discount.value);
  const total =
    subtotal === null || discount === null ? null : subtotal - discount;
  const canAdd = Boolean(
    selectedTop?.canAddToCart &&
      selectedPants?.canAddToCart &&
      selectedTop.priceMinor !== null &&
      selectedPants.priceMinor !== null &&
      topComponent.product.currency === "KZT" &&
      pantsComponent.product.currency === "KZT" &&
      bundle.currency === "KZT",
  );

  function addSet() {
    if (
      !canAdd ||
      !selectedTop ||
      !selectedPants ||
      selectedTop.priceMinor === null ||
      selectedPants.priceMinor === null ||
      subtotal === null ||
      discount === null
    ) {
      return;
    }
    const groupId = createGroupId();
    const bundleDiscountPercent =
      subtotal > 0 ? (discount / subtotal) * 100 : 0;
    addLines([
      {
        id: `${groupId}-${selectedTop.id}`,
        productId: topComponent.product.id,
        variantId: selectedTop.id,
        slug: topComponent.product.slug,
        name: topComponent.product.name,
        role: "top",
        color: selectedTop.color,
        size: selectedTop.size,
        quantity: topComponent.requiredQuantity,
        unitPrice: selectedTop.priceMinor,
        currency: "KZT",
        demo: false,
        availability: cartAvailability(selectedTop),
        eta:
          selectedTop.incomingEta ??
          topComponent.product.preorderEta ??
          undefined,
        bundleGroupId: groupId,
        bundleDiscountPercent,
        mediaSrc: (selectedTop.media[0] ?? topComponent.product.media[0])?.src,
        mediaAlt: (selectedTop.media[0] ?? topComponent.product.media[0])?.alt,
        variantOptions: topComponent.product.variants.filter(
          (variant): variant is PublicVariantView & { priceMinor: number } =>
            variant.canAddToCart && variant.priceMinor !== null,
        ).map((variant) => ({ variantId: variant.id, size: variant.size, color: variant.color, unitPrice: variant.priceMinor, availability: cartAvailability(variant), eta: variant.incomingEta ?? topComponent.product.preorderEta ?? undefined, mediaSrc: (variant.media[0] ?? topComponent.product.media[0])?.src, mediaAlt: (variant.media[0] ?? topComponent.product.media[0])?.alt })),
      },
      {
        id: `${groupId}-${selectedPants.id}`,
        productId: pantsComponent.product.id,
        variantId: selectedPants.id,
        slug: pantsComponent.product.slug,
        name: pantsComponent.product.name,
        role: "pants",
        color: selectedPants.color,
        size: selectedPants.size,
        quantity: pantsComponent.requiredQuantity,
        unitPrice: selectedPants.priceMinor,
        currency: "KZT",
        demo: false,
        availability: cartAvailability(selectedPants),
        eta:
          selectedPants.incomingEta ??
          pantsComponent.product.preorderEta ??
          undefined,
        bundleGroupId: groupId,
        bundleDiscountPercent,
        mediaSrc: (selectedPants.media[0] ?? pantsComponent.product.media[0])?.src,
        mediaAlt: (selectedPants.media[0] ?? pantsComponent.product.media[0])?.alt,
        variantOptions: pantsComponent.product.variants.filter(
          (variant): variant is PublicVariantView & { priceMinor: number } =>
            variant.canAddToCart && variant.priceMinor !== null,
        ).map((variant) => ({ variantId: variant.id, size: variant.size, color: variant.color, unitPrice: variant.priceMinor, availability: cartAvailability(variant), eta: variant.incomingEta ?? pantsComponent.product.preorderEta ?? undefined, mediaSrc: (variant.media[0] ?? pantsComponent.product.media[0])?.src, mediaAlt: (variant.media[0] ?? pantsComponent.product.media[0])?.alt })),
      },
    ]);
    setNotice(
      isRu ? "Комплект добавлен в корзину." : "Жинақ себетке қосылды.",
    );
    window.dispatchEvent(new CustomEvent("qulture:open-cart"));
  }

  return (
    <section className="build-set-demo" data-testid="public-build-set">
      <header className="build-set-demo__header">
        <div>
          <p className="q-meta">QULTURE / MODULAR SET</p>
          <h1 className="q-display q-display--medium">{bundle.name}</h1>
        </div>
        {bundle.description ? <p>{bundle.description}</p> : null}
      </header>

      <div className="build-set-demo__builder">
        <SetModule
          component={topComponent}
          locale={locale}
          onChange={(id) => {
            setTopVariantId(id);
            setNotice("");
          }}
          position="01"
          selectedId={topVariantId}
        />
        <SetModule
          component={pantsComponent}
          locale={locale}
          onChange={(id) => {
            setPantsVariantId(id);
            setNotice("");
          }}
          position="02"
          selectedId={pantsVariantId}
        />

        <aside className="build-set-demo__summary">
          <p className="q-meta">03 / {isRu ? "КОМПЛЕКТ" : "ЖИНАҚ"}</p>
          <h2>
            {isRu
              ? "Размеры выбираются отдельно"
              : "Өлшемдер бөлек таңдалады"}
          </h2>
          <div className="build-set-demo__chosen">
            <span>TOP</span><strong>{selectedTop?.size ?? "—"}</strong>
            <span>PANTS</span><strong>{selectedPants?.size ?? "—"}</strong>
          </div>
          {subtotal !== null && discount !== null && total !== null ? (
            <dl>
              <div>
                <dt>{isRu ? "Сумма модулей" : "Модульдер сомасы"}</dt>
                <dd>{formatMoney(subtotal, bundle.currency, locale)}</dd>
              </div>
              <div>
                <dt>
                  {isRu ? "Скидка комплекта" : "Жинақ жеңілдігі"}
                  {bundle.discount.percent !== null
                    ? ` ${bundle.discount.percent}%`
                    : ""}
                </dt>
                <dd>− {formatMoney(discount, bundle.currency, locale)}</dd>
              </div>
              <div>
                <dt>{isRu ? "Итого" : "Барлығы"}</dt>
                <dd>{formatMoney(total, bundle.currency, locale)}</dd>
              </div>
            </dl>
          ) : (
            <p className="q-status" data-kind="error">
              {isRu
                ? "Итог появится после публикации цен обоих модулей."
                : "Екі модульдің бағасы жарияланғаннан кейін қорытынды шығады."}
            </p>
          )}
          <button
            className="q-button q-button--solid"
            disabled={!canAdd}
            onClick={addSet}
            type="button"
          >
            {isRu ? "Добавить комплект" : "Жинақты қосу"}
            <span aria-hidden="true">→</span>
          </button>
          {!canAdd ? (
            <p className="q-status" data-kind="error">
              {isRu
                ? "Выберите доступные варианты с опубликованной ценой."
                : "Бағасы жарияланған қолжетімді нұсқаларды таңдаңыз."}
            </p>
          ) : null}
          <p aria-live="polite" className="q-status" data-kind="success">
            {notice}
          </p>
          <small>
            {isRu
              ? "Цена и доступность будут заново проверены сервером при оформлении."
              : "Рәсімдеу кезінде баға мен қолжетімділікті сервер қайта тексереді."}
          </small>
        </aside>
      </div>
    </section>
  );
}
