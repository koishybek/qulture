"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAIProductContext,
  useOpenAIAssistant,
} from "@/components/ai/use-ai-assistant";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import { trackEvent } from "@/lib/analytics/client";
import type { ConfirmCartItem } from "@/lib/ai/client-actions";
import type {
  PublicAvailability,
  PublicCatalogLocale,
  PublicProductView,
  PublicVariantView,
} from "@/lib/commerce/public-catalog";
import {
  publicProductGallery,
  publicProductSelectionKey,
  restockWaitlistHref,
  variantForColor,
} from "@/lib/commerce/public-pdp";

import { useCart } from "./cart-provider";

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

function formatDate(value: string, locale: PublicCatalogLocale): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-KZ" : "kk-KZ", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

function availabilityText(
  availability: PublicAvailability,
  locale: PublicCatalogLocale,
): string {
  const ru = {
    in_stock: "В наличии",
    low_stock: "Осталось немного",
    preorder: "Доступно по предзаказу",
    unavailable: "Нет в наличии",
  };
  const kz = {
    in_stock: "Қолда бар",
    low_stock: "Аз қалды",
    preorder: "Алдын ала тапсырысқа қолжетімді",
    unavailable: "Қолда жоқ",
  };
  return (locale === "ru" ? ru : kz)[availability];
}

function cartAvailability(variant: PublicVariantView) {
  if (variant.availability === "preorder") return "preorder" as const;
  if (variant.availability === "low_stock") return "low_stock" as const;
  return "in_stock" as const;
}

function createLineId(variantId: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return `${variantId}-${suffix}`;
}

function initialVariant(product: PublicProductView): string {
  return (
    product.variants.find((variant) => variant.canAddToCart)?.id ??
    product.variants[0]?.id ??
    ""
  );
}

function displayPrice(
  product: PublicProductView,
  selected: PublicVariantView | undefined,
  locale: PublicCatalogLocale,
): string | null {
  if (selected?.priceMinor !== null && selected?.priceMinor !== undefined) {
    return formatMoney(selected.priceMinor, product.currency, locale);
  }
  if (product.priceFromMinor === null) return null;
  if (
    product.priceToMinor !== null &&
    product.priceToMinor !== product.priceFromMinor
  ) {
    return `${formatMoney(product.priceFromMinor, product.currency, locale)} – ${formatMoney(product.priceToMinor, product.currency, locale)}`;
  }
  return formatMoney(product.priceFromMinor, product.currency, locale);
}

function uniqueColors(variants: readonly PublicVariantView[]) {
  const colors = new Map<string, { code: string; label: string }>();
  for (const variant of variants) {
    if (!colors.has(variant.colorCode)) {
      colors.set(variant.colorCode, {
        code: variant.colorCode,
        label: variant.color,
      });
    }
  }
  return [...colors.values()];
}

