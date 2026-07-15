import Link from "next/link";

import {
  PublicProductCard,
  type PublicProductCardColor,
  type PublicProductCardOption,
  type PublicProductCardQuickVariant,
} from "@/components/commerce/public-product-card";

import type {
  PublicBundleView,
  PublicCatalogLocale,
  PublicCollectionSummary,
  PublicProductView,
} from "@/lib/commerce/public-catalog";

type PublicCatalogPageProps = {
  locale: PublicCatalogLocale;
  products: PublicProductView[];
  collections?: PublicCollectionSummary[];
  bundles?: PublicBundleView[];
  title?: string;
  description?: string | null;
  eyebrow?: string;
  searchOpen?: boolean;
  searchQuery?: string;
};

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

function priceLabel(
  product: PublicProductView,
  locale: PublicCatalogLocale,
): string {
  if (product.priceFromMinor === null) {
    return locale === "ru" ? "Цена уточняется" : "Бағасы нақтылануда";
  }
  if (
    product.priceToMinor !== null &&
    product.priceToMinor !== product.priceFromMinor
  ) {
    return `${formatMoney(product.priceFromMinor, product.currency, locale)} – ${formatMoney(product.priceToMinor, product.currency, locale)}`;
  }
  return formatMoney(product.priceFromMinor, product.currency, locale);
}

function availabilityLabel(
  product: PublicProductView,
  locale: PublicCatalogLocale,
): string {
  const hasStock = product.variants.some(
    (variant) =>
      variant.availability === "in_stock" ||
      variant.availability === "low_stock",
  );
  if (hasStock) return locale === "ru" ? "В наличии" : "Қолда бар";
  const hasPreorder = product.variants.some(
    (variant) => variant.availability === "preorder",
  );
  if (hasPreorder) return locale === "ru" ? "Предзаказ" : "Алдын ала тапсырыс";
  if (product.variants.length === 0 || product.priceFromMinor === null) {
    return locale === "ru" ? "Скоро" : "Жақында";
  }
  return locale === "ru" ? "Нет в наличии" : "Сатылып кетті";
}

function ProductCard({
  locale,
  product,
}: {
  locale: PublicCatalogLocale;
  product: PublicProductView;
}) {
  const sizeMap = new Map<string, PublicProductCardOption>();
  const colorMap = new Map<string, PublicProductCardColor>();
  const cardMedia: PublicProductView["media"] = [];
  const cardMediaSources = new Set<string>();
  const quickVariants: PublicProductCardQuickVariant[] = [];

  function appendCardMedia(items: PublicProductView["media"]): void {
    for (const item of items) {
      if (cardMedia.length >= 2) return;
      if (cardMediaSources.has(item.src)) continue;
      cardMediaSources.add(item.src);
      cardMedia.push(item);
    }
  }

  appendCardMedia(product.media);
  for (const variant of product.variants) {
    const available = variant.canAddToCart;
    const currentSize = sizeMap.get(variant.size);
    sizeMap.set(variant.size, {
      label: variant.size,
      available: available || currentSize?.available === true,
    });

    const colorKey = `${variant.colorCode}:${variant.color}`;
    const currentColor = colorMap.get(colorKey);
    colorMap.set(colorKey, {
      code: variant.colorCode,
      label: variant.color,
      available: available || currentColor?.available === true,
    });
    appendCardMedia(variant.media);
    if (variant.canAddToCart && variant.priceMinor !== null) {
      const variantMedia = variant.media[0] ?? product.media[0];
      quickVariants.push({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        unitPrice: variant.priceMinor,
        availability:
          variant.availability === "preorder"
            ? "preorder"
            : variant.availability === "low_stock"
              ? "low_stock"
              : "in_stock",
        eta: variant.incomingEta ?? product.preorderEta ?? undefined,
        mediaSrc: variantMedia?.src,
        mediaAlt: variantMedia?.alt,
      });
    }
  }

  return (
    <PublicProductCard
      availability={availabilityLabel(product, locale)}
      canSelectSize={product.hasPurchasableVariant}
      category={product.category}
      colors={[...colorMap.values()]}
      locale={locale}
      media={cardMedia}
      name={product.name}
      price={priceLabel(product, locale)}
      productId={product.id}
      quickVariants={quickVariants}
      role={product.role}
      sizes={[...sizeMap.values()]}
      slug={product.slug}
    />
  );
}

