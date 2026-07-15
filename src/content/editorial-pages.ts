import type { Localized } from "@/lib/i18n";
import type { EditorialPage } from "./types";

export const technologyContent: Localized<EditorialPage> = {
  en: {
    seo: {
      title: "Technology and product logic",
      description:
        "How QULTURE approaches materials, fit, layers and product validation without unsupported claims.",
    },
    eyebrow: "TECHNOLOGY / PROCESS",
    title: "Function begins with context",
    lead:
      "We do not call every detail technology. At QULTURE, it is the link between a city scenario, construction, clear data and validation before a claim is published.",
    status: "Development method / pre-launch",
    sections: [
      {
        id: "city-context",
        eyebrow: "01 / CONTEXT",
        title: "The city changes conditions faster than the route",
        paragraphs: [
          "On one journey, a person may move through wind, a car or public transport, then indoors. We therefore consider a product as part of a sequence of real conditions, not as an answer to abstract weather.",
          "For each scenario, the team describes time outside, activity, transport and layers separately. Only then can a recommendation be made clearly.",
        ],
      },
      {
        id: "layer-system",
        eyebrow: "02 / SYSTEM",
        title: "Layers without universal claims",
        paragraphs: [
          "The current product focus is an urban top and trousers that work together or separately. The system is designed to let the two components be sized independently.",
          "Solo, with a light base layer and under outerwear are validation directions, not ready-made temperature promises. Final guidance will appear with approved material and fit data.",
        ],
      },
      {
        id: "fit",
        eyebrow: "03 / FIT",
        title: "Fit is a measurable system",
        paragraphs: [
          "A size recommendation should not rely on height and weight alone. It needs garment measurements, key body measurements, preferred ease and the layer worn underneath.",
          "When data is insufficient or measurements fall between ranges, the assistant should show alternatives and say when confidence is low rather than guess.",
        ],
        bullets: [
          "Garment measurements for every published size.",
          "A comparison of adjacent sizes and silhouette changes.",
          "Fit tests across proportions and layering options.",
          "Documented exceptions and a clear path to human support.",
        ],
      },
      {
        id: "materials",
        eyebrow: "04 / MATERIALS",
        title: "Plain language first, specification alongside it",
        paragraphs: [
          "Composition, construction and care instructions are published after approval by the product team. Until then, the site deliberately does not assign waterproofness, wind protection, a temperature range or other properties to a fabric.",
          "A final product page will explain the practical effect first, then the exact term, limitation and source of evidence. That supports a decision without turning product copy into advertising science.",
        ],
      },
      {
        id: "verification",
        eyebrow: "05 / PROOF",
        title: "What needs to be verified before launch",
        paragraphs: [
          "Every product claim moves from a working assumption to an approved record. The site and QULTURE Assist use only the published version of the data.",
        ],
        bullets: [
          "Composition and care are checked against the final garment.",
          "Measurements are repeatable and linked to a specific pattern version.",
          "Wear scenarios describe conditions and limits without invented degrees.",
          "The verification date and information owner are recorded in the content system.",
        ],
        note: "This page describes a development process. It is not a specification for a product that has not yet been published.",
      },
    ],
    related: [
      {
        href: "/journal/building-qulture-openly",
        label: "How we are building QULTURE openly",
        description: "Our first progress note on the boundaries of the pre-launch version.",
      },
      {
        href: "/faq",
        label: "Questions and answers",
        description: "Short answers about launch, sizing and verified information.",
      },
    ],
  },
  ru: {
    seo: {
      title: "Технологии и логика продукта",
      description:
        "Как QULTURE подходит к материалам, посадке, слоям и проверке характеристик без неподтверждённых обещаний.",
    },
    eyebrow: "TECHNOLOGY / PROCESS",
    title: "Функция начинается с контекста",
    lead:
      "Мы не называем технологией каждую деталь. Для QULTURE это связка из городского сценария, конструкции, понятных данных и проверки до публикации обещаний.",
    status: "Метод разработки / pre-launch",
    sections: [
      {
        id: "city-context",
        eyebrow: "01 / КОНТЕКСТ",
        title: "Город меняет условия быстрее, чем маршрут",
        paragraphs: [
          "В течение одной поездки человек оказывается на ветру, в автомобиле или общественном транспорте, а затем в помещении. Поэтому продукт рассматривается не как вещь для абстрактной погоды, а как часть последовательности реальных условий.",
          "Для каждого сценария команда должна отдельно описать длительность на улице, активность, транспорт и используемые слои. Только после этого можно формулировать понятную рекомендацию.",
        ],
      },
      {
        id: "layer-system",
        eyebrow: "02 / СИСТЕМА",
        title: "Слои без универсальных заявлений",
        paragraphs: [
          "Текущий продуктовый фокус — городской верх и брюки, которые можно рассматривать вместе или по отдельности. Архитектура комплекта предусматривает независимый выбор размеров двух компонентов.",
          "Сценарии «соло», «с тонким базовым слоем» и «под верхней одеждой» — направления проверки, а не готовые температурные обещания. Финальные рекомендации появятся вместе с подтверждёнными данными о материале и посадке.",
        ],
      },
      {
        id: "fit",
        eyebrow: "03 / FIT",
        title: "Посадка — это измеряемая система",
        paragraphs: [
          "Рекомендация размера не должна строиться только на росте и весе. Нужны замеры самого изделия, ключевые параметры человека, предпочитаемая свобода и слой, который будет находиться под одеждой.",
          "Если данных недостаточно или параметры находятся между диапазонами, консультант должен показать альтернативы и обозначить низкую уверенность, а не угадывать.",
        ],
        bullets: [
          "Замеры изделия для каждого опубликованного размера.",
          "Сравнение соседних размеров и изменения силуэта.",
          "Fit-тесты с разными пропорциями и вариантами слоёв.",
          "Документированные исключения и путь к консультации человека.",
        ],
      },
      {
        id: "materials",
        eyebrow: "04 / MATERIALS",
        title: "Состав простым языком, спецификация — рядом",
        paragraphs: [
          "Состав, конструкция и инструкции по уходу будут опубликованы после утверждения продуктовой командой. До этого сайт намеренно не приписывает ткани водонепроницаемость, защиту от ветра, температурный диапазон или другие свойства.",
          "В финальной карточке сначала будет объяснён практический эффект для человека, затем — точный термин, ограничение и источник подтверждения. Это помогает принять решение и не превращает описание в рекламную «науку».",
        ],
      },
      {
        id: "verification",
        eyebrow: "05 / PROOF",
        title: "Что должно быть проверено до запуска",
        paragraphs: [
          "Каждое продуктовое утверждение проходит путь от рабочего предположения к утверждённой записи. На сайте и в QULTURE Assist используется только опубликованная версия данных.",
        ],
        bullets: [
          "Состав и правила ухода сверены с финальным изделием.",
          "Замеры повторяемы и привязаны к конкретной версии лекал.",
          "Сценарии носки описывают условия и ограничения без выдуманных градусов.",
          "Дата проверки и владелец информации зафиксированы в контентной системе.",
        ],
        note: "Страница описывает процесс разработки. Она не является спецификацией ещё не опубликованного товара.",
      },
    ],
    related: [
      {
        href: "/journal/building-qulture-openly",
        label: "Как мы строим QULTURE открыто",
        description: "Первая progress-note о границах pre-launch версии.",
      },
      {
        href: "/faq",
        label: "Вопросы и ответы",
        description: "Короткие ответы о запуске, размерах и подтверждённых данных.",
      },
    ],
  },
  kz: {
    seo: {
      title: "Технологиялар және өнім логикасы",
      description:
        "QULTURE материал, пішім, қабаттар және сипаттамаларды уәдесіз тексеру мәселесіне қалай қарайды.",
    },
    eyebrow: "TECHNOLOGY / PROCESS",
    title: "Функция контекстен басталады",
    lead:
      "Біз әр бөлшекті технология деп атамаймыз. QULTURE үшін технология — қалалық сценарий, конструкция, түсінікті дерек және уәдені жариялауға дейінгі тексеру байланысы.",
    status: "Әзірлеу әдісі / pre-launch",
    sections: [
      {
        id: "city-context",
        eyebrow: "01 / КОНТЕКСТ",
        title: "Қаладағы жағдай маршруттан жылдам өзгереді",
        paragraphs: [
          "Бір сапардың ішінде адам желде, көлікте немесе қоғамдық тасымалда, кейін ғимарат ішінде болады. Сондықтан өнім дерексіз ауа райына арналған зат ретінде емес, нақты жағдайлар тізбегінің бөлігі ретінде қаралады.",
          "Әр сценарий үшін далада өткізілетін уақыт, белсенділік, көлік және киілген қабаттар бөлек сипатталуы керек. Тек содан кейін ғана түсінікті ұсыным жасауға болады.",
        ],
      },
      {
        id: "layer-system",
        eyebrow: "02 / ЖҮЙЕ",
        title: "Жалпылама уәдесіз қабаттау",
        paragraphs: [
          "Қазіргі өнім бағыты — бірге де, бөлек те қолданылатын қалалық үстіңгі бөлік пен шалбар. Жиынтық архитектурасы екі бөліктің өлшемін тәуелсіз таңдауды көздейді.",
          "«Жеке кию», «жұқа негізгі қабатпен» және «сырт киімнің астында» сценарийлері — тексеру бағыттары, дайын температуралық уәде емес. Соңғы ұсыным материал мен пішім туралы расталған дерекпен бірге шығады.",
        ],
      },
      {
        id: "fit",
        eyebrow: "03 / FIT",
        title: "Пішім — өлшенетін жүйе",
        paragraphs: [
          "Өлшем ұсынымы тек бой мен салмаққа сүйенбеуі керек. Бұйымның өз өлшемдері, адамның негізгі параметрлері, қалаған еркіндік және ішкі қабат ескеріледі.",
          "Дерек жеткіліксіз болса немесе параметрлер екі диапазонның арасында тұрса, кеңесші балама нұсқаларды көрсетіп, сенімділіктің төмен екенін айтуы тиіс — болжам жасамауы керек.",
        ],
        bullets: [
          "Жарияланған әр өлшемге арналған бұйым өлшемдері.",
          "Көршілес өлшемдер мен силуэт өзгерісін салыстыру.",
          "Әртүрлі пропорция және қабат нұсқаларымен пішім сынағы.",
          "Құжатталған ерекшеліктер және адам кеңесіне өту жолы.",
        ],
      },
      {
        id: "materials",
        eyebrow: "04 / MATERIALS",
        title: "Құрамы — қарапайым тілмен, спецификациясы — жанында",
        paragraphs: [
          "Құрам, конструкция және күтім нұсқаулығы өнім командасы бекіткеннен кейін жарияланады. Оған дейін сайт матаға су өтпейтіндік, желден қорғау, температура диапазоны немесе өзге қасиеттерді телімейді.",
          "Соңғы өнім бетінде алдымен адамға беретін практикалық әсер, кейін нақты термин, шектеу және растау көзі көрсетіледі. Бұл таңдауды жеңілдетіп, сипаттаманы жарнамалық «ғылымға» айналдырмайды.",
        ],
      },
      {
        id: "verification",
        eyebrow: "05 / PROOF",
        title: "Іске қосылғанға дейін не тексерілуі керек",
        paragraphs: [
          "Әр өнім мәлімдемесі жұмыс болжамынан бекітілген жазбаға дейінгі жолдан өтеді. Сайт пен QULTURE Assist тек жарияланған дерек нұсқасын қолданады.",
        ],
        bullets: [
          "Құрам мен күтім ережесі соңғы бұйыммен салыстырылған.",
          "Өлшемдер қайталанады және лекалоның нақты нұсқасына байланыстырылған.",
          "Кию сценарийлері жағдай мен шектеуді ойдан шығарылған градустарсыз сипаттайды.",
          "Тексеру күні мен ақпарат иесі контент жүйесінде белгіленген.",
        ],
        note: "Бұл бет әзірлеу үдерісін сипаттайды. Ол әлі жарияланбаған тауардың спецификациясы емес.",
      },
    ],
    related: [
      {
        href: "/journal/building-qulture-openly",
        label: "QULTURE-ді қалай ашық жасап жатырмыз",
        description: "Pre-launch шекаралары туралы алғашқы progress-note.",
      },
      {
        href: "/faq",
        label: "Сұрақтар мен жауаптар",
        description: "Іске қосылу, өлшем және расталған дерек туралы қысқа жауаптар.",
      },
    ],
  },
};