export function PublicProductPage({
  deliveryEnabled = false,
  locale,
  paymentEnabled = false,
  product,
}: {
  deliveryEnabled?: boolean;
  locale: PublicCatalogLocale;
  paymentEnabled?: boolean;
  product: PublicProductView;
}) {
  const isRu = locale === "ru";
  const { addLines } = useCart();
  const [selectedId, setSelectedId] = useState(() => initialVariant(product));
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const zoomDialogRef = useRef<HTMLDivElement>(null);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);
  const closeZoom = useCallback(() => setZoomOpen(false), []);
  useDialogBehavior(zoomOpen, zoomDialogRef, closeZoom, zoomTriggerRef);

  const selected = product.variants.find((variant) => variant.id === selectedId);
  const gallery = publicProductGallery(product.media, selected?.media);
  const activeMedia = gallery[activeMediaIndex] ?? gallery[0];
  const price = displayPrice(product, selected, locale);
  const eta = selected?.incomingEta ?? product.preorderEta;
  const etaLabel = eta ? formatDate(eta, locale) : null;
  const canAdd = Boolean(
    selected?.canAddToCart &&
      selected.priceMinor !== null &&
      product.currency === "KZT",
  );
  const colors = uniqueColors(product.variants);
  const variantsForColor = selected
    ? product.variants.filter(
        (variant) => variant.colorCode === selected.colorCode,
      )
    : product.variants;

  const chooseVariant = useCallback(
    (variant: PublicVariantView) => {
      setSelectedId(variant.id);
      setActiveMediaIndex(0);
      setNotice("");
      galleryTrackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      try {
        localStorage.setItem(publicProductSelectionKey(product.id), variant.id);
      } catch {
        // The selection still works when storage is unavailable.
      }
      trackEvent(
        "SELECT_SIZE",
        {
          productId: product.id,
          productSlug: product.slug,
          variantId: variant.id,
          source: "pdp",
        },
        { locale },
      );
    },
    [locale, product.id, product.slug],
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const persisted = localStorage.getItem(
          publicProductSelectionKey(product.id),
        );
        const persistedVariant = product.variants.find(
          (variant) => variant.id === persisted,
        );
        if (persistedVariant) {
          setSelectedId(persistedVariant.id);
          setActiveMediaIndex(0);
        }
      } catch {
        // Keep the server-selected default.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [product.id, product.variants]);

  useEffect(() => {
    trackEvent(
      "VIEW_ITEM",
      { productId: product.id, productSlug: product.slug, source: "pdp" },
      { locale },
    );
  }, [locale, product.id, product.slug]);

  function addSelectedVariant(quantity = 1, openCart = true): boolean {
      if (
        !selected ||
        !selected.canAddToCart ||
        selected.priceMinor === null ||
        product.currency !== "KZT"
      ) {
        return false;
      }
      const boundedQuantity = Math.max(1, Math.min(10, Math.trunc(quantity)));
      const selectedMedia = selected.media[0] ?? product.media[0];
      const variantOptions = product.variants.flatMap((variant) => {
        if (!variant.canAddToCart || variant.priceMinor === null) return [];
        const variantMedia = variant.media[0] ?? product.media[0];
        return [
          {
            variantId: variant.id,
            size: variant.size,
            color: variant.color,
            unitPrice: variant.priceMinor,
            availability: cartAvailability(variant),
            eta: variant.incomingEta ?? product.preorderEta ?? undefined,
            mediaSrc: variantMedia?.src,
            mediaAlt: variantMedia?.alt,
          },
        ];
      });
      addLines([
        {
          id: createLineId(selected.id),
          productId: product.id,
          variantId: selected.id,
          slug: product.slug,
          name: product.name,
          role: product.role,
          color: selected.color,
          size: selected.size,
          quantity: boundedQuantity,
          unitPrice: selected.priceMinor,
          currency: "KZT",
          demo: false,
          availability: cartAvailability(selected),
          eta: eta ?? undefined,
          mediaSrc: selectedMedia?.src,
          mediaAlt: selectedMedia?.alt,
          variantOptions,
        },
      ]);
      setNotice(
        isRu ? "Товар добавлен в корзину." : "Тауар себетке қосылды.",
      );
      if (openCart) {
        window.dispatchEvent(new CustomEvent("qulture:open-cart"));
      }
    return true;
  }

  function confirmAIAdd(items: ConfirmCartItem[]): boolean {
    const item = items[0];
    if (
      items.length !== 1 ||
      !item ||
      item.productId !== product.id ||
      item.variantId !== selected?.id
    ) {
      return false;
    }
    return addSelectedVariant(item.quantity, false);
  }

  useAIProductContext({
    onConfirmAddToCart: confirmAIAdd,
    productId: product.id,
    productSlug: product.slug,
    selectedColor: selected?.color,
    selectedSize: selected?.size,
    selectedVariantId: selected?.id,
  });

  const openSizeAssistant = useOpenAIAssistant({
    entryPoint: "pdp_size",
    productId: product.id,
    productSlug: product.slug,
    prompt: isRu
      ? `Помоги выбрать размер ${product.name}. Сначала уточни необходимые параметры и сценарий посадки; не угадывай.`
      : `${product.name} үшін өлшем таңдауға көмектес. Алдымен қажетті параметрлер мен қоным сценарийін нақтыла; болжама.`,
    selectedColor: selected?.color,
    selectedSize: selected?.size,
    selectedVariantId: selected?.id,
  });
  const openClimateAssistant = useOpenAIAssistant({
    entryPoint: "pdp_climate",
    productId: product.id,
    productSlug: product.slug,
    prompt: isRu
      ? `Помоги оценить ${product.name} для моего климата и маршрута. Сначала спроси город, сезон, транспорт и время на улице; используй только подтверждённые данные товара.`
      : `${product.name} моделін менің климатым мен бағытыма бағалауға көмектес. Алдымен қала, маусым, көлік және сыртта болатын уақытты сұра; тек расталған тауар деректерін пайдалан.`,
    selectedColor: selected?.color,
    selectedSize: selected?.size,
    selectedVariantId: selected?.id,
  });

  function scrollToMedia(index: number) {
    const track = galleryTrackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
    setActiveMediaIndex(index);
  }

  function handleGalleryScroll() {
    const track = galleryTrackRef.current;
    if (!track || track.clientWidth === 0) return;
    const nextIndex = Math.max(
      0,
      Math.min(
        gallery.length - 1,
        Math.round(track.scrollLeft / track.clientWidth),
      ),
    );
    setActiveMediaIndex((current) =>
      current === nextIndex ? current : nextIndex,
    );
  }

  return (
    <section className="public-pdp" data-testid={`public-product-${product.slug}`}>
      <div className="public-pdp__layout">
        <div className="public-pdp__gallery">
          {gallery.length > 0 ? (
            <>
              <div
                aria-label={isRu ? "Галерея товара" : "Тауар галереясы"}
                aria-roledescription={isRu ? "карусель" : "карусель"}
                className="public-pdp__gallery-track"
                onScroll={handleGalleryScroll}
                ref={galleryTrackRef}
                role="region"
                tabIndex={0}
              >
                {gallery.map((item, index) => (
                  <figure className="public-pdp__slide" key={item.src}>
                    <Image
                      alt={item.alt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 960px) 100vw, 62vw"
                      src={item.src}
                    />
                  </figure>
                ))}
              </div>
              <button
                aria-label={
                  isRu
                    ? "Увеличить текущее изображение"
                    : "Ағымдағы суретті үлкейту"
                }
                className="public-pdp__zoom-trigger"
                onClick={() => setZoomOpen(true)}
                ref={zoomTriggerRef}
                type="button"
              >
                <span aria-hidden="true">＋</span>
                {isRu ? "УВЕЛИЧИТЬ" : "ҮЛКЕЙТУ"}
              </button>
              <p aria-live="polite" className="sr-only">
                {isRu ? "Изображение" : "Сурет"} {activeMediaIndex + 1} / {gallery.length}
              </p>
              {gallery.length > 1 ? (
                <div
                  aria-label={isRu ? "Миниатюры товара" : "Тауар нобайлары"}
                  className="public-pdp__thumbnails"
                  role="navigation"
                >
                  {gallery.map((item, index) => (
                    <button
                      aria-label={`${isRu ? "Показать изображение" : "Суретті көрсету"} ${index + 1}`}
                      aria-pressed={activeMediaIndex === index}
                      key={item.src}
                      onClick={() => scrollToMedia(index)}
                      type="button"
                    >
                      <Image
                        alt=""
                        fill
                        sizes="72px"
                        src={item.src}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="public-pdp__media-pending" role="status">
              <span>QULTURE / MEDIA</span>
              <strong>
                {isRu ? "Медиа готовится" : "Медиа дайындалуда"}
              </strong>
            </div>
          )}
        </div>

        <aside className="public-pdp__purchase">
          <nav aria-label={isRu ? "Навигация" : "Навигация"} className="public-pdp__breadcrumbs">
            <Link href={`/${locale}/shop`}>
              {isRu ? "Каталог" : "Каталог"}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{product.category}</span>
          </nav>

          <header className="public-pdp__head">
            <p className="q-meta">QULTURE / {product.category}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <div className="public-pdp__price">
              <strong>
                {price ?? (isRu ? "Цена уточняется" : "Бағасы нақтылануда")}
              </strong>
              {selected?.comparePriceMinor ? (
                <s>
                  {formatMoney(
                    selected.comparePriceMinor,
                    product.currency,
                    locale,
                  )}
                </s>
              ) : null}
            </div>
          </header>

          {colors.length > 0 ? (
            <fieldset className="public-pdp__option-group">
              <legend>
                {isRu ? "Цвет" : "Түс"}
                {selected ? <strong>{selected.color}</strong> : null}
              </legend>
              <div className="public-pdp__colors">
                {colors.map((color) => {
                  const backgroundColor = swatchBackground(color.code);
                  return (
                    <button
                      aria-label={color.label}
                      aria-pressed={selected?.colorCode === color.code}
                      key={color.code}
                      onClick={() => {
                        const variant = variantForColor(
                          product.variants,
                          color.code,
                          selected?.size,
                        );
                        if (variant) chooseVariant(variant);
                      }}
                      title={color.label}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        style={backgroundColor ? { backgroundColor } : undefined}
                      >
                        {!backgroundColor
                          ? color.code.slice(0, 2).toUpperCase()
                          : null}
                      </span>
                      <small>{color.label}</small>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {variantsForColor.length > 0 ? (
            <fieldset className="public-pdp__option-group">
              <legend>
                {isRu ? "Размер" : "Өлшем"}
                {selected ? <strong>{selected.size}</strong> : null}
              </legend>
              <div className="public-pdp__sizes">
                {variantsForColor.map((variant) => (
                  <button
                    aria-describedby={`availability-${variant.id}`}
                    aria-pressed={variant.id === selectedId}
                    className={
                      variant.availability === "unavailable"
                        ? "is-unavailable"
                        : undefined
                    }
                    key={variant.id}
                    onClick={() => chooseVariant(variant)}
                    type="button"
                  >
                    {variant.size}
                    <span className="sr-only" id={`availability-${variant.id}`}>
                      {availabilityText(variant.availability, locale)}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="q-status" data-kind="error" role="status">
              {isRu
                ? "Варианты товара пока не опубликованы."
                : "Тауар нұсқалары әзірге жарияланбаған."}
            </p>
          )}

          <div className="public-pdp__availability" role="status">
            <span
              aria-hidden="true"
              data-state={selected?.availability ?? "unavailable"}
            />
            <p>
              <strong>
                {selected
                  ? availabilityText(selected.availability, locale)
                  : isRu
                    ? "Вариант не выбран"
                    : "Нұсқа таңдалмаған"}
              </strong>
              {etaLabel
                ? `${isRu ? "Ожидаемая дата" : "Күтілетін күн"}: ${etaLabel}`
                : selected?.leadTimeDays
                  ? `${isRu ? "Срок подготовки" : "Дайындау мерзімі"}: ${selected.leadTimeDays} ${isRu ? "дн." : "күн"}`
                  : null}
            </p>
          </div>

          <div className="public-pdp__ai-actions">
            <button onClick={() => openSizeAssistant()} type="button">
              <span>AI</span>
              {isRu ? "Помочь с размером" : "Өлшемге көмектесу"}
            </button>
            <button onClick={() => openClimateAssistant()} type="button">
              <span>AI</span>
              {isRu ? "Проверить сценарий климата" : "Климат сценарийін тексеру"}
            </button>
          </div>

          {selected?.availability === "unavailable" ? (
            <Link
              className="q-button q-button--solid public-pdp__restock"
              href={restockWaitlistHref(locale, product.id, selected.id)}
            >
              {isRu ? "Сообщить о поступлении" : "Қайта түскенде хабарлау"}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button
              className="q-button q-button--solid public-pdp__add"
              disabled={!canAdd}
              onClick={() => addSelectedVariant()}
              type="button"
            >
              {selected?.availability === "preorder"
                ? isRu
                  ? "Добавить предзаказ"
                  : "Алдын ала тапсырысты қосу"
                : isRu
                  ? "Добавить в корзину"
                  : "Себетке қосу"}
              <span aria-hidden="true">→</span>
            </button>
          )}

          {!canAdd && selected?.availability !== "unavailable" ? (
            <p className="q-status" data-kind="error">
              {selected?.priceMinor === null || product.currency !== "KZT"
                ? isRu
                  ? "Покупка станет доступна после публикации цены."
                  : "Баға жарияланғаннан кейін сатып алуға болады."
                : isRu
                  ? "Выбранный вариант сейчас нельзя добавить в корзину."
                  : "Таңдалған нұсқаны қазір себетке қосу мүмкін емес."}
            </p>
          ) : null}
          <p aria-live="polite" className="q-status" data-kind="success">
            {notice}
          </p>

          <div className="public-pdp__service-summary">
            <article>
              <span>01</span>
              <div>
                <strong>{isRu ? "Оплата" : "Төлем"}</strong>
                <p>
                  {paymentEnabled
                    ? isRu
                      ? "Доступные способы будут показаны до подтверждения заказа."
                      : "Қолжетімді тәсілдер тапсырыс расталғанға дейін көрсетіледі."
                    : isRu
                      ? "Production-оплата ещё не подключена. Добавление в корзину не списывает деньги."
                      : "Production төлемі әлі қосылмаған. Себетке қосқанда ақша алынбайды."}
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <strong>{isRu ? "Доставка" : "Жеткізу"}</strong>
                <p>
                  {deliveryEnabled
                    ? isRu
                      ? "Способ, срок и стоимость будут показаны до подтверждения заказа."
                      : "Тәсіл, мерзім және құны тапсырыс расталғанға дейін көрсетіледі."
                    : isRu
                      ? "Production-доставка ещё не подключена. Актуальная политика опубликована отдельно."
                      : "Production жеткізуі әлі қосылмаған. Өзекті саясат бөлек жарияланған."}
                </p>
                <Link href={`/${locale}/delivery-and-returns`}>
                  {isRu ? "Условия доставки и возврата" : "Жеткізу және қайтару шарттары"}
                </Link>
              </div>
            </article>
          </div>

          {product.buildSetSlug ? (
            <Link
              className="public-pdp__set-link"
              href={`/${locale}/build-a-set?bundle=${encodeURIComponent(product.buildSetSlug)}`}
            >
              <span>{isRu ? "МОДУЛЬНАЯ СИСТЕМА" : "МОДУЛЬДІК ЖҮЙЕ"}</span>
              <strong>{isRu ? "Собрать комплект" : "Жинақ құру"}</strong>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}

          {selected ? (
            <p className="public-pdp__sku">SKU {selected.sku}</p>
          ) : null}
        </aside>
      </div>

      {product.technologyTags.length > 0 || product.care ? (
        <section
          aria-label={isRu ? "Информация о товаре" : "Тауар туралы ақпарат"}
          className="public-pdp__merchandising"
        >
          {product.technologyTags.length > 0 ? (
            <article>
              <p className="q-meta">01 / {isRu ? "ТЕХНОЛОГИИ" : "ТЕХНОЛОГИЯЛАР"}</p>
              <h2>{isRu ? "Опубликованные свойства" : "Жарияланған қасиеттер"}</h2>
              <ul>
                {product.technologyTags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ) : null}
          {product.care ? (
            <article>
              <p className="q-meta">02 / {isRu ? "УХОД" : "КҮТІМ"}</p>
              <h2>{isRu ? "Как ухаживать" : "Күтім жасау"}</h2>
              <p>{product.care}</p>
            </article>
          ) : null}
        </section>
      ) : null}

      {zoomOpen && activeMedia ? (
        <div
          aria-labelledby="public-pdp-zoom-title"
          aria-modal="true"
          className="public-pdp-zoom"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeZoom();
          }}
          ref={zoomDialogRef}
          role="dialog"
        >
          <div className="public-pdp-zoom__head">
            <h2 id="public-pdp-zoom-title">{product.name}</h2>
            <button
              aria-label={isRu ? "Закрыть изображение" : "Суретті жабу"}
              onClick={closeZoom}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="public-pdp-zoom__image">
            <Image
              alt={activeMedia.alt}
              fill
              priority
              sizes="100vw"
              src={activeMedia.src}
            />
          </div>
          {gallery.length > 1 ? (
            <div className="public-pdp-zoom__controls">
              <button
                disabled={activeMediaIndex === 0}
                onClick={() => setActiveMediaIndex((index) => Math.max(0, index - 1))}
                type="button"
              >
                ← {isRu ? "Назад" : "Артқа"}
              </button>
              <span>{activeMediaIndex + 1} / {gallery.length}</span>
              <button
                disabled={activeMediaIndex === gallery.length - 1}
                onClick={() =>
                  setActiveMediaIndex((index) =>
                    Math.min(gallery.length - 1, index + 1),
                  )
                }
                type="button"
              >
                {isRu ? "Далее" : "Келесі"} →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
