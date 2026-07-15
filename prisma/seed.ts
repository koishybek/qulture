import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../generated/prisma/client";

const databaseUrl =
  process.env.DATABASE_URL?.trim() || "file:./prisma/qulture.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const db = new PrismaClient({ adapter });

const publishedAt = new Date("2026-07-15T00:00:00.000Z");

async function seedSettings(): Promise<void> {
  await db.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteMode: "PRE_LAUNCH",
      demoMode: false,
      catalogVisible: false,
      controlledPreview: true,
      defaultLocale: "RU",
      currency: "KZT",
      consentPolicyVersion: "2026-07-draft",
    },
    create: {
      id: "default",
      siteMode: "PRE_LAUNCH",
      demoMode: false,
      catalogVisible: false,
      controlledPreview: true,
      defaultLocale: "RU",
      currency: "KZT",
      consentPolicyVersion: "2026-07-draft",
      sectionVisibility: {
        about: true,
        technology: true,
        journal: true,
        waitlist: true,
        catalog: false,
      },
      homeContent: {
        ru: {
          eyebrow: "QULTURE / CENTRAL ASIA",
          title: "Городской слой для меняющегося климата",
          note: "Разработка продолжается. Подтверждённые характеристики и условия появятся до открытия продаж.",
        },
        kz: {
          eyebrow: "QULTURE / CENTRAL ASIA",
          title: "Өзгермелі климатқа арналған қалалық қабат",
          note: "Әзірлеу жалғасуда. Расталған сипаттамалар мен шарттар сатылым ашылғанға дейін жарияланады.",
        },
      },
      aiTeaserEnabled: true,
      aiTeaserDelayMs: 6500,
      aiTeaserFrequency: "once_per_session",
      aiQuickActions: {
        ru: [
          "Помочь выбрать размер",
          "Что подойдёт под мой климат?",
          "Наличие и доставка",
        ],
        kz: [
          "Өлшем таңдауға көмектесу",
          "Менің климатыма не сай келеді?",
          "Қолжетімділік және жеткізу",
        ],
      },
    },
  });
}

async function seedKnowledge(): Promise<void> {
  const entries = [
    {
      language: "RU" as const,
      title: "Статус запуска и подтверждение информации",
      content:
        "Дата открытия продаж пока не подтверждена. QULTURE публикует цены, наличие, состав и характеристики только после внутреннего подтверждения. До этого можно оставить контакт в листе ожидания.",
    },
    {
      language: "KZ" as const,
      title: "Іске қосылу мәртебесі және ақпаратты растау",
      content:
        "Сатылымның ашылатын күні әзірге расталған жоқ. QULTURE баға, қолжетімділік, құрам және сипаттамаларды ішкі растаудан кейін ғана жариялайды. Оған дейін күту тізіміне байланыс дерегін қалдыруға болады.",
    },
  ];

  for (const entry of entries) {
    await db.knowledgeItem.upsert({
      where: {
        sourceId_language_version: {
          sourceId: "launch-information-policy",
          language: entry.language,
          version: 1,
        },
      },
      update: {
        title: entry.title,
        content: entry.content,
        status: "PUBLISHED",
        isDemo: false,
        publishedAt,
      },
      create: {
        language: entry.language,
        scope: "launch_and_product_information",
        title: entry.title,
        content: entry.content,
        sourceOwner: "QULTURE team",
        sourceId: "launch-information-policy",
        status: "PUBLISHED",
        version: 1,
        isDemo: false,
        publishedAt,
      },
    });
  }
}

async function seedJournal(): Promise<void> {
  await db.journalArticle.upsert({
    where: { slug: "building-qulture-openly" },
    update: {
      status: "PUBLISHED",
      isDemo: false,
      publishedAt,
    },
    create: {
      slug: "building-qulture-openly",
      titleRu: "Создаём QULTURE открыто",
      titleKz: "QULTURE-ді ашық түрде құрып жатырмыз",
      excerptRu:
        "Фиксируем ход разработки без выдуманных дат, характеристик и обещаний.",
      excerptKz:
        "Әзірлеу барысын ойдан шығарылған күндерсіз, сипаттамаларсыз және уәделерсіз тіркейміз.",
      contentRu:
        "QULTURE находится в разработке. На этом этапе мы показываем направление продукта и собираем вопросы аудитории. Цены, остатки, составы, температурные диапазоны и дата запуска будут опубликованы только после подтверждения командой.",
      contentKz:
        "QULTURE әзірлену үстінде. Бұл кезеңде біз өнім бағытын көрсетіп, аудитория сұрақтарын жинаймыз. Бағалар, қорлар, құрамдар, температуралық ауқымдар және іске қосылу күні команда растағаннан кейін ғана жарияланады.",
      author: "QULTURE",
      status: "PUBLISHED",
      isDemo: false,
      publishedAt,
      seoTitleRu: "Создаём QULTURE открыто — Journal",
      seoTitleKz: "QULTURE-ді ашық түрде құрып жатырмыз — Journal",
      seoDescriptionRu:
        "Честное обновление о текущем этапе разработки QULTURE.",
      seoDescriptionKz:
        "QULTURE әзірлеуінің қазіргі кезеңі туралы ашық жаңарту.",
    },
  });
}

