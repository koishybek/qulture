"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics/client";
import type {
  PublicCatalogLocale,
  PublicMediaView,
} from "@/lib/commerce/public-catalog";
import { commerceIntlLocale, commerceText } from "@/lib/commerce/locale";

import { useCart } from "./cart-provider";

export type PublicProductCardOption = {
  label: string;
  available: boolean;
};

export type PublicProductCardColor = PublicProductCardOption & {
  code: string;
};

export type PublicProductCardQuickVariant = {
  id: string;
  size: string;
  color: string;
  colorByLocale: Partial<Record<PublicCatalogLocale, string>>;
  unitPrice: number;
  availability: "in_stock" | "low_stock" | "preorder";
  eta?: string;
  mediaSrc?: string;
  mediaAlt?: string;
};

type PublicProductCardProps = {
  locale: PublicCatalogLocale;
  productId: string;
  slug: string;
  name: string;
  nameByLocale: Partial<Record<PublicCatalogLocale, string>>;
  category: string;
  role: "top" | "pants" | "single";
  price: string;
  availability: string;
  media: PublicMediaView[];
  sizes: PublicProductCardOption[];
  colors: PublicProductCardColor[];
  canSelectSize: boolean;
  quickVariants: PublicProductCardQuickVariant[];
};

const SAFE_NAMED_SWATCHES = new Set([
  "beige",
  "black",
  "blue",
  "brown",
  "gray",
  "green",
  "grey",
  "navy",
  "olive",
  "orange",
  "pink",
  "purple",
  "red",
  "silver",
  "tan",
  "white",
  "yellow",
]);

function swatchBackground(code: string): string | undefined {
  const value = code.trim();
  if (/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) {
    return value;
  }
  const named = value.toLowerCase();
  return SAFE_NAMED_SWATCHES.has(named) ? named : undefined;
}

function createQuickLineId(variantId: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `public-card-${variantId}-${suffix}`;
}

