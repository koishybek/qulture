import Image from "next/image";
import Link from "next/link";

import { commerceText, type CommerceLocale } from "@/lib/commerce/locale";

export function ShopControlledPreview({
  locale,
  context = "shop",
  searchRequested = false,
}: {
  locale: CommerceLocale;
  context?: "shop" | "collection" | "product" | "set";
  searchRequested?: boolean;
}) {
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);
  const labels = {
    shop: t("The QULTURE system", "Система одежды", "Киім жүйесі"),
    collection: "City Layer",
    product: t("Product preview", "Предварительный просмотр", "Алдын ала қарау"),
    set: t("Build your set", "Соберите комплект", "Жинақ құрыңыз"),
  };

  return (
    <section className="commerce-preview">
      <div className="commerce-preview__copy">
        <p className="q-meta">QULTURE / CONTROLLED PREVIEW</p>
        <h1 className="q-display q-display--medium">{labels[context]}</h1>
        <p className="q-lead">
          {t(
            "The catalogue is not open for sale yet. We are sharing the direction of the system without unverified prices, stock levels or launch dates.",
            "Каталог ещё не открыт для продаж. Мы показываем направление системы без неподтверждённых цен, остатков и дат запуска.",
            "Каталог сатылымға әлі ашылған жоқ. Бағытты расталмаған баға, қор және іске қосылу күндерінсіз көрсетеміз.",
          )}
        </p>
        <div className="commerce-preview__actions">
          <Link className="q-button q-button--solid" href={`/${locale}#waitlist`}>
            {t("Join the waitlist", "В лист ожидания", "Күту тізіміне")}
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="q-text-link" href={`/${locale}/technology`}>
            {t("Explore the system", "Изучить систему", "Жүйені зерттеу")}
          </Link>
        </div>
        {searchRequested ? (
          <p className="q-status" role="status">
            {t(
              "Search will be available once the verified catalogue is published. No product is being hidden behind an empty result today.",
              "Поиск станет доступен после публикации проверенного каталога. Сейчас ни один товар не скрывается за пустой выдачей.",
              "Іздеу тексерілген каталог жарияланғаннан кейін қолжетімді болады. Қазір бос нәтижелердің артында жасырылған тауар жоқ.",
            )}
          </p>
        ) : null}
      </div>
      <div className="commerce-preview__visual" aria-hidden="true">
        <Image alt="" fill priority sizes="(max-width: 900px) 100vw, 50vw" src="/media/hero/hero-poster.png" />
        <span>{t("Sales closed", "Продажи закрыты", "Сатылым жабық")}</span>
      </div>
      <div className="commerce-preview__system" aria-label={t("Future system", "Будущая система", "Болашақ жүйе")}>
        <article><span>01</span><h2>CITY LAYER SET</h2><p>{t("One urban system", "Единая городская система", "Біртұтас қалалық жүйе")}</p></article>
        <article><span>02</span><h2>TOP LAYER</h2><p>{t("The upper module", "Верхний модуль системы", "Жүйенің үстіңгі модулі")}</p></article>
        <article><span>03</span><h2>URBAN TROUSERS</h2><p>{t("The lower module", "Нижний модуль системы", "Жүйенің төменгі модулі")}</p></article>
      </div>
    </section>
  );
}