async function seedTranslations(): Promise<void> {
  const translations = [
    ["navigation", "home", "RU", "Главная"],
    ["navigation", "home", "KZ", "Басты бет"],
    ["navigation", "about", "RU", "О бренде"],
    ["navigation", "about", "KZ", "Бренд туралы"],
    ["navigation", "technology", "RU", "Технология"],
    ["navigation", "technology", "KZ", "Технология"],
    ["navigation", "journal", "RU", "Журнал"],
    ["navigation", "journal", "KZ", "Журнал"],
    ["navigation", "waitlist", "RU", "Лист ожидания"],
    ["navigation", "waitlist", "KZ", "Күту тізімі"],
    ["common", "coming_soon", "RU", "Скоро"],
    ["common", "coming_soon", "KZ", "Жақында"],
    ["ai", "open", "RU", "Открыть консультанта"],
    ["ai", "open", "KZ", "Кеңесшіні ашу"],
  ] as const;

  for (const [namespace, key, locale, value] of translations) {
    await db.translation.upsert({
      where: { namespace_key_locale: { namespace, key, locale } },
      update: { value, status: "PUBLISHED", version: 1, publishedAt },
      create: {
        namespace,
        key,
        locale,
        value,
        status: "PUBLISHED",
        version: 1,
        publishedAt,
      },
    });
  }
}

async function seedDemoCommerce(): Promise<void> {
  const collection = await db.collection.upsert({
    where: { slug: "demo-commerce-fixtures" },
    update: { status: "DRAFT", isDemo: true },
    create: {
      slug: "demo-commerce-fixtures",
      nameRu: "DEMO: проверка commerce",
      nameKz: "DEMO: commerce тексеруі",
      descriptionRu: "Непубличные данные только для тестовых маршрутов.",
      descriptionKz: "Тек сынақ маршруттарына арналған жария емес деректер.",
      status: "DRAFT",
      isDemo: true,
    },
  });

  const top = await db.product.upsert({
    where: { slug: "demo-city-top" },
    update: {
      status: "DRAFT",
      isDemo: true,
      priceMinor: 120_000,
      collections: { set: [{ id: collection.id }] },
    },
    create: {
      slug: "demo-city-top",
      nameRu: "DEMO: городской верх",
      nameKz: "DEMO: қалалық үстіңгі бөлік",
      descriptionRu:
        "Демонстрационная запись для проверки интерфейса. Не является публичным товаром.",
      descriptionKz:
        "Интерфейсті тексеруге арналған демонстрациялық жазба. Жария тауар емес.",
      status: "DRAFT",
      category: "TOP",
      priceMinor: 120_000,
      currency: "KZT",
      isDemo: true,
      collections: { connect: { id: collection.id } },
    },
  });

  const bottom = await db.product.upsert({
    where: { slug: "demo-city-trousers" },
    update: {
      status: "DRAFT",
      isDemo: true,
      priceMinor: 90_000,
      collections: { set: [{ id: collection.id }] },
    },
    create: {
      slug: "demo-city-trousers",
      nameRu: "DEMO: городские брюки",
      nameKz: "DEMO: қалалық шалбар",
      descriptionRu:
        "Демонстрационная запись для проверки интерфейса. Не является публичным товаром.",
      descriptionKz:
        "Интерфейсті тексеруге арналған демонстрациялық жазба. Жария тауар емес.",
      status: "DRAFT",
      category: "BOTTOM",
      priceMinor: 90_000,
      currency: "KZT",
      isDemo: true,
      collections: { connect: { id: collection.id } },
    },
  });

  const variants = [
    { productId: top.id, sku: "DEMO-TOP-GRAPHITE-M", sizeLabel: "M", stock: 4 },
    { productId: top.id, sku: "DEMO-TOP-GRAPHITE-L", sizeLabel: "L", stock: 3 },
    { productId: bottom.id, sku: "DEMO-BOTTOM-GRAPHITE-M", sizeLabel: "M", stock: 2 },
    { productId: bottom.id, sku: "DEMO-BOTTOM-GRAPHITE-L", sizeLabel: "L", stock: 5 },
  ];

  for (const variant of variants) {
    await db.variant.upsert({
      where: { sku: variant.sku },
      update: {
        productId: variant.productId,
        sizeLabel: variant.sizeLabel,
        stock: variant.stock,
        reservedStock: 0,
        active: true,
        isDemo: true,
      },
      create: {
        productId: variant.productId,
        colorCode: "graphite-demo",
        colorNameRu: "DEMO: графит",
        colorNameKz: "DEMO: графит",
        sizeLabel: variant.sizeLabel,
        sku: variant.sku,
        stock: variant.stock,
        reservedStock: 0,
        active: true,
        isDemo: true,
      },
    });
  }

  const bundle = await db.bundle.upsert({
    where: { slug: "demo-city-set" },
    update: {
      status: "DRAFT",
      discountType: "PERCENTAGE",
      discountValue: 1_000,
      isDemo: true,
    },
    create: {
      slug: "demo-city-set",
      nameRu: "DEMO: городской комплект",
      nameKz: "DEMO: қалалық жиынтық",
      descriptionRu: "Непубличный комплект для проверки раздельного выбора размеров.",
      descriptionKz: "Өлшемдерді бөлек таңдауды тексеруге арналған жария емес жиынтық.",
      status: "DRAFT",
      discountType: "PERCENTAGE",
      discountValue: 1_000,
      currency: "KZT",
      isDemo: true,
    },
  });

  await db.bundleComponent.deleteMany({ where: { bundleId: bundle.id } });
  await db.bundleComponent.createMany({
    data: [
      { bundleId: bundle.id, productId: top.id, role: "TOP", sortOrder: 0 },
      { bundleId: bundle.id, productId: bottom.id, role: "BOTTOM", sortOrder: 1 },
    ],
  });
}

async function main(): Promise<void> {
  await seedSettings();
  await seedKnowledge();
  await seedJournal();
  await seedTranslations();
  await seedDemoCommerce();
  console.log("QULTURE database seed completed.");
}

main()
  .catch((error: unknown) => {
    console.error("QULTURE database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