export function PublicProductCard({
  locale,
  productId,
  slug,
  name,
  nameByLocale,
  category,
  role,
  price,
  availability,
  media,
  sizes,
  colors,
  canSelectSize,
  quickVariants,
}: PublicProductCardProps) {
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);
  const { addLines } = useCart();
  const cardMedia = media.slice(0, 2);
  const hasSecondaryMedia = cardMedia.length > 1;
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickNotice, setQuickNotice] = useState("");
  const quickPanelId = useId();
  const lastMediaIndexRef = useRef(0);
  const desktopSwapTrackedRef = useRef(false);
  const productHref = `/${locale}/product/${slug}`;

  function reportDesktopSwap(source: "hover" | "keyboard") {
    if (!hasSecondaryMedia || desktopSwapTrackedRef.current) return;
    desktopSwapTrackedRef.current = true;
    trackEvent(
      "PRODUCT_CARD_MEDIA_SWAPPED",
      {
        productId,
        productSlug: slug,
        fromIndex: 0,
        toIndex: 1,
        source,
      },
      { locale },
    );
  }

  function handleMediaScroll(element: HTMLSpanElement) {
    if (!hasSecondaryMedia || element.clientWidth === 0) return;
    const nextIndex = Math.max(
      0,
      Math.min(cardMedia.length - 1, Math.round(element.scrollLeft / element.clientWidth)),
    );
    if (nextIndex === lastMediaIndexRef.current) return;

    const previousIndex = lastMediaIndexRef.current;
    lastMediaIndexRef.current = nextIndex;
    setActiveMediaIndex(nextIndex);
    trackEvent(
      "PRODUCT_CARD_MEDIA_SWAPPED",
      {
        productId,
        productSlug: slug,
        fromIndex: previousIndex,
        toIndex: nextIndex,
        source: "swipe",
      },
      { locale },
    );
  }

  function toggleQuickView() {
    setQuickOpen((current) => {
      const next = !current;
      if (next) {
        trackEvent(
          "VIEW_ITEM",
          { productId, productSlug: slug, source: "quick-view" },
          { locale },
        );
      }
      return next;
    });
    setQuickNotice("");
  }

  function quickAdd(variant: PublicProductCardQuickVariant) {
    addLines([
      {
        id: createQuickLineId(variant.id),
        productId,
        variantId: variant.id,
        slug,
        name,
        nameByLocale,
        role,
        color: variant.color,
        colorByLocale: variant.colorByLocale,
        size: variant.size,
        quantity: 1,
        unitPrice: variant.unitPrice,
        currency: "KZT",
        demo: false,
        availability: variant.availability,
        eta: variant.eta,
        mediaSrc: variant.mediaSrc,
        mediaAlt: variant.mediaAlt,
        variantOptions: quickVariants.map((option) => ({
          variantId: option.id,
          size: option.size,
          color: option.color,
          colorByLocale: option.colorByLocale,
          unitPrice: option.unitPrice,
          availability: option.availability,
          eta: option.eta,
          mediaSrc: option.mediaSrc,
          mediaAlt: option.mediaAlt,
        })),
      },
    ]);
    setQuickNotice(t("Added to bag.", "Добавлено в корзину.", "Себетке қосылды."));
    window.dispatchEvent(new CustomEvent("qulture:open-cart"));
  }

  return (
    <article
      className={`public-product-card${hasSecondaryMedia ? " public-product-card--has-secondary" : ""}`}
      data-testid={`product-${slug}`}
    >
      <div className="public-product-card__media">
        {cardMedia.length > 0 ? (
          <Link
            aria-label={t(`Open ${name}`, `Открыть ${name}`, `${name} ашу`)}
            className="public-product-card__media-link"
            href={productHref}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) {
                reportDesktopSwap("keyboard");
              }
            }}
            onPointerEnter={(event) => {
              if (
                event.pointerType === "mouse" &&
                window.matchMedia("(hover: hover) and (pointer: fine)").matches
              ) {
                reportDesktopSwap("hover");
              }
            }}
          >
            <span
              className="public-product-card__gallery"
              onScroll={(event) => handleMediaScroll(event.currentTarget)}
            >
              {cardMedia.map((item, index) => (
                <span className="public-product-card__slide" key={item.src}>
                  <Image
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 2rem), 50vw"
                    src={item.src}
                  />
                  <span className="sr-only">
                    {t("Image", "Изображение", "Сурет")} {index + 1} / {cardMedia.length}
                  </span>
                </span>
              ))}
            </span>
          </Link>
        ) : (
          <span className="public-product-card__media-pending">
            {t("MEDIA IN PROGRESS", "МЕДИА ГОТОВИТСЯ", "МЕДИА ДАЙЫНДАЛУДА")}
          </span>
        )}

        <span className="public-product-card__category">{category}</span>
        {hasSecondaryMedia ? (
          <span aria-hidden="true" className="public-product-card__media-dots">
            {cardMedia.map((item, index) => (
              <span
                className={index === activeMediaIndex ? "is-active" : undefined}
                key={item.src}
              />
            ))}
          </span>
        ) : null}
      </div>

      <div className="public-product-card__body">
        <div>
          <p className="q-meta">{category}</p>
          <h2>
            <Link href={productHref}>{name}</Link>
          </h2>
        </div>
        <strong>{price}</strong>
      </div>

      {colors.length > 0 ? (
        <div
          aria-label={t("Colours", "Цвета", "Түстер")}
          className="public-product-card__options"
          role="list"
        >
          {colors.map((color) => {
            const backgroundColor = swatchBackground(color.code);
            return (
              <span
                className={!color.available ? "is-unavailable" : undefined}
                key={`${color.code}:${color.label}`}
                role="listitem"
                title={
                  color.available
                    ? color.label
                    : `${color.label} — ${t("unavailable", "недоступен", "қолжетімсіз")}`
                }
              >
                <span
                  aria-hidden="true"
                  className="public-product-card__swatch"
                  style={backgroundColor ? { backgroundColor } : undefined}
                >
                  {!backgroundColor ? color.code.slice(0, 2).toUpperCase() : null}
                </span>
                {color.label}
                {!color.available ? (
                  <span className="sr-only">
                    {t("unavailable", "недоступен", "қолжетімсіз")}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="public-product-card__sizes">
        <span className="q-meta">{t("SIZE", "РАЗМЕР", "ӨЛШЕМ")}</span>
        <span
          aria-label={t("Size availability", "Доступность размеров", "Өлшемдердің қолжетімділігі")}
          role={sizes.length > 0 ? "list" : undefined}
        >
          {sizes.length > 0
            ? sizes.map((size) => (
                <span
                  className={!size.available ? "is-unavailable" : undefined}
                  key={size.label}
                  role="listitem"
                >
                  {size.label}
                  {!size.available ? (
                    <span className="sr-only">
                      {t("unavailable", "недоступен", "қолжетімсіз")}
                    </span>
                  ) : null}
                </span>
              ))
            : t("To be confirmed", "Уточняется", "Нақтылануда")}
        </span>
      </div>

      <div className="public-product-card__foot">
        <span>{availability}</span>
        <span className="public-product-card__actions">
          <button
            aria-controls={quickPanelId}
            aria-expanded={quickOpen}
            onClick={toggleQuickView}
            type="button"
          >
            {t("Quick view", "Быстрый просмотр", "Жылдам қарау")}
          </button>
          <Link className="public-product-card__cta" href={productHref}>
            {canSelectSize
              ? t("Choose size", "Выбрать размер", "Өлшемді таңдау")
              : t("View details", "Подробнее", "Толығырақ")}
            <span aria-hidden="true">→</span>
          </Link>
        </span>
      </div>

      {quickOpen ? (
        <div className="public-product-card__quick" id={quickPanelId} role="region">
          <div>
            <strong>{t("Quick add", "Быстрое добавление", "Жылдам қосу")}</strong>
            <button
              aria-label={t("Close quick view", "Закрыть быстрый просмотр", "Жылдам қарауды жабу")}
              onClick={toggleQuickView}
              type="button"
            >
              ×
            </button>
          </div>
          {quickVariants.length > 0 ? (
            <div className="public-product-card__quick-options">
              {quickVariants.map((variant) => (
                <button key={variant.id} onClick={() => quickAdd(variant)} type="button">
                  <span>{variant.color} · {variant.size}</span>
                  <small>
                    {new Intl.NumberFormat(commerceIntlLocale(locale), {
                      style: "currency",
                      currency: "KZT",
                      maximumFractionDigits: 0,
                    }).format(variant.unitPrice)}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <p>{t("Available options have not been published yet.", "Доступные варианты пока не опубликованы.", "Қолжетімді нұсқалар әлі жарияланбаған.")}</p>
          )}
          <p aria-live="polite" className="q-status" data-kind="success">{quickNotice}</p>
        </div>
      ) : null}
    </article>
  );
}
