import { cache } from "react";

import type { Localized, Locale } from "@/lib/i18n";
import type { ContentSection, EditorialPage, JournalArticle } from "./types";

export const journalIndexContent: Localized<EditorialPage> = {
  ru: {
    seo: {
      title: "Журнал разработки",
      description:
        "Проверяемые заметки о разработке продукта, цифровой системы и запуске QULTURE без выдуманных сроков и характеристик.",
    },
    eyebrow: "JOURNAL / PROGRESS",
    title: "Показываем процесс без готовых легенд",
    lead:
      "Здесь появляются только содержательные обновления: что уже решено, что проверяется и какие данные всё ещё нужны до запуска.",
    status: "Pre-launch journal",
    sections: [],
  },
  kz: {
    seo: {
      title: "Әзірлеу журналы",
      description:
        "QULTURE өнімі, цифрлық жүйесі және іске қосылуы туралы ойдан шығарылған мерзім мен сипаттамасыз тексерілетін жазбалар.",
    },
    eyebrow: "JOURNAL / PROGRESS",
    title: "Үдерісті дайын аңызсыз көрсетеміз",
    lead:
      "Мұнда мазмұнды жаңарту ғана шығады: не шешілді, не тексеріліп жатыр және іске қосылуға дейін қандай дерек әлі қажет.",
    status: "Pre-launch journal",
    sections: [],
  },
};

