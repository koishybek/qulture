import Link from "next/link";

import type { DemoProductView } from "@/lib/commerce/catalog";

import { DemoProductCard } from "./demo-product-card";

export function ShopDemoPage({
  locale,
  products,
  collectionName,
}: {
  locale: "ru" | "kz";
  products: DemoProductView[];
  collectionName?: string;
}) {
  const isRu = locale === "ru";
  return (
    <section className="demo-shop">
      <div className="demo-rail">DEMO CATALOG — NO PUBLIC SALE</div>
      <header className="demo-shop__header">
        <div>
          <p className="q-meta">QULTURE / ISOLATED COMMERCE</p>
          <h1 className="q-display q-display--medium">
            {collectionName ?? (isRu ? "Тестовый каталог" : "Сынақ каталогы")}
          </h1>
        </div>
        <p>
          {isRu
            ? "Только сидированные demo-fixtures. Цены и наличие видимы здесь исключительно для smoke-теста."
            : "Тек seed demo-fixtures. Баға мен қор мұнда тек smoke-тест үшін көрсетіледі."}
        </p>
      </header>
      <div className="demo-shop__tools">
        <span>{products.length.toString().padStart(2, "0")} DEMO ITEMS</span>
        <Link href={`/${locale}/build-a-set?demo=1`}>
          BUILD A SET <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="demo-shop__grid">
        {products.map((product, index) => (
          <DemoProductCard key={product.id} locale={locale} priority={index === 0} product={product} />
        ))}
      </div>
    </section>
  );
}
