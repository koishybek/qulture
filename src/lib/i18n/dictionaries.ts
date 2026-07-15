import type { Locale } from "./config";

const ruDictionary = {
  common: {
    brand: "QULTURE",
    skipToContent: "Перейти к содержанию",
    readMore: "Читать дальше",
    backToJournal: "Вернуться в журнал",
    statusPrelaunch: "Pre-launch",
    inDevelopment: "В разработке",
    draft: "Черновик",
    updated: "Обновлено",
    minutes: "мин чтения",
    learnMore: "Подробнее",
    openMenu: "Открыть меню",
    close: "Закрыть",
  },
  nav: {
    home: "Главная",
    shop: "Магазин",
    technology: "Технологии",
    journal: "Журнал",
    about: "О бренде",
    aiAssist: "QULTURE Assist",
    search: "Поиск",
    account: "Профиль",
    bag: "Корзина",
    waitlist: "Лист ожидания",
    delivery: "Доставка и возврат",
    faq: "Вопросы",
    privacy: "Конфиденциальность",
    terms: "Условия",
    cookies: "Файлы cookie",
    consent: "Согласие",
    contacts: "Контакты",
    language: "Язык",
  },
  home: {
    hero: {
      eyebrow: "QULTURE / CENTRAL ASIA",
      title: "Одна система. Больше условий.",
      subtitle:
        "Функциональная городская одежда для ветра, слоёв и движения в меняющемся климате Центральной Азии.",
      primaryCta: "Узнать о запуске",
      secondaryCta: "Как это устроено",
    },
    cityLayer: {
      eyebrow: "CITY LAYER SYSTEM",
      title: "Верх и брюки — вместе или по отдельности",
      copy:
        "Мы проектируем городскую двойку как систему: каждый компонент должен работать самостоятельно, а размеры верха и низа можно будет выбирать независимо.",
      itemTop: "Верх",
      itemBottom: "Брюки",
      itemSet: "Комплект",
      note: "Финальные характеристики, размеры и цены появятся только после проверки и утверждения.",
    },
    scenarios: {
      eyebrow: "СЦЕНАРИИ",
      title: "От улицы к помещению без лишней сложности",
      copy:
        "Посадка и система слоёв разрабатываются вокруг реального городского маршрута. Конкретные сценарии будут опубликованы после fit- и material-проверок.",
      solo: "Самостоятельный слой",
      base: "С тонким базовым слоем",
      outer: "Под верхней одеждой",
    },
    proof: {
      eyebrow: "ПРОВЕРКА ДО ОБЕЩАНИЙ",
      title: "Сначала данные, затем заявления",
      copy:
        "До публикации продуктовых свойств команда должна подтвердить замеры изделия, посадку, состав, уход и допустимые сценарии носки.",
      measurements: "Замеры каждого размера",
      fit: "Fit-тесты на разных пропорциях",
      material: "Утверждённые данные материала",
    },
    ai: {
      eyebrow: "QULTURE ASSIST",
      title: "Ответы о продукте без догадок",
      copy:
        "Консультант помогает разобраться в слоях, посадке и статусе запуска. Если подтверждённых данных нет, он прямо скажет об этом и предложит передать вопрос команде.",
      cta: "Открыть консультанта",
    },
    brand: {
      eyebrow: "DESIGNED IN ASTANA",
      title: "Одежда из наблюдения за городом",
      copy:
        "QULTURE создаётся в Астане для маршрутов, где ветер, транспорт, улица и помещение сменяют друг друга в течение дня.",
      cta: "О QULTURE",
    },
    journal: {
      eyebrow: "PROGRESS JOURNAL",
      title: "Показываем, что уже решено, а что ещё проверяется",
      copy:
        "Заметки о разработке продукта, цифровой системе и принципах, по которым подтверждаются будущие характеристики.",
      cta: "Открыть журнал",
    },
    waitlist: {
      eyebrow: "ОБНОВЛЕНИЯ О ЗАПУСКЕ",
      title: "Получить подтверждённую информацию первым",
      copy:
        "Оставьте контакт только для выбранного типа уведомлений. Лист ожидания не означает автоматическую подписку на маркетинг.",
      cta: "Оставить контакт",
    },
    footer: {
      note: "QULTURE находится на этапе разработки. Цены, наличие и сроки запуска ещё не опубликованы.",
      legal: "Документы и настройки данных",
      support: "Информация и поддержка",
    },
  },
} as const;