export const aboutContent: Localized<EditorialPage> = {
  en: {
    seo: {
      title: "About QULTURE",
      description:
        "QULTURE is an urban apparel project from Astana, designed for changing conditions across Central Asia.",
    },
    eyebrow: "ABOUT / ASTANA",
    title: "Observe the city. Build honestly.",
    lead:
      "QULTURE is being built in Astana around one simple task: make urban clothing clear to choose and appropriate through a changing day.",
    status: "Brand in development",
    sections: [
      {
        id: "origin",
        eyebrow: "01 / STARTING POINT",
        title: "Changing climates are an everyday context",
        paragraphs: [
          "In Central Asia, clothing needs to consider more than the season. It needs to account for transitions between street, transport and interior. QULTURE begins by observing those transitions, not by styling an abstract idea of technology.",
          "Astana is both the project’s place of origin and its design context. We use that context functionally, without decorative national motifs added for effect.",
        ],
      },
      {
        id: "product",
        eyebrow: "02 / PRODUCT",
        title: "A system instead of one rigid scenario",
        paragraphs: [
          "The first product focus is an urban top and trousers. They can be considered as a set or as separate pieces, with independent sizing for top and bottom.",
          "Final products, prices, colours, composition and launch timing have not been published. We do not fill that gap with demonstration promises.",
        ],
      },
      {
        id: "principles",
        eyebrow: "03 / PRINCIPLES",
        title: "Quiet presentation, precise information",
        paragraphs: [
          "A good product page should quickly explain why a piece exists, how to choose a size, what is confirmed and where the limits are. For us, commercial clarity matters more than a long manifesto.",
        ],
        bullets: [
          "Do not publish unverified specifications, dates or reviews.",
          "Separate facts, working assumptions and plans.",
          "Give people control over language, data and contact preferences.",
          "Develop the product and its digital service as one system.",
        ],
      },
      {
        id: "progress",
        eyebrow: "04 / NOW",
        title: "Pre-launch without a staged store",
        paragraphs: [
          "For now, the site is a transparent foundation for the future store: it explains the approach, collects only the interest a visitor chooses and shows progress. Commerce functions will open after an approved catalogue and operational terms are in place.",
          "In the Journal, we record decisions that can already be explained publicly and mark what still needs validation.",
        ],
      },
    ],
    related: [
      { href: "/technology", label: "Our approach to technology" },
      { href: "/journal", label: "Development journal" },
    ],
  },
  ru: {
    seo: {
      title: "О QULTURE",
      description:
        "QULTURE — проект функциональной городской одежды из Астаны, создаваемый для меняющихся условий Центральной Азии.",
    },
    eyebrow: "ABOUT / ASTANA",
    title: "Наблюдать за городом. Проектировать честно.",
    lead:
      "QULTURE создаётся в Астане вокруг простой задачи: сделать городскую одежду понятной в выборе и уместной в течение меняющегося дня.",
    status: "Бренд в стадии разработки",
    sections: [
      {
        id: "origin",
        eyebrow: "01 / ОТПРАВНАЯ ТОЧКА",
        title: "Changing climates — это повседневный контекст",
        paragraphs: [
          "В Центральной Азии одежда должна учитывать не только сезон, но и переходы между улицей, транспортом и помещением. QULTURE начинается с наблюдения за этими переходами, а не с абстрактного образа «технологичности».",
          "Астана — точка происхождения проекта и контекст проектирования. Мы используем этот контекст функционально, без декоративных национальных мотивов ради стилизации.",
        ],
      },
      {
        id: "product",
        eyebrow: "02 / ПРОДУКТ",
        title: "Система вместо одного жёсткого сценария",
        paragraphs: [
          "Первый продуктовый фокус — городской верх и брюки. Их можно будет рассматривать как комплект или как отдельные вещи; архитектура предусматривает разные размеры верха и низа.",
          "Финальные товары, цены, цвета, состав и сроки запуска пока не опубликованы. Мы не заполняем этот пробел демонстрационными обещаниями.",
        ],
      },
      {
        id: "principles",
        eyebrow: "03 / ПРИНЦИПЫ",
        title: "Тишина в подаче, точность в данных",
        paragraphs: [
          "Хорошая продуктовая страница должна быстро объяснить, для чего существует вещь, как выбрать размер, что подтверждено и где проходят ограничения. Поэтому коммерческая ясность для нас важнее длинного манифеста.",
        ],
        bullets: [
          "Не публиковать неподтверждённые характеристики, даты и отзывы.",
          "Разделять факты, рабочие гипотезы и планы.",
          "Давать человеку контроль над языком, данными и способом связи.",
          "Развивать продукт и цифровой сервис как одну систему.",
        ],
      },
      {
        id: "progress",
        eyebrow: "04 / СЕЙЧАС",
        title: "Pre-launch без декорации магазина",
        paragraphs: [
          "Сейчас сайт работает как прозрачная основа будущего магазина: рассказывает о подходе, собирает только выбранный пользователем интерес и показывает прогресс. Commerce-функции включатся после появления утверждённого каталога и операционных условий.",
          "В Journal мы фиксируем решения, которые уже можно объяснить публично, и отдельно отмечаем то, что ещё требует проверки.",
        ],
      },
    ],
    related: [
      { href: "/technology", label: "Подход к технологии" },
      { href: "/journal", label: "Журнал разработки" },
    ],
  },
  kz: {
    seo: {
      title: "QULTURE туралы",
      description:
        "QULTURE — Орталық Азияның құбылмалы жағдайына арналып Астанада жасалып жатқан функционалды қала киімі жобасы.",
    },
    eyebrow: "ABOUT / ASTANA",
    title: "Қаланы бақылау. Адал жобалау.",
    lead:
      "QULTURE Астанада қарапайым міндет айналасында жасалып жатыр: қала киімін таңдауға түсінікті және құбылмалы күн ішінде орынды ету.",
    status: "Бренд әзірлену кезеңінде",
    sections: [
      {
        id: "origin",
        eyebrow: "01 / БАСТАУ НҮКТЕСІ",
        title: "Changing climates — күнделікті контекст",
        paragraphs: [
          "Орталық Азияда киім маусымды ғана емес, көше, көлік және ғимарат арасындағы ауысуды да ескеруі керек. QULTURE «технологияның» дерексіз бейнесінен емес, осы ауысуларды бақылаудан басталады.",
          "Астана — жобаның шыққан жері және жобалау контексті. Біз бұл контексті тек стиль үшін ұлттық нақыш қоспай, функционалды түрде қолданамыз.",
        ],
      },
      {
        id: "product",
        eyebrow: "02 / ӨНІМ",
        title: "Бір ғана қатаң сценарийдің орнына жүйе",
        paragraphs: [
          "Алғашқы өнім бағыты — қалалық үстіңгі бөлік пен шалбар. Оларды жиынтық немесе бөлек зат ретінде қарастыруға болады; жүйе үстіңгі және астыңғы өлшемдерді бөлек таңдауды көздейді.",
          "Соңғы тауарлар, баға, түс, құрам және іске қосылу мерзімі әлі жарияланған жоқ. Біз бұл аралықты демонстрациялық уәдемен толтырмаймыз.",
        ],
      },
      {
        id: "principles",
        eyebrow: "03 / ҚАҒИДАЛАР",
        title: "Ұсынуда тыныштық, деректе дәлдік",
        paragraphs: [
          "Жақсы өнім беті заттың не үшін жасалғанын, өлшемді қалай таңдау керегін, ненің расталғанын және шектеудің қайда екенін тез түсіндіреді. Сондықтан біз үшін ұзақ манифестен гөрі коммерциялық айқындық маңызды.",
        ],
        bullets: [
          "Расталмаған сипаттама, күн және пікірді жарияламау.",
          "Фактіні, жұмыс болжамын және жоспарды ажырату.",
          "Адамға тіл, дерек және байланыс тәсілін басқару мүмкіндігін беру.",
          "Өнім мен цифрлық сервисті бір жүйе ретінде дамыту.",
        ],
      },
      {
        id: "progress",
        eyebrow: "04 / ҚАЗІР",
        title: "Дүкенді жасанды көрсетпейтін pre-launch",
        paragraphs: [
          "Қазір сайт болашақ дүкеннің ашық негізі ретінде жұмыс істейді: тәсілді түсіндіреді, тек қолданушы таңдаған қызығушылықты жинайды және ілгерілеуді көрсетеді. Сауда функциялары бекітілген каталог пен операциялық шарттар дайын болғанда қосылады.",
          "Journal бөлімінде көпшілікке түсіндіруге болатын шешімдерді тіркеп, әлі тексеруді қажет ететін тұстарды бөлек белгілейміз.",
        ],
      },
    ],
    related: [
      { href: "/technology", label: "Технологияға көзқарас" },
      { href: "/journal", label: "Әзірлеу журналы" },
    ],
  },
};

