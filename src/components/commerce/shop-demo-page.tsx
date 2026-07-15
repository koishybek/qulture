import Link from "next/link";

import type { DemoProductView } from "@/lib/commerce/catalog";
import { commerceText, type CommerceLocale } from "@/lib/commerce/locale";

import { DemoProductCard } from "./demo-product-card";

export function ShopDemoPage({
  locale,
  products,
  collectionName,
}: {
  locale: CommerceLocale;
  products: DemoProductView[];
  collectionName?: string;
}) {
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);
  return (
    <section className="demo-shop">
      <div className="demo-rail">DEMO CATALOG — NO PUBLIC SALE</div>
      <header className="demo-shop__header">
        <div>
          <p className="q-meta">QULTURE / ISOLATED COMMERCE</p>
          <h1 className="q-display q-display--medium">
            {collectionName ?? t("Test catalogue", "Тестовый каталог", "Сынақ каталогы")}
          </h1>
        </div>
        <p>
          {t(
            "Seeded demo fixtures only. Prices and stock are visible here exclusively for smoke testing.",
            "Только seeded demo-fixtures. Цены и наличие видимы здесь исключительно для smoke-теста.",
            "Тек seed demo-fixtures. Баға мен қор мұнда тек smoke-тест үшін көрсетіледі.",
          )}
        </p>
      </header>
      <div className="demo-shop__tools">
        <span>{products.length.toString().padStart(2, "0")} DEMO ITEMS</span>
        <Link href={`/${locale}/build-a-set?demo=1`}>BUILD A SET <span aria-hidden="true">→</span></Link>
      </div>
      <div className="demo-shop__grid">
        {products.map((product, index) => <DemoProductCard key={product.id} locale={locale} priority={index === 0} product={product} />)}
      </div>
    </section>
  );
}