type DictionaryShape<T> = {
  readonly [Key in keyof T]: T[Key] extends string ? string : DictionaryShape<T[Key]>;
};

export type SiteDictionary = DictionaryShape<typeof ruDictionary>;

const enDictionary = {
  common: {
    brand: "QULTURE",
    skipToContent: "Skip to content",
    readMore: "Read more",
    backToJournal: "Back to journal",
    statusPrelaunch: "Pre-launch",
    inDevelopment: "In development",
    draft: "Draft",
    updated: "Updated",
    minutes: "min read",
    learnMore: "Learn more",
    openMenu: "Open menu",
    close: "Close",
  },
  nav: {
    home: "Home",
    shop: "Shop",
    technology: "Technology",
    journal: "Journal",
    about: "About",
    aiAssist: "QULTURE Assist",
    search: "Search",
    account: "Account",
    bag: "Bag",
    waitlist: "Waitlist",
    delivery: "Delivery & returns",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookie settings",
    consent: "Consent",
    contacts: "Contacts",
    language: "Language",
  },
  home: {
    hero: {
      eyebrow: "QULTURE / CENTRAL ASIA",
      title: "Designed for changing climates.",
      subtitle: "Urban clothing for wind, layers and movement.",
      primaryCta: "Explore the system",
      secondaryCta: "Ask QULTURE AI",
    },
    cityLayer: {
      eyebrow: "City layer system",
      title: "Top and trousers, together or separately",
      copy:
        "We build a city set as a system: every component has to work on its own, while top and bottom sizes remain independently selectable.",
      itemTop: "Top",
      itemBottom: "Trousers",
      itemSet: "Set",
      note: "Final specifications, sizing and prices are published only after verification and approval.",
    },
    scenarios: {
      eyebrow: "Scenarios",
      title: "From street to inside, without unnecessary complexity",
      copy:
        "Fit and layering are developed around an actual city route. Specific scenarios are published only after fit and material validation.",
      solo: "Solo layer",
      base: "With a base layer",
      outer: "Under outerwear",
    },
    proof: {
      eyebrow: "Verification before claims",
      title: "Data first, then statements",
      copy:
        "Before publishing product properties, the team verifies measurements, fit, composition, care and suitable wear scenarios.",
      measurements: "Garment measurements by size",
      fit: "Fit testing across proportions",
      material: "Approved material data",
    },
    ai: {
      eyebrow: "QULTURE Assist",
      title: "Product answers without guesswork",
      copy:
        "The assistant explains layers, fit and launch status. If confirmed information is unavailable, it says so and can pass a question to the team.",
      cta: "Open the assistant",
    },
    brand: {
      eyebrow: "Designed in Astana",
      title: "Clothing shaped by observing the city",
      copy:
        "QULTURE is designed in Astana for routes where wind, transport, street and interior can all change within one day.",
      cta: "About QULTURE",
    },
    journal: {
      eyebrow: "Progress journal",
      title: "What is decided, and what is still being verified",
      copy:
        "Notes on product development, the digital system and the principles used to validate future specifications.",
      cta: "View journal",
    },
    waitlist: {
      eyebrow: "Launch updates",
      title: "Get confirmed information first",
      copy:
        "Leave a contact only for the update type you choose. The waitlist never implies automatic marketing consent.",
      cta: "Leave a contact",
    },
    footer: {
      note: "QULTURE is in development. Prices, availability and launch timing have not been published yet.",
      legal: "Documents and data settings",
      support: "Information and support",
    },
  },
} as const satisfies SiteDictionary;