export function PublicCatalogPage({
  locale,
  products,
  collections = [],
  bundles = [],
  title,
  description,
  eyebrow = "QULTURE / CATALOG",
  searchOpen = false,
  searchQuery = "",
}: PublicCatalogPageProps) {
  const isRu = locale === "ru";
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase(locale === "ru" ? "ru" : "kk");
  const visibleProducts = normalizedQuery
    ? products.filter((product) =>
        [
          product.name,
          product.description,
          product.category,
          ...product.technologyTags,
          ...product.variants.flatMap((variant) => [variant.color, variant.size]),
        ].some((value) => value.toLocaleLowerCase(locale === "ru" ? "ru" : "kk").includes(normalizedQuery)),
      )
    : products;
  return (
    <section className="demo-shop" data-testid="public-catalog">
      <header className="demo-shop__header">
        <div>
          <p className="q-meta">{eyebrow}</p>
          <h1 className="q-display q-display--medium">
            {title ?? (isRu ? "Каталог" : "Каталог")}
          </h1>
        </div>
        <p>
          {description ??
            (isRu
              ? "Опубликованные модули QULTURE. Доступность и цена зависят от выбранного варианта."
              : "QULTURE жарияланған модульдері. Қолжетімділік пен баға таңдалған нұсқаға байланысты.")}
        </p>
      </header>

      {searchOpen ? (
        <form action={`/${locale}/shop`} className="public-catalog-search" method="get" role="search">
          <label htmlFor="catalog-search">
            {isRu ? "Поиск по опубликованному каталогу" : "Жарияланған каталогтан іздеу"}
          </label>
          <span>
            <input
              autoComplete="off"
              defaultValue={searchQuery}
              id="catalog-search"
              maxLength={80}
              name="q"
              placeholder={isRu ? "Название, цвет или размер" : "Атауы, түсі немесе өлшемі"}
              type="search"
            />
            <button type="submit">{isRu ? "Найти" : "Іздеу"}</button>
          </span>
        </form>
      ) : null}

      <nav
        aria-label={isRu ? "Разделы каталога" : "Каталог бөлімдері"}
        className="demo-shop__tools"
      >
        <span>
          {visibleProducts.length.toString().padStart(2, "0")} {isRu ? "ТОВАРОВ" : "ТАУАР"}
        </span>
        {collections.map((collection) => (
          <Link href={`/${locale}/collections/${collection.slug}`} key={collection.slug}>
            {collection.name} <span aria-hidden="true">→</span>
          </Link>
        ))}
        {bundles[0] ? (
          <Link href={`/${locale}/build-a-set?bundle=${encodeURIComponent(bundles[0].slug)}`}>
            {isRu ? "СОБРАТЬ КОМПЛЕКТ" : "ЖИНТЫҚ ҚҰРУ"} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </nav>

      {visibleProducts.length > 0 ? (
        <div className="demo-shop__grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} locale={locale} product={product} />
          ))}
        </div>
      ) : (
        <div className="demo-shop__header" role="status">
          <div>
            <p className="q-meta">QULTURE / CATALOG STATUS</p>
            <h2>
              {normalizedQuery
                ? isRu
                  ? "Ничего не найдено"
                  : "Ештеңе табылмады"
                : isRu
                  ? "Опубликованных товаров пока нет"
                  : "Әзірге жарияланған тауарлар жоқ"}
            </h2>
          </div>
          <p>
            {normalizedQuery
              ? isRu
                ? `В опубликованном каталоге нет совпадений для «${searchQuery}».`
                : `Жарияланған каталогта «${searchQuery}» сұрауына сәйкестік жоқ.`
              : isRu
                ? "Каталог откроется здесь после публикации товаров командой QULTURE."
                : "QULTURE командасы тауарларды жариялағаннан кейін каталог осы жерде ашылады."}
          </p>
        </div>
      )}
    </section>
  );
}
