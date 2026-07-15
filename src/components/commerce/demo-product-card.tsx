import Image from "next/image";
import Link from "next/link";

import type { DemoProductView } from "@/lib/commerce/catalog";
import { commerceIntlLocale, commerceText, type CommerceLocale } from "@/lib/commerce/locale";

function formatKzt(amount: number, locale: CommerceLocale): string {
  return new Intl.NumberFormat(commerceIntlLocale(locale), {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DemoProductCard({
  product,
  locale,
  priority = false,
}: {
  product: DemoProductView;
  locale: CommerceLocale;
  priority?: boolean;
}) {
  const available = product.variants.reduce((sum, item) => sum + item.available, 0);
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);
  return (
    <article className="demo-product-card" data-testid={`demo-product-${product.slug}`}>
      <Link
        aria-label={`${t("Open demo product", "Открыть demo-товар", "Demo тауарын ашу")}: ${product.name}`}
        className="demo-product-card__media"
        href={`/${locale}/product/${product.slug}?demo=1`}
      >
        <Image alt={`${t("Demo image", "Demo-изображение", "Demo суреті")}: ${product.name}`} fill priority={priority} sizes="(max-width: 720px) 100vw, 50vw" src="/media/hero/hero-poster.png" />
        <span>DEMO FIXTURE</span>
      </Link>
      <div className="demo-product-card__body"><div><p className="q-meta">{product.category}</p><h2>{product.name}</h2></div><strong>{formatKzt(product.price, locale)}</strong></div>
      <div className="demo-product-card__foot"><span>{product.variants.map((variant) => variant.size).join(" / ")}</span><span>{available > 0 ? `${available} DEMO UNITS` : "DEMO UNAVAILABLE"}</span></div>
    </article>
  );
}