const kzDictionary = {
  common: {
    brand: "QULTURE",
    skipToContent: "Мазмұнға өту",
    readMore: "Толығырақ оқу",
    backToJournal: "Журналға оралу",
    statusPrelaunch: "Pre-launch",
    inDevelopment: "Әзірленіп жатыр",
    draft: "Жоба нұсқасы",
    updated: "Жаңартылды",
    minutes: "мин оқу",
    learnMore: "Толығырақ",
    openMenu: "Мәзірді ашу",
    close: "Жабу",
  },
  nav: {
    home: "Басты бет",
    shop: "Дүкен",
    technology: "Технологиялар",
    journal: "Журнал",
    about: "Бренд туралы",
    aiAssist: "QULTURE Assist",
    search: "Іздеу",
    account: "Профиль",
    bag: "Себет",
    waitlist: "Күту тізімі",
    delivery: "Жеткізу және қайтару",
    faq: "Сұрақтар",
    privacy: "Құпиялық",
    terms: "Шарттар",
    cookies: "Cookie файлдары",
    consent: "Келісім",
    contacts: "Байланыс",
    language: "Тіл",
  },
  home: {
    hero: {
      eyebrow: "QULTURE / CENTRAL ASIA",
      title: "Бір жүйе. Көбірек жағдай.",
      subtitle:
        "Орталық Азияның құбылмалы климатында желге, қабаттап киюге және қозғалысқа арналған функционалды қала киімі.",
      primaryCta: "Іске қосылу жайлы білу",
      secondaryCta: "Қалай құрылған",
    },
    cityLayer: {
      eyebrow: "CITY LAYER SYSTEM",
      title: "Үсті мен шалбары — бірге де, бөлек те",
      copy:
        "Біз қалалық киім жиынтығын жүйе ретінде жобалап жатырмыз: әр бөлік жеке жұмыс істеуі, ал үстіңгі және астыңғы өлшемдер тәуелсіз таңдалуы тиіс.",
      itemTop: "Үсті",
      itemBottom: "Шалбар",
      itemSet: "Жиынтық",
      note: "Соңғы сипаттамалар, өлшемдер мен бағалар тек тексеріліп, бекітілгеннен кейін жарияланады.",
    },
    scenarios: {
      eyebrow: "СЦЕНАРИЙЛЕР",
      title: "Көшеден ғимаратқа — артық күрделіліксіз",
      copy:
        "Пішім мен қабаттау жүйесі күнделікті қала бағытына сүйеніп әзірленеді. Нақты сценарийлер пішім мен материал тексерілгеннен кейін жарияланады.",
      solo: "Жеке қабат ретінде",
      base: "Жұқа негізгі қабатпен",
      outer: "Сырт киімнің астында",
    },
    proof: {
      eyebrow: "УӘДЕДЕН БҰРЫН — ТЕКСЕРУ",
      title: "Алдымен дерек, содан кейін мәлімдеме",
      copy:
        "Өнім қасиеттерін жарияламас бұрын команда бұйым өлшемдерін, пішімін, құрамын, күтімін және қолдану сценарийлерін растауы керек.",
      measurements: "Әр өлшемнің бұйым өлшемдері",
      fit: "Әртүрлі дене пропорцияларындағы пішім сынағы",
      material: "Материал туралы бекітілген дерек",
    },
    ai: {
      eyebrow: "QULTURE ASSIST",
      title: "Өнім туралы болжамсыз жауап",
      copy:
        "Кеңесші қабаттарды, пішімді және іске қосылу мәртебесін түсіндіреді. Расталған дерек болмаса, оны ашық айтып, сұрақты командаға беруді ұсынады.",
      cta: "Кеңесшіні ашу",
    },
    brand: {
      eyebrow: "DESIGNED IN ASTANA",
      title: "Қаланы бақылаудан туған киім",
      copy:
        "QULTURE Астанада жасалып жатыр: мұнда бір күн ішінде жел, көлік, көше мен ғимарат бірін-бірі алмастырады.",
      cta: "QULTURE туралы",
    },
    journal: {
      eyebrow: "PROGRESS JOURNAL",
      title: "Не шешілгенін және не әлі тексеріліп жатқанын көрсетеміз",
      copy:
        "Өнімнің әзірленуі, цифрлық жүйе және болашақ сипаттамаларды растау қағидалары туралы жазбалар.",
      cta: "Журналды ашу",
    },
    waitlist: {
      eyebrow: "ІСКЕ ҚОСЫЛУ ЖАҢАЛЫҚТАРЫ",
      title: "Расталған ақпаратты алғашқылардың бірі болып алу",
      copy:
        "Байланыс дерегіңізді тек таңдаған хабарлама түрі үшін қалдырыңыз. Күту тізімі маркетингке автоматты жазылуды білдірмейді.",
      cta: "Байланыс қалдыру",
    },
    footer: {
      note: "QULTURE әзірлену кезеңінде. Баға, қолжетімділік және іске қосылу мерзімі әлі жарияланған жоқ.",
      legal: "Құжаттар мен дерек баптаулары",
      support: "Ақпарат және қолдау",
    },
  },
} as const satisfies SiteDictionary;

const dictionaries: Record<Locale, SiteDictionary> = {
  en: enDictionary,
  ru: ruDictionary,
  kz: kzDictionary,
};

export function getDictionary(locale: Locale): SiteDictionary {
  return dictionaries[locale];
}