export const contactsContent: Localized<EditorialPage> = {
  en: {
    seo: {
      title: "Contacts",
      description: "The status of QULTURE’s official channels and where to find verified project information.",
    },
    eyebrow: "CONTACTS / PRE-LAUNCH",
    title: "Contact without invented details",
    lead:
      "An official support address, phone number and seller details must be confirmed before publication and before commerce begins.",
    status: "Contact details are pending confirmation",
    sections: [
      {
        id: "current-status",
        title: "What is available now",
        paragraphs: [
          "The project is being built in Astana, Kazakhstan. In this pre-launch version, we intentionally do not publish an unverified email address, phone number, business hours or legal address.",
          "Answers about the current product status, development principles and data handling are available in the FAQ and the relevant sections of the site.",
        ],
      },
      {
        id: "before-launch",
        title: "What will be published before orders open",
        paragraphs: [
          "Before commerce is enabled, this page must publish the seller’s name, an official support channel, an address for formal requests and response times. Those details will be reviewed by the business owner and an appropriate specialist.",
        ],
        bullets: [
          "An official email address and primary support channel.",
          "Seller details and an address for requests.",
          "A route for questions about orders, payment, delivery and returns.",
          "A separate route for B2B and press requests, if approved.",
        ],
      },
      {
        id: "safety",
        title: "How to verify a message from QULTURE",
        paragraphs: [
          "Until official channels are published here, do not share payment details or documents with accounts claiming to represent QULTURE. Once launched, this page will hold the current list of channels.",
        ],
      },
    ],
    related: [
      { href: "/faq", label: "Open the FAQ" },
      { href: "/privacy", label: "How data will be handled" },
    ],
  },
  ru: {
    seo: {
      title: "Контакты",
      description: "Статус официальных каналов QULTURE и способы найти проверенную информацию о проекте.",
    },
    eyebrow: "CONTACTS / PRE-LAUNCH",
    title: "Связь без выдуманных реквизитов",
    lead:
      "Официальный адрес поддержки, телефон и реквизиты продавца должны быть подтверждены заказчиком до публикации и начала торговли.",
    status: "Контактные данные ожидают подтверждения",
    sections: [
      {
        id: "current-status",
        title: "Что доступно сейчас",
        paragraphs: [
          "Проект создаётся в Астане, Казахстан. На этой pre-launch версии мы намеренно не публикуем неподтверждённый email, номер телефона, режим работы или юридический адрес.",
          "Ответы о текущем статусе продукта, принципах разработки и обработке данных собраны в FAQ и профильных разделах сайта.",
        ],
      },
      {
        id: "before-launch",
        title: "Что появится до сбора заказов",
        paragraphs: [
          "До включения commerce-режима на этой странице должны быть опубликованы наименование продавца, официальный канал поддержки, адрес для юридически значимых обращений и время ответа. Эти данные пройдут проверку владельцем бизнеса и профильным специалистом.",
        ],
        bullets: [
          "Официальный email и основной канал поддержки.",
          "Данные продавца и адрес для обращений.",
          "Порядок вопросов по заказу, оплате, доставке и возврату.",
          "Отдельный маршрут для B2B и запросов прессы, если он будет утверждён.",
        ],
      },
      {
        id: "safety",
        title: "Как проверить сообщение от QULTURE",
        paragraphs: [
          "Пока официальные каналы не опубликованы здесь, не передавайте платёжные данные или документы аккаунтам, которые представляются QULTURE. После запуска актуальный список каналов будет храниться на этой странице.",
        ],
      },
    ],
    related: [
      { href: "/faq", label: "Открыть FAQ" },
      { href: "/privacy", label: "Как будут обрабатываться данные" },
    ],
  },
  kz: {
    seo: {
      title: "Байланыс",
      description: "QULTURE ресми арналарының мәртебесі және жоба туралы тексерілген ақпаратты табу жолдары.",
    },
    eyebrow: "CONTACTS / PRE-LAUNCH",
    title: "Ойдан шығарылған дерексіз байланыс",
    lead:
      "Ресми қолдау мекенжайы, телефон және сатушы деректемелері жарияланып, сауда басталғанға дейін тапсырыс берушімен расталуы керек.",
    status: "Байланыс деректері растауды күтуде",
    sections: [
      {
        id: "current-status",
        title: "Қазір не қолжетімді",
        paragraphs: [
          "Жоба Астана, Қазақстанда жасалып жатыр. Осы pre-launch нұсқасында расталмаған email, телефон, жұмыс уақыты немесе заңды мекенжай әдейі жарияланбайды.",
          "Өнімнің қазіргі мәртебесі, әзірлеу қағидалары және деректерді өңдеу туралы жауаптар FAQ мен сайттың тиісті бөлімдерінде берілген.",
        ],
      },
      {
        id: "before-launch",
        title: "Тапсырыс қабылданғанға дейін не пайда болады",
        paragraphs: [
          "Commerce режимі қосылғанға дейін бұл бетте сатушының атауы, ресми қолдау арнасы, заңды мәні бар өтініштерге арналған мекенжай және жауап беру уақыты жариялануы тиіс. Бұл деректі бизнес иесі мен бейінді маман тексереді.",
        ],
        bullets: [
          "Ресми email және негізгі қолдау арнасы.",
          "Сатушы деректері және өтініш мекенжайы.",
          "Тапсырыс, төлем, жеткізу және қайтару сұрақтарының тәртібі.",
          "Бекітілсе, B2B және баспасөз сұрауларына арналған бөлек бағыт.",
        ],
      },
      {
        id: "safety",
        title: "QULTURE атынан келген хабарламаны қалай тексеруге болады",
        paragraphs: [
          "Ресми арналар осы бетте жарияланғанға дейін өзін QULTURE деп таныстырған аккаунттарға төлем деректерін немесе құжаттарды бермеңіз. Іске қосылғаннан кейін арналардың өзекті тізімі осы бетте сақталады.",
        ],
      },
    ],
    related: [
      { href: "/faq", label: "FAQ бөлімін ашу" },
      { href: "/privacy", label: "Дерек қалай өңделеді" },
    ],
  },
};