const progressArticle: Localized<JournalArticle> = {
  ru: {
    slug: "building-qulture-openly",
    seo: {
      title: "Создаём QULTURE открыто: этап pre-launch",
      description:
        "Честная заметка о текущем этапе QULTURE: что уже заложено в систему и какие данные ещё нельзя публиковать.",
    },
    eyebrow: "PROGRESS NOTE / 001",
    title: "Создаём QULTURE открыто",
    excerpt:
      "Что уже заложено в продуктовую и цифровую основу — и почему до проверки здесь не будет выдуманных цен, свойств и дат.",
    publishedAt: "2026-07-15T00:00:00.000Z",
    readingMinutes: 4,
    author: "QULTURE",
    isFallback: true,
    sections: [
      {
        id: "current-stage",
        title: "Текущий этап",
        paragraphs: [
          "QULTURE находится в разработке. Сейчас формируется основа будущего продукта и магазина: локализованный сайт, контентная модель, правила работы с данными, продуктовая архитектура и консультант, который обязан признавать границы своих знаний.",
          "Каталог ещё не опубликован. На сайте нет реальных цен, остатков, состава, температурных диапазонов или даты запуска, потому что эти сведения должны появиться из утверждённых источников, а не из макета.",
        ],
      },
      {
        id: "what-is-built",
        title: "Что уже определено на уровне системы",
        paragraphs: [
          "Первый продуктовый фокус — городской верх и брюки. Система проектируется так, чтобы каждый компонент можно было выбрать отдельно, а в комплекте — указать разные размеры верха и низа.",
          "Русская и казахская версии существуют как полноценные отдельные поля. Английская версия предусмотрена архитектурно, но останется скрытой до готовности контента и операций.",
        ],
        bullets: [
          "Один pre-launch и commerce-контур без будущей пересборки сайта.",
          "Разделение сервисных уведомлений и маркетингового согласия.",
          "Источник и версия для продуктовых, policy- и AI-ответов.",
          "Статический контент как безопасный fallback, если база временно недоступна.",
        ],
      },
      {
        id: "why-no-demo-store",
        title: "Почему мы не изображаем готовый магазин",
        paragraphs: [
          "Демонстрационная цена или карточка без подтверждённого товара выглядит убедительно, но создаёт неверные ожидания. Поэтому pre-launch версия показывает направление, процесс и статус — без фейковых отзывов, остатков и обещаний.",
          "То же правило действует для технологии: сценарий использования появится только вместе с составом, замерами, fit-тестом и описанием ограничений. Плотность ткани сама по себе не превращается в температурный рейтинг.",
        ],
      },
      {
        id: "release-gates",
        title: "Что должно произойти до торговли",
        paragraphs: [
          "Commerce-режим включится не по красивой дате, а после прохождения конкретных контрольных точек. Их статус будет обновляться по мере решений команды.",
        ],
        bullets: [
          "Утверждены товары, варианты, цены, остатки и данные о посадке.",
          "Проверены состав, уход, допустимые заявления и визуальные материалы.",
          "Выбраны продавец, платёжный и delivery-провайдеры, правила предзаказа.",
          "Утверждены оферта, privacy, consent, доставка и возврат.",
          "Проверены ключевые сценарии на desktop и mobile, включая доступность.",
        ],
      },
      {
        id: "next-notes",
        title: "О чём будут следующие заметки",
        paragraphs: [
          "Дальше Journal будет фиксировать только тот прогресс, который можно показать предметно: устройство размерной логики, протокол проверки материалов, работу комплекта и решения, принятые перед открытием commerce.",
          "Если факт ещё не подтверждён, он останется вопросом, а не превратится в маркетинговую формулировку.",
        ],
      },
    ],
  },
  kz: {
    slug: "building-qulture-openly",
    seo: {
      title: "QULTURE-ді ашық жасап жатырмыз: pre-launch кезеңі",
      description:
        "QULTURE-дің қазіргі кезеңі туралы ашық жазба: жүйеде не бар және қандай деректі әзірге жариялауға болмайды.",
    },
    eyebrow: "PROGRESS NOTE / 001",
    title: "QULTURE-ді ашық жасап жатырмыз",
    excerpt:
      "Өнім мен цифрлық негізге не енгізілді және тексерілгенге дейін мұнда неге ойдан шығарылған баға, қасиет және күн болмайды.",
    publishedAt: "2026-07-15T00:00:00.000Z",
    readingMinutes: 4,
    author: "QULTURE",
    isFallback: true,
    sections: [
      {
        id: "current-stage",
        title: "Қазіргі кезең",
        paragraphs: [
          "QULTURE әзірленіп жатыр. Қазір болашақ өнім мен дүкеннің негізі жасалуда: локализацияланған сайт, контент моделі, дерекпен жұмыс ережесі, өнім архитектурасы және өз білімінің шегін мойындауға міндетті кеңесші.",
          "Каталог әлі жарияланған жоқ. Сайтта нақты баға, қалдық, құрам, температура диапазоны немесе іске қосылу күні жоқ, өйткені бұл мәлімет макеттен емес, бекітілген дереккөзден шығуы тиіс.",
        ],
      },
      {
        id: "what-is-built",
        title: "Жүйе деңгейінде не анықталды",
        paragraphs: [
          "Алғашқы өнім бағыты — қалалық үстіңгі бөлік пен шалбар. Жүйе әр компонентті бөлек таңдауға, ал жиынтықта үстіңгі және астыңғы өлшемдерді тәуелсіз белгілеуге бейімделеді.",
          "Орыс және қазақ нұсқалары толыққанды бөлек өрістер ретінде жасалған. Ағылшын нұсқасы архитектурада қарастырылған, бірақ контент пен операция дайын болғанша жасырын қалады.",
        ],
        bullets: [
          "Сайтты кейін қайта құрмайтын бір pre-launch және commerce контуры.",
          "Сервистік хабарлама мен маркетинг келісімін бөлу.",
          "Өнім, policy және AI жауабы үшін дереккөз бен нұсқа.",
          "Дерекқор уақытша қолжетімсіз болса, қауіпсіз статикалық fallback.",
        ],
      },
      {
        id: "why-no-demo-store",
        title: "Неге дайын дүкенді көрсетпейміз",
        paragraphs: [
          "Расталмаған демонстрациялық баға немесе карточка сенімді көрінгенімен, қате үміт тудырады. Сондықтан pre-launch нұсқасы жалған пікір, қалдық және уәдесіз бағытты, үдерісті және мәртебені көрсетеді.",
          "Бұл ереже технологияға да қатысты: қолдану сценарийі құрам, өлшем, пішім сынағы және шектеу сипаттамасымен бірге ғана пайда болады. Матаның тығыздығы өздігінен температура рейтингіне айналмайды.",
        ],
      },
      {
        id: "release-gates",
        title: "Саудаға дейін не болуы керек",
        paragraphs: [
          "Commerce режимі әдемі күнге қарап емес, нақты бақылау кезеңдерінен кейін қосылады. Олардың мәртебесі команда шешім қабылдаған сайын жаңартылады.",
        ],
        bullets: [
          "Тауар, нұсқа, баға, қалдық және пішім деректері бекітілген.",
          "Құрам, күтім, рұқсат етілетін мәлімдеме және визуал тексерілген.",
          "Сатушы, төлем және delivery провайдерлері, алдын ала тапсырыс ережесі таңдалған.",
          "Оферта, privacy, consent, жеткізу және қайтару бекітілген.",
          "Desktop және mobile негізгі сценарийлері, соның ішінде қолжетімділік тексерілген.",
        ],
      },
      {
        id: "next-notes",
        title: "Келесі жазбалар не туралы болады",
        paragraphs: [
          "Journal бұдан әрі заттай көрсетуге болатын ілгерілеуді ғана тіркейді: өлшем логикасының құрылысы, материал тексеру хаттамасы, жиынтық жұмысы және commerce ашылғанға дейін қабылданған шешімдер.",
          "Факт әлі расталмаса, маркетинг тұжырымына айналмай, сұрақ болып қалады.",
        ],
      },
    ],
  },
};

