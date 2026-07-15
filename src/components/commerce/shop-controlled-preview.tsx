import Image from "next/image";
import Link from "next/link";

export function ShopControlledPreview({
  locale,
  context = "shop",
  searchRequested = false,
}: {
  locale: "ru" | "kz";
  context?: "shop" | "collection" | "product" | "set";
  searchRequested?: boolean;
}) {
  const isRu = locale === "ru";
  const labels = {
    shop: isRu ? "Система одежды" : "Киім жүйесі",
    collection: isRu ? "City Layer" : "City Layer",
    product: isRu ? "Предварительный просмотр" : "Алдын ала қарау",
    set: isRu ? "Соберите комплект" : "Жиынтық құрыңыз",
  };

  return (
    <section className="commerce-preview">
      <div className="commerce-preview__copy">
        <p className="q-meta">QULTURE / CONTROLLED PREVIEW</p>
        <h1 className="q-display q-display--medium">{labels[context]}</h1>
        <p className="q-lead">
          {isRu
            ? "Каталог ещё не открыт для продаж. Мы показываем направление системы без неподтверждённых цен, остатков и дат запуска."
            : "Каталог сатылымға әлі ашылған жоқ. Бағытты расталмаған баға, қор және іске қосу күндерінсіз көрсетеміз."}
        </p>
        <div className="commerce-preview__actions">
          <Link className="q-button q-button--solid" href={`/${locale}#waitlist`}>
            {isRu ? "В лист ожидания" : "Күту тізіміне"}
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="q-text-link" href={`/${locale}/technology`}>
            {isRu ? "Изучить систему" : "Жүйені зерттеу"}
          </Link>
        </div>
        {searchRequested ? (
          <p className="q-status" role="status">
            {isRu
              ? "Поиск станет доступен после публикации проверенного каталога. Сейчас ни один товар не скрывается за пустой выдачей."
              : "Іздеу тексерілген каталог жарияланғаннан кейін қолжетімді болады. Қазір бос нәтиженің артында жасырылған тауар жоқ."}
          </p>
        ) : null}
      </div>
      <div className="commerce-preview__visual" aria-hidden="true">
        <Image
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          src="/media/hero/hero-poster.png"
        />
        <span>{isRu ? "Продажи закрыты" : "Сатылым жабық"}</span>
      </div>
      <div className="commerce-preview__system" aria-label={isRu ? "Будущая система" : "Болашақ жүйе"}>
        <article><span>01</span><h2>CITY LAYER SET</h2><p>{isRu ? "Единая городская система" : "Біртұтас қалалық жүйе"}</p></article>
        <article><span>02</span><h2>TOP LAYER</h2><p>{isRu ? "Верхний модуль системы" : "Жүйенің үстіңгі модулі"}</p></article>
        <article><span>03</span><h2>URBAN TROUSERS</h2><p>{isRu ? "Нижний модуль системы" : "Жүйенің төменгі модулі"}</p></article>
      </div>
    </section>
  );
}