export const accountContent: Localized<EditorialPage> = {
  en: {
    seo: {
      title: "Account",
      description: "The status of the QULTURE account area during pre-launch.",
    },
    eyebrow: "ACCOUNT / PRE-LAUNCH",
    title: "An account is not needed yet",
    lead:
      "There is no registration or demonstration order flow before commerce launches. The account area will open with real orders.",
    status: "Available when commerce opens",
    sections: [
      {
        id: "why-closed",
        title: "Why this area is closed for now",
        paragraphs: [
          "Creating an empty account is not useful and would require unnecessary personal data. During pre-launch, launch updates are available without a profile and consent for a specific notification is stored separately.",
        ],
      },
      {
        id: "future-scope",
        title: "What will be available after commerce launches",
        paragraphs: [
          "Once the catalogue, seller, payment and delivery terms are approved, the account will bring together only the actions needed for real orders.",
        ],
        bullets: [
          "Order status and a tracking link when supplied by the delivery provider.",
          "Order contents, component sizes and pre-order status.",
          "An exchange or return request under the approved policy.",
          "Management of saved data and consent choices.",
        ],
      },
      {
        id: "guest-checkout",
        title: "Buying without mandatory registration",
        paragraphs: [
          "Future checkout includes a guest path. Creating a profile should not be a condition of payment and can be offered separately after an order.",
        ],
      },
    ],
    related: [
      { href: "/faq", label: "Launch questions" },
      { href: "/privacy", label: "Data-handling principles" },
    ],
  },
  ru: {
    seo: {
      title: "Личный кабинет",
      description: "Статус личного кабинета QULTURE в pre-launch режиме.",
    },
    eyebrow: "ACCOUNT / PRE-LAUNCH",
    title: "Аккаунт пока не требуется",
    lead:
      "До запуска торговли здесь нет регистрации или демонстрационных заказов. Личный кабинет будет включён вместе с реальным order-flow.",
    status: "Функция будет доступна в commerce-режиме",
    sections: [
      {
        id: "why-closed",
        title: "Почему раздел закрыт сейчас",
        paragraphs: [
          "Создание пустого аккаунта не даёт пользы и требует собирать лишние персональные данные. В pre-launch режиме узнать о запуске можно без профиля, а согласие на конкретные уведомления хранится отдельно.",
        ],
      },
      {
        id: "future-scope",
        title: "Что появится после запуска торговли",
        paragraphs: [
          "Когда будут утверждены каталог, продавец, оплата и доставка, кабинет объединит только необходимые действия по реальным заказам.",
        ],
        bullets: [
          "Статус заказа и ссылка на отслеживание, если её предоставляет служба доставки.",
          "Состав заказа, размеры компонентов и статус предзаказа.",
          "Запрос обмена или возврата по утверждённым правилам.",
          "Управление сохранёнными данными и согласиями.",
        ],
      },
      {
        id: "guest-checkout",
        title: "Покупка без обязательной регистрации",
        paragraphs: [
          "Будущий checkout предусматривает гостевой сценарий. Создание профиля не должно быть условием оплаты и может предлагаться отдельно после заказа.",
        ],
      },
    ],
    related: [
      { href: "/faq", label: "Вопросы о запуске" },
      { href: "/privacy", label: "Принципы обработки данных" },
    ],
  },
  kz: {
    seo: {
      title: "Жеке кабинет",
      description: "QULTURE жеке кабинетінің pre-launch режиміндегі мәртебесі.",
    },
    eyebrow: "ACCOUNT / PRE-LAUNCH",
    title: "Әзірге аккаунт қажет емес",
    lead:
      "Сауда іске қосылғанға дейін мұнда тіркелу де, демонстрациялық тапсырыс та жоқ. Жеке кабинет нақты тапсырыс үдерісімен бірге қосылады.",
    status: "Функция commerce режимінде қолжетімді болады",
    sections: [
      {
        id: "why-closed",
        title: "Бөлім неге қазір жабық",
        paragraphs: [
          "Бос аккаунт құру пайда бермейді және артық жеке дерек жинауды талап етеді. Pre-launch режимінде іске қосылу туралы профильсіз білуге болады, ал нақты хабарламаға келісім бөлек сақталады.",
        ],
      },
      {
        id: "future-scope",
        title: "Сауда басталғаннан кейін не пайда болады",
        paragraphs: [
          "Каталог, сатушы, төлем және жеткізу шарттары бекітілгенде, кабинет тек нақты тапсырысқа қажетті әрекеттерді біріктіреді.",
        ],
        bullets: [
          "Тапсырыс мәртебесі және жеткізу қызметі ұсынса, бақылау сілтемесі.",
          "Тапсырыс құрамы, бөлшектер өлшемі және алдын ала тапсырыс мәртебесі.",
          "Бекітілген ережелер бойынша айырбастау немесе қайтару сұрауы.",
          "Сақталған деректер мен келісімдерді басқару.",
        ],
      },
      {
        id: "guest-checkout",
        title: "Міндетті тіркелусіз сатып алу",
        paragraphs: [
          "Болашақ checkout қонақ сценарийін қарастырады. Профиль құру төлем шарты болмауы керек және тапсырыстан кейін бөлек ұсынылуы мүмкін.",
        ],
      },
    ],
    related: [
      { href: "/faq", label: "Іске қосылу туралы сұрақтар" },
      { href: "/privacy", label: "Деректерді өңдеу қағидалары" },
    ],
  },
};