const staticArticles: Localized<readonly JournalArticle[]> = {
  ru: [progressArticle.ru],
  kz: [progressArticle.kz],
};

type JournalRecord = {
  slug: string;
  titleRu: string;
  titleKz: string;
  excerptRu: string;
  excerptKz: string;
  contentRu: string;
  contentKz: string;
  coverImage: string | null;
  author: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  seoTitleRu: string | null;
  seoTitleKz: string | null;
  seoDescriptionRu: string | null;
  seoDescriptionKz: string | null;
};

function plainContentSection(locale: Locale, value: string): readonly ContentSection[] {
  const paragraphs = value
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return [
    {
      id: "article",
      title: locale === "ru" ? "Материал" : "Материал",
      paragraphs: paragraphs.length > 0 ? paragraphs : [locale === "ru" ? "Материал готовится." : "Материал дайындалып жатыр."],
    },
  ];
}

function recordToArticle(record: JournalRecord, locale: Locale): JournalArticle {
  const staticMatch = staticArticles[locale].find((article) => article.slug === record.slug);
  const title = locale === "ru" ? record.titleRu : record.titleKz;
  const excerpt = locale === "ru" ? record.excerptRu : record.excerptKz;
  const body = locale === "ru" ? record.contentRu : record.contentKz;
  const seoTitle = locale === "ru" ? record.seoTitleRu : record.seoTitleKz;
  const seoDescription =
    locale === "ru" ? record.seoDescriptionRu : record.seoDescriptionKz;

  return {
    slug: record.slug,
    title,
    excerpt,
    eyebrow: staticMatch?.eyebrow ?? "JOURNAL",
    publishedAt: (record.publishedAt ?? record.updatedAt).toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    readingMinutes: staticMatch?.readingMinutes ?? Math.max(1, Math.ceil(body.split(/\s+/u).length / 180)),
    author: record.author ?? staticMatch?.author,
    coverImage: record.coverImage ?? staticMatch?.coverImage,
    isFallback: false,
    seo: {
      title: seoTitle ?? staticMatch?.seo.title ?? title,
      description: seoDescription ?? staticMatch?.seo.description ?? excerpt,
    },
    // The seed entry intentionally carries a short database summary. The
    // structured progress note remains its approved static long-form body.
    sections: staticMatch?.sections ?? plainContentSection(locale, body),
  };
}

export const getJournalArticles = cache(async (locale: Locale): Promise<readonly JournalArticle[]> => {
  try {
    const { db } = await import("@/lib/db");
    const records = await db.journalArticle.findMany({
      where: { status: "PUBLISHED", isDemo: false },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        titleRu: true,
        titleKz: true,
        excerptRu: true,
        excerptKz: true,
        contentRu: true,
        contentKz: true,
        coverImage: true,
        author: true,
        publishedAt: true,
        updatedAt: true,
        seoTitleRu: true,
        seoTitleKz: true,
        seoDescriptionRu: true,
        seoDescriptionKz: true,
      },
    });
    const databaseArticles = records.map((record) => recordToArticle(record, locale));
    const databaseSlugs = new Set(databaseArticles.map((article) => article.slug));
    return [
      ...databaseArticles,
      ...staticArticles[locale].filter((article) => !databaseSlugs.has(article.slug)),
    ];
  } catch {
    return staticArticles[locale];
  }
});

export const getJournalArticle = cache(
  async (locale: Locale, slug: string): Promise<JournalArticle | null> => {
    const articles = await getJournalArticles(locale);
    return articles.find((article) => article.slug === slug) ?? null;
  },
);

export const journalStaticSlugs = [progressArticle.ru.slug] as const;
