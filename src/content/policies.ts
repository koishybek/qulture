import type { Localized } from "@/lib/i18n";
import type { LegalPage, LegalStatus } from "./types";

const draftStatus: Localized<LegalStatus> = {
  en: {
    label: "Legal draft — approval required",
    message:
      "This is a working structure for the interface. It is not an effective policy, public offer or legal advice. The business owner and a qualified specialist must approve the entity details, legal bases, time periods and wording in writing.",
    version: "DRAFT 2026-07-15",
    effectiveLabel: "Not effective",
  },
  ru: {
    label: "Юридический черновик — требуется утверждение",
    message:
      "Рабочая структура для проектирования интерфейса. Не является действующей политикой, публичной офертой или юридической консультацией. Реквизиты, основания, сроки и формулировки должен письменно утвердить заказчик вместе с профильным специалистом.",
    version: "DRAFT 2026-07-15",
    effectiveLabel: "Не вступил в силу",
  },
  kz: {
    label: "Заңдық жоба нұсқасы — бекіту қажет",
    message:
      "Интерфейсті жобалауға арналған жұмыс құрылымы. Қолданыстағы саясат, жария оферта немесе заңдық кеңес болып саналмайды. Деректемелерді, негіздерді, мерзімдерді және тұжырымдарды тапсырыс беруші бейінді маманмен бірге жазбаша бекітуі тиіс.",
    version: "DRAFT 2026-07-15",
    effectiveLabel: "Күшіне енген жоқ",
  },
};

export const deliveryAndReturnsContent: Localized<LegalPage> = {
  en: {
    seo: {
      title: "Delivery and returns — terms draft",
      description:
        "The structure for QULTURE’s future delivery, exchange and return terms. This draft awaits operational and legal approval.",
    },
    eyebrow: "DELIVERY & RETURNS / DRAFT",
    title: "Terms should be clear before payment",
    lead:
      "QULTURE is not taking orders yet. Delivery areas, rates, timelines, carriers and return rules are not approved, so we do not replace them with approximate promises.",
    status: "Commerce is unavailable",
    legalStatus: draftStatus.en,
    sections: [
      {
        id: "delivery-before-launch",
        eyebrow: "01 / DELIVERY",
        title: "What will be shown before checkout",
        paragraphs: [
          "Once the operating model is connected, a customer will see the available delivery area, method, calculated cost and expected timing before proceeding to payment. If an exact calculation is not possible, the interface must explain who will confirm it and when.",
          "A pre-order dispatch date or range will be shown separately and never confused with an in-stock status.",
        ],
        bullets: [
          "Cities and territories served.",
          "The carrier or collection method.",
          "Cost, timing and tracking process.",
          "Steps for delays, loss or damage in transit.",
        ],
      },
      {
        id: "returns-flow",
        eyebrow: "02 / RETURNS",
        title: "A clear request path",
        paragraphs: [
          "The planned interface will let a customer start a request from an order or through the official support channel. Before submitting, a person should see the applicable terms, required information and next steps.",
          "Time limits, item condition, exclusions, return-delivery cost and refund method will be published only after legal approval. No specific return terms are promised now.",
        ],
      },
      {
        id: "size-exchange",
        eyebrow: "03 / SIZE",
        title: "A size exchange is part of the future process",
        paragraphs: [
          "The system is designed to keep the size of every set component with an order and to handle a request for a single item correctly. Availability, timing and financial consequences of an exchange depend on the seller’s final rules.",
        ],
      },
      {
        id: "approval-checklist",
        eyebrow: "04 / BEFORE PUBLICATION",
        title: "What still needs approval",
        paragraphs: [
          "This page becomes effective only after its operational and legal fields are completed and a new version is published.",
        ],
        bullets: [
          "Full seller details and an official support contact.",
          "Service areas, carriers, rates and promised timelines.",
          "Cancellation, exchange, return and defect-handling terms.",
          "The refund method and treatment of set discounts.",
        ],
      },
    ],
    related: [
      { href: "/terms", label: "Sales terms draft" },
      { href: "/contacts", label: "Official contacts status" },
    ],
  },
  ru: {
    seo: {
      title: "Доставка и возврат — проект условий",
      description:
        "Структура будущих условий доставки, обмена и возврата QULTURE. Черновик ожидает операционного и юридического утверждения.",
    },
    eyebrow: "DELIVERY & RETURNS / DRAFT",
    title: "Условия должны быть известны до оплаты",
    lead:
      "QULTURE ещё не принимает заказы. География, тарифы, сроки, перевозчики и правила возврата не утверждены — поэтому мы не подменяем их примерными обещаниями.",
    status: "Commerce отключён",
    legalStatus: draftStatus.ru,
    sections: [
      {
        id: "delivery-before-launch",
        eyebrow: "01 / ДОСТАВКА",
        title: "Что будет показано до оформления заказа",
        paragraphs: [
          "После подключения операционной модели покупатель увидит доступную географию, способ доставки, рассчитанную стоимость и срок до перехода к оплате. Если точный расчёт невозможен, интерфейс должен прямо объяснить, когда и кем он будет подтверждён.",
          "Для предзаказа дата или диапазон отправки указывается отдельно и не смешивается со статусом «в наличии».",
        ],
        bullets: [
          "Города и территории обслуживания.",
          "Перевозчик или способ получения.",
          "Стоимость, срок и порядок отслеживания.",
          "Действия при задержке, утрате или повреждении отправления.",
        ],
      },
      {
        id: "returns-flow",
        eyebrow: "02 / ВОЗВРАТ",
        title: "Понятный маршрут запроса",
        paragraphs: [
          "Планируемый интерфейс позволит начать запрос из заказа или через официальный канал поддержки. До отправки запроса человек должен увидеть применимые условия, необходимые сведения и следующие шаги.",
          "Сроки, состояние товара, исключения, стоимость обратной доставки и способ возврата денег будут опубликованы только после юридического утверждения. Сейчас никаких конкретных условий возврата не обещается.",
        ],
      },
      {
        id: "size-exchange",
        eyebrow: "03 / РАЗМЕР",
        title: "Обмен размера — часть будущего процесса",
        paragraphs: [
          "Система проектируется так, чтобы заказ сохранял размер каждого компонента комплекта и позволял корректно оформить запрос по одной позиции. Возможность, сроки и финансовые последствия обмена зависят от финальных правил продавца.",
        ],
      },
      {
        id: "approval-checklist",
        eyebrow: "04 / ДО ПУБЛИКАЦИИ",
        title: "Что ещё должен утвердить заказчик",
        paragraphs: [
          "Эта страница станет действующей только после заполнения операционных и юридических полей и публикации новой версии.",
        ],
        bullets: [
          "Полные данные продавца и официальный контакт поддержки.",
          "Зоны, перевозчики, тарифы и обещаемые сроки.",
          "Условия отказа, обмена, возврата и обработки брака.",
          "Способ возврата средств и порядок работы с bundle-скидкой.",
        ],
      },
    ],
    related: [
      { href: "/terms", label: "Проект условий продажи" },
      { href: "/contacts", label: "Статус официальных контактов" },
    ],
  },
  kz: {
    seo: {
      title: "Жеткізу және қайтару — шарттар жобасы",
      description:
        "QULTURE болашақ жеткізу, айырбастау және қайтару шарттарының құрылымы. Жоба операциялық және заңдық бекітуді күтуде.",
    },
    eyebrow: "DELIVERY & RETURNS / DRAFT",
    title: "Шарттар төлемге дейін белгілі болуы керек",
    lead:
      "QULTURE әзірге тапсырыс қабылдамайды. География, тариф, мерзім, тасымалдаушы және қайтару ережесі бекітілмеген, сондықтан біз оларды шамамен уәдемен алмастырмаймыз.",
    status: "Commerce өшірулі",
    legalStatus: draftStatus.kz,
    sections: [
      {
        id: "delivery-before-launch",
        eyebrow: "01 / ЖЕТКІЗУ",
        title: "Тапсырыс рәсімделгенге дейін не көрсетіледі",
        paragraphs: [
          "Операциялық модель қосылғаннан кейін сатып алушы төлемге өтпей тұрып қолжетімді географияны, жеткізу тәсілін, есептелген құн мен мерзімді көреді. Нақты есеп мүмкін болмаса, интерфейс оны қашан және кім растайтынын ашық түсіндіруі тиіс.",
          "Алдын ала тапсырыстың жөнелту күні немесе аралығы бөлек көрсетіліп, «қолда бар» мәртебесімен араластырылмайды.",
        ],
        bullets: [
          "Қызмет көрсетілетін қалалар мен аумақтар.",
          "Тасымалдаушы немесе алу тәсілі.",
          "Құны, мерзімі және бақылау тәртібі.",
          "Кешігу, жоғалу немесе зақымдану кезіндегі әрекет.",
        ],
      },
      {
        id: "returns-flow",
        eyebrow: "02 / ҚАЙТАРУ",
        title: "Сұрау жіберудің түсінікті жолы",
        paragraphs: [
          "Жоспарланған интерфейс сұрауды тапсырыстан немесе ресми қолдау арнасынан бастауға мүмкіндік береді. Жіберер алдында адам қолданылатын шарттарды, қажетті мәліметті және келесі қадамдарды көруі тиіс.",
          "Мерзім, тауар күйі, ерекшелік, кері жеткізу құны және ақша қайтару тәсілі заңдық бекітуден кейін ғана жарияланады. Қазір нақты қайтару шартына уәде берілмейді.",
        ],
      },
      {
        id: "size-exchange",
        eyebrow: "03 / ӨЛШЕМ",
        title: "Өлшемді айырбастау — болашақ үдерістің бөлігі",
        paragraphs: [
          "Жүйе тапсырыста жиынтықтың әр бөлігінің өлшемін сақтап, бір позиция бойынша сұрауды дұрыс рәсімдеуге бейімделеді. Айырбастау мүмкіндігі, мерзімі және қаржылық салдары сатушының соңғы ережесіне байланысты.",
        ],
      },
      {
        id: "approval-checklist",
        eyebrow: "04 / ЖАРИЯЛАУҒА ДЕЙІН",
        title: "Тапсырыс беруші тағы нені бекітуі керек",
        paragraphs: [
          "Бұл бет операциялық және заңдық өрістер толтырылып, жаңа нұсқа жарияланғаннан кейін ғана қолданысқа енеді.",
        ],
        bullets: [
          "Сатушының толық деректері және ресми қолдау байланысы.",
          "Аймақтар, тасымалдаушылар, тарифтер және уәде етілетін мерзімдер.",
          "Бас тарту, айырбастау, қайтару және ақауды өңдеу шарттары.",
          "Қаражат қайтару тәсілі және bundle жеңілдігімен жұмыс тәртібі.",
        ],
      },
    ],
    related: [
      { href: "/terms", label: "Сату шарттарының жобасы" },
      { href: "/contacts", label: "Ресми байланыс мәртебесі" },
    ],
  },
};

export const privacyContent: Localized<LegalPage> = {
  en: {
    seo: {
      title: "Privacy policy — draft",
      description:
        "The structure of QULTURE’s personal-data policy. It is not effective and requires approval by the owner and legal counsel.",
    },
    eyebrow: "PRIVACY / DRAFT",
    title: "Collect only what is needed",
    lead:
      "This draft sets out a data-minimisation principle and shows which decisions need to be made before public collection of contacts and orders.",
    legalStatus: draftStatus.en,
    sections: [
      {
        id: "controller",
        eyebrow: "01 / CONTROLLER",
        title: "Who processes the data",
        paragraphs: [
          "The controller’s name, registration details and official address have not been provided yet. Without them, this policy should not be treated as complete or effective.",
        ],
      },
      {
        id: "data-categories",
        eyebrow: "02 / CATEGORIES",
        title: "Data that may need to be processed",
        paragraphs: [
          "The data set depends on the action a person chooses. A pre-launch form may ask for a contact and product interest; a future purchase may need data for payment, delivery and support. Fit information is requested separately and should not be required without a need.",
        ],
        bullets: [
          "A contact detail and the chosen type of service or marketing notification.",
          "Product preferences: component, size, colour and city, if provided by the person.",
          "Order data, delivery address and support history after commerce launches.",
          "Technical information about consent, security and session operation.",
        ],
        note: "Full payment credentials and secrets must not be sent to QULTURE Assist or stored in analytics.",
      },
      {
        id: "purposes-bases",
        eyebrow: "03 / PURPOSES AND BASES",
        title: "A separate explanation for each purpose",
        paragraphs: [
          "Processing should be tied to a specific purpose: responding to a request, notifying about availability, fulfilling an order, providing security or, with a separate choice, sending marketing materials.",
          "A qualified specialist must determine the applicable legal bases and required notices for the seller’s model and jurisdiction. They are not completed in this draft.",
        ],
      },
      {
        id: "ai",
        eyebrow: "04 / QULTURE ASSIST",
        title: "A conversation is not permission for marketing",
        paragraphs: [
          "The assistant should explain the purpose before first collecting a phone number or email address. Full conversation text is not used as an analytics payload, and sensitive fields in logs must be masked.",
          "Conversation retention, deletion method and the list of AI providers must be approved before production launch.",
        ],
      },
      {
        id: "sharing-retention",
        eyebrow: "05 / SHARING AND RETENTION",
        title: "Providers and time periods still need to be named",
        paragraphs: [
          "The final version will list categories of data recipients, such as hosting, payment gateway, delivery and notification providers, only after providers are selected and agreements are checked.",
          "Specific retention periods for each category are not approved. Saying that data is kept for as long as necessary without a retention schedule is not a complete policy.",
        ],
      },
      {
        id: "rights-contact",
        eyebrow: "06 / USER CHOICE",
        title: "Access, correction, deletion and withdrawal",
        paragraphs: [
          "The effective version will explain how to request access to data, correct it, delete it where applicable and withdraw consent. The official address for those requests is pending confirmation and will be published in Contacts.",
        ],
      },
    ],
    related: [
      { href: "/consent", label: "How consent choices work" },
      { href: "/cookies", label: "Cookie categories" },
      { href: "/contacts", label: "Contacts status" },
    ],
  },
  ru: {
    seo: {
      title: "Политика конфиденциальности — черновик",
      description:
        "Структура политики обработки персональных данных QULTURE. Не вступила в силу и требует утверждения владельцем и юристом.",
    },
    eyebrow: "PRIVACY / DRAFT",
    title: "Собирать только то, что нужно",
    lead:
      "Этот черновик фиксирует принцип минимизации данных и показывает, какие решения необходимо принять до публичного сбора контактов и заказов.",
    legalStatus: draftStatus.ru,
    sections: [
      {
        id: "controller",
        eyebrow: "01 / ОТВЕТСТВЕННЫЙ",
        title: "Кто обрабатывает данные",
        paragraphs: [
          "Наименование, регистрационные данные и официальный адрес ответственного лица ещё не предоставлены. Без этих сведений политика не должна считаться завершённой или действующей.",
        ],
      },
      {
        id: "data-categories",
        eyebrow: "02 / КАТЕГОРИИ",
        title: "Какие данные может потребоваться обрабатывать",
        paragraphs: [
          "Набор зависит от выбранного действия. Pre-launch форма может запросить контакт и интерес к продукту; будущая покупка — данные, необходимые для оплаты, доставки и поддержки. Параметры посадки запрашиваются отдельно и не должны быть обязательны без необходимости.",
        ],
        bullets: [
          "Контакт и выбранный тип сервисного или маркетингового уведомления.",
          "Предпочтения товара: компонент, размер, цвет и город — если пользователь их сообщает.",
          "Данные заказа, адрес доставки и история поддержки после запуска торговли.",
          "Технические сведения о согласии, безопасности и работе сессии.",
        ],
        note: "Полные платёжные реквизиты и секреты не должны передаваться в QULTURE Assist или храниться в аналитике.",
      },
      {
        id: "purposes-bases",
        eyebrow: "03 / ЦЕЛИ И ОСНОВАНИЯ",
        title: "Для каждой цели — отдельное объяснение",
        paragraphs: [
          "Обработка должна быть связана с конкретной целью: ответить на запрос, сообщить о наличии, выполнить заказ, обеспечить безопасность или — при отдельном выборе — отправлять маркетинговые материалы.",
          "Применимые юридические основания и обязательные уведомления должен определить профильный специалист с учётом модели продавца и юрисдикции. Они не заполнены в этом черновике.",
        ],
      },
      {
        id: "ai",
        eyebrow: "04 / QULTURE ASSIST",
        title: "Диалог не равен разрешению на маркетинг",
        paragraphs: [
          "Консультант должен объяснить цель перед первым сбором телефона или email. Полный текст диалога не используется как аналитический payload, а чувствительные поля в логах подлежат маскированию.",
          "Срок хранения диалогов, способ удаления и перечень AI-провайдеров должны быть утверждены до production-запуска.",
        ],
      },
      {
        id: "sharing-retention",
        eyebrow: "05 / ПЕРЕДАЧА И ХРАНЕНИЕ",
        title: "Поставщики и сроки ещё должны быть названы",
        paragraphs: [
          "Финальная версия перечислит категории получателей данных — например, хостинг, платёжный шлюз, доставка и сервис уведомлений — только после фактического выбора поставщиков и проверки договоров.",
          "Конкретные сроки хранения по каждой категории не утверждены. Формулировка «храним столько, сколько нужно» без таблицы сроков не считается завершённой политикой.",
        ],
      },
      {
        id: "rights-contact",
        eyebrow: "06 / ВЫБОР ПОЛЬЗОВАТЕЛЯ",
        title: "Доступ, исправление, удаление и отзыв выбора",
        paragraphs: [
          "В действующей версии будет описан способ запросить доступ к данным, исправить их, удалить в применимых случаях и отозвать согласие. Официальный адрес для таких запросов пока ожидает подтверждения и будет опубликован в разделе контактов.",
        ],
      },
    ],
    related: [
      { href: "/consent", label: "Как устроен выбор согласий" },
      { href: "/cookies", label: "Категории cookie" },
      { href: "/contacts", label: "Статус контактов" },
    ],
  },
  kz: {
    seo: {
      title: "Құпиялық саясаты — жоба нұсқасы",
      description:
        "QULTURE жеке деректерін өңдеу саясатының құрылымы. Күшіне енбеген, иесі мен заңгердің бекітуін қажет етеді.",
    },
    eyebrow: "PRIVACY / DRAFT",
    title: "Тек қажет деректі жинау",
    lead:
      "Бұл жоба деректерді азайту қағидасын бекітіп, байланыс пен тапсырысты көпшілікке жинауға дейін қандай шешім қабылдау керегін көрсетеді.",
    legalStatus: draftStatus.kz,
    sections: [
      {
        id: "controller",
        eyebrow: "01 / ЖАУАПТЫ ТҰЛҒА",
        title: "Деректі кім өңдейді",
        paragraphs: [
          "Жауапты тұлғаның атауы, тіркеу деректері және ресми мекенжайы әлі берілген жоқ. Бұл мәліметсіз саясат аяқталған немесе қолданыста деп саналмауы тиіс.",
        ],
      },
      {
        id: "data-categories",
        eyebrow: "02 / САНАТТАР",
        title: "Қандай деректі өңдеу қажет болуы мүмкін",
        paragraphs: [
          "Жинақ таңдалған әрекетке байланысты. Pre-launch формасы байланыс пен өнімге қызығушылықты, болашақ сатып алу төлем, жеткізу және қолдауға қажет деректі сұрауы мүмкін. Пішім параметрлері бөлек сұралады және қажеттіліксіз міндетті болмауы тиіс.",
        ],
        bullets: [
          "Байланыс және таңдалған сервистік не маркетингтік хабарлама түрі.",
          "Қолданушы хабарласа, өнім қалауы: бөлік, өлшем, түс және қала.",
          "Сауда іске қосылғаннан кейінгі тапсырыс, жеткізу мекенжайы және қолдау тарихы.",
          "Келісім, қауіпсіздік және сессия жұмысы туралы техникалық мәлімет.",
        ],
        note: "Толық төлем деректемелері мен құпиялар QULTURE Assist жүйесіне берілмеуі және аналитикада сақталмауы керек.",
      },
      {
        id: "purposes-bases",
        eyebrow: "03 / МАҚСАТ ПЕН НЕГІЗ",
        title: "Әр мақсатқа — бөлек түсіндірме",
        paragraphs: [
          "Өңдеу нақты мақсатпен байланысады: сұрауға жауап беру, қолжетімділік туралы хабарлау, тапсырысты орындау, қауіпсіздікті қамтамасыз ету немесе бөлек таңдау болса, маркетинг материалын жіберу.",
          "Қолданылатын заңдық негіздер мен міндетті хабарламаларды сатушы моделі мен юрисдикцияны ескеріп, бейінді маман анықтауы тиіс. Бұл жобада олар толтырылмаған.",
        ],
      },
      {
        id: "ai",
        eyebrow: "04 / QULTURE ASSIST",
        title: "Диалог маркетингке рұқсат бермейді",
        paragraphs: [
          "Кеңесші телефон не email алғаш сұралғанға дейін мақсатты түсіндіруі тиіс. Диалогтың толық мәтіні аналитикалық payload ретінде қолданылмайды, ал логтағы сезімтал өрістер бүркемеленуі керек.",
          "Диалогты сақтау мерзімі, жою тәсілі және AI-провайдерлер тізімі production іске қосылғанға дейін бекітілуі тиіс.",
        ],
      },
      {
        id: "sharing-retention",
        eyebrow: "05 / БЕРУ ЖӘНЕ САҚТАУ",
        title: "Провайдерлер мен мерзімдер әлі аталуы керек",
        paragraphs: [
          "Соңғы нұсқа хостинг, төлем шлюзі, жеткізу және хабарлама сервисі сияқты дерек алушылар санатын тек нақты провайдер таңдалып, шарттар тексерілгеннен кейін көрсетеді.",
          "Әр санаттың нақты сақтау мерзімі бекітілмеген. Мерзім кестесінсіз «қажет болғанша сақтаймыз» деген тұжырым аяқталған саясат болып саналмайды.",
        ],
      },
      {
        id: "rights-contact",
        eyebrow: "06 / ҚОЛДАНУШЫ ТАҢДАУЫ",
        title: "Қолжеткізу, түзету, жою және таңдауды қайтару",
        paragraphs: [
          "Қолданыстағы нұсқада дерекке қолжеткізу, оны түзету, қолданылатын жағдайда жою және келісімді қайтарып алу тәсілі сипатталады. Мұндай сұрауға арналған ресми мекенжай растауды күтуде және байланыс бөлімінде жарияланады.",
        ],
      },
    ],
    related: [
      { href: "/consent", label: "Келісім таңдауы қалай құрылған" },
      { href: "/cookies", label: "Cookie санаттары" },
      { href: "/contacts", label: "Байланыс мәртебесі" },
    ],
  },
};

export const termsContent: Localized<LegalPage> = {
  en: {
    seo: {
      title: "Sales terms — draft",
      description:
        "A proposed structure for QULTURE’s future sales terms. Commerce is unavailable and this document is not a public offer.",
    },
    eyebrow: "TERMS / DRAFT",
    title: "Sales terms are not effective yet",
    lead:
      "There is no published catalogue available to buy from and no payment is accepted. This document shows a future structure; it does not create an offer to enter into a contract.",
    status: "Not a public offer",
    legalStatus: draftStatus.en,
    sections: [
      {
        id: "seller",
        title: "1. Seller and scope",
        paragraphs: [
          "The final version must name the seller, registration and contact details, sales territory and the applicable version of the terms. Those fields are not completed yet.",
        ],
      },
      {
        id: "catalog",
        title: "2. Catalogue and product information",
        paragraphs: [
          "Only published products with a current price and status will be available to order. Drafts, demonstration entries and future categories must not create an impression of availability.",
          "Composition, colour, measurements and features will be displayed from approved data. Images and screens can represent a shade with limitations, which the final wording must describe.",
        ],
      },
      {
        id: "order-contract",
        title: "3. Order and contract formation",
        paragraphs: [
          "The process for submitting an order, seller confirmation, correcting errors and cancellation must be agreed with the selected commerce platform and legal model. This draft does not define when a contract is formed.",
        ],
      },
      {
        id: "prices-payment",
        title: "4. Price and payment",
        paragraphs: [
          "Currency, taxes, payment methods, the charge timing, pre-order rules and refunds are not approved yet. Until then, the site does not publish example prices or simulate payment.",
        ],
      },
      {
        id: "bundles",
        title: "5. Sets",
        paragraphs: [
          "A future order keeps the top and bottom as linked but separate components with their own sizes. Set pricing and recalculation after returning one component must be shown before payment and set out in the final terms.",
        ],
      },
      {
        id: "delivery-returns",
        title: "6. Delivery, exchanges and returns",
        paragraphs: [
          "Applicable methods, timing, cost and exclusions will be covered in a separate document and summarized at checkout. Those terms are not approved yet.",
        ],
      },
      {
        id: "liability-contact",
        title: "7. Liability, requests and versions",
        paragraphs: [
          "Liability limits, claims process, governing law, dispute resolution and an official address require legal wording. Each published version must have a number and date, and the version applicable to an order must be recorded with it.",
        ],
      },
    ],
    related: [
      { href: "/delivery-and-returns", label: "Delivery and returns draft" },
      { href: "/privacy", label: "Data policy draft" },
    ],
  },
  ru: {
    seo: {
      title: "Условия продажи — черновик",
      description:
        "Проект структуры будущих условий продажи QULTURE. Торговля отключена, документ не является публичной офертой.",
    },
    eyebrow: "TERMS / DRAFT",
    title: "Условия продажи ещё не действуют",
    lead:
      "На сайте нет опубликованного каталога для покупки и не принимается оплата. Этот документ показывает будущую структуру, но не создаёт предложение заключить договор.",
    status: "Не является публичной офертой",
    legalStatus: draftStatus.ru,
    sections: [
      {
        id: "seller",
        title: "1. Продавец и область действия",
        paragraphs: [
          "Финальная версия должна назвать продавца, регистрационные и контактные данные, территорию продаж и применимую версию условий. Эти поля пока не заполнены.",
        ],
      },
      {
        id: "catalog",
        title: "2. Каталог и информация о товаре",
        paragraphs: [
          "Только опубликованные товары с актуальной ценой и статусом будут доступны к заказу. Черновики, демонстрационные записи и будущие категории не должны создавать впечатление наличия.",
          "Состав, цвет, замеры и особенности отображаются по утверждённым данным; изображение и экран могут передавать оттенок с ограничениями, которые нужно описать в финальном тексте.",
        ],
      },
      {
        id: "order-contract",
        title: "3. Заказ и момент заключения договора",
        paragraphs: [
          "Порядок отправки заказа, его подтверждения продавцом, исправления ошибок и отмены должен быть согласован с выбранной commerce-платформой и юридической моделью. Этот черновик не определяет момент заключения договора.",
        ],
      },
      {
        id: "prices-payment",
        title: "4. Цена и оплата",
        paragraphs: [
          "Валюта, налоги, способы оплаты, момент списания, правила предзаказа и возврата средств ещё не утверждены. До этого сайт не публикует примерные цены или имитацию оплаты.",
        ],
      },
      {
        id: "bundles",
        title: "5. Комплекты",
        paragraphs: [
          "Будущий заказ хранит верх и низ как связанные, но отдельные компоненты с собственными размерами. Правило цены комплекта и перерасчёт при возврате одного компонента должны быть показаны до оплаты и закреплены в финальных условиях.",
        ],
      },
      {
        id: "delivery-returns",
        title: "6. Доставка, обмен и возврат",
        paragraphs: [
          "Применимые способы, сроки, стоимость и исключения будут вынесены в отдельный документ и кратко показаны в checkout. Пока эти условия не утверждены.",
        ],
      },
      {
        id: "liability-contact",
        title: "7. Ответственность, обращения и версии",
        paragraphs: [
          "Ограничения ответственности, порядок претензий, применимое право, разрешение споров и официальный адрес требует юридического текста. Каждая опубликованная версия условий должна иметь номер и дату, а применимая к заказу версия — фиксироваться вместе с ним.",
        ],
      },
    ],
    related: [
      { href: "/delivery-and-returns", label: "Проект доставки и возврата" },
      { href: "/privacy", label: "Проект политики данных" },
    ],
  },
  kz: {
    seo: {
      title: "Сату шарттары — жоба нұсқасы",
      description:
        "QULTURE болашақ сату шарттары құрылымының жобасы. Сауда өшірулі, құжат жария оферта емес.",
    },
    eyebrow: "TERMS / DRAFT",
    title: "Сату шарттары әлі күшіне енген жоқ",
    lead:
      "Сайтта сатып алуға ашық каталог жоқ және төлем қабылданбайды. Бұл құжат болашақ құрылымды көрсетеді, бірақ шарт жасасу ұсынысын білдірмейді.",
    status: "Жария оферта емес",
    legalStatus: draftStatus.kz,
    sections: [
      {
        id: "seller",
        title: "1. Сатушы және қолданылу аясы",
        paragraphs: [
          "Соңғы нұсқада сатушы, тіркеу және байланыс деректері, сату аумағы және шарттардың қолданылатын нұсқасы аталуы тиіс. Бұл өрістер әзірге толтырылмаған.",
        ],
      },
      {
        id: "catalog",
        title: "2. Каталог және тауар ақпараты",
        paragraphs: [
          "Тек өзекті бағасы мен мәртебесі бар жарияланған тауарларға тапсырыс беруге болады. Жоба, демонстрациялық жазба және болашақ санат қолда бар деген әсер қалдырмауы тиіс.",
          "Құрам, түс, өлшем және ерекшелік бекітілген дерекпен көрсетіледі; сурет пен экран реңкті шектеумен беруі мүмкін, бұл соңғы мәтінде түсіндірілуі керек.",
        ],
      },
      {
        id: "order-contract",
        title: "3. Тапсырыс және шарт жасасу сәті",
        paragraphs: [
          "Тапсырыс жіберу, сатушының растауы, қатені түзету және күшін жою тәртібі таңдалған commerce платформасы мен заңдық модельге сай бекітілуі тиіс. Бұл жоба шарт жасасу сәтін анықтамайды.",
        ],
      },
      {
        id: "prices-payment",
        title: "4. Баға және төлем",
        paragraphs: [
          "Валюта, салық, төлем тәсілі, қаражат есептен шығару сәті, алдын ала тапсырыс және ақша қайтару ережесі әлі бекітілмеген. Оған дейін сайт шамамен баға не төлем имитациясын жарияламайды.",
        ],
      },
      {
        id: "bundles",
        title: "5. Жиынтықтар",
        paragraphs: [
          "Болашақ тапсырыс үстіңгі және астыңғы бөлікті өз өлшемі бар байланысқан, бірақ бөлек компонент ретінде сақтайды. Жиынтық бағасы мен бір бөлік қайтарылғандағы қайта есептеу төлемге дейін көрсетіліп, соңғы шартта бекітілуі тиіс.",
        ],
      },
      {
        id: "delivery-returns",
        title: "6. Жеткізу, айырбастау және қайтару",
        paragraphs: [
          "Қолданылатын тәсіл, мерзім, құн және ерекшелік бөлек құжатқа шығарылып, checkout кезінде қысқаша көрсетіледі. Әзірге бұл шарттар бекітілмеген.",
        ],
      },
      {
        id: "liability-contact",
        title: "7. Жауапкершілік, өтініш және нұсқалар",
        paragraphs: [
          "Жауапкершілік шегі, шағым тәртібі, қолданылатын құқық, дауды шешу және ресми мекенжай заңдық мәтінді қажет етеді. Шарттардың әр жарияланған нұсқасында нөмір мен күн болады, ал тапсырысқа қолданылған нұсқа онымен бірге тіркеледі.",
        ],
      },
    ],
    related: [
      { href: "/delivery-and-returns", label: "Жеткізу және қайтару жобасы" },
      { href: "/privacy", label: "Дерек саясатының жобасы" },
    ],
  },
};

export const cookiesContent: Localized<LegalPage> = {
  en: {
    seo: {
      title: "Cookie policy — draft",
      description:
        "QULTURE cookie categories, consent principles and the details that must be confirmed before analytics and marketing are enabled.",
    },
    eyebrow: "COOKIES / DRAFT",
    title: "Optional means only after a choice",
    lead:
      "Necessary functions support the site. Analytics and marketing should remain off until a person explicitly permits them.",
    legalStatus: draftStatus.en,
    sections: [
      {
        id: "categories",
        title: "1. Three categories",
        paragraphs: [
          "Categories are separated by purpose. Agreeing to one optional category must not automatically enable another.",
        ],
        bullets: [
          "Necessary: security, session and bag operation, and saving a consent choice.",
          "Analytics: measuring site use and errors after permission is given.",
          "Marketing: advertising and personalization technology after a separate permission.",
        ],
      },
      {
        id: "current-state",
        title: "2. Current pre-launch behaviour",
        paragraphs: [
          "The interface saves selected categories, the policy version and update time in the browser, and sends a consent record to the server when it is available. This describes technical behaviour, not a complete cookie register.",
          "A list of specific cookies, domains, providers, purposes and retention periods must be compiled from services actually connected before production launch. We do not publish invented entries in advance.",
        ],
      },
      {
        id: "choices",
        title: "3. Available actions",
        paragraphs: [
          "A person can accept all categories, reject optional categories, configure each category and change the choice later. Rejecting analytics and marketing must not block the site’s main content.",
        ],
      },
      {
        id: "approval",
        title: "4. What requires approval",
        paragraphs: [
          "Before third-party services are enabled, the owner and a qualified specialist must review the register, legal bases, time periods, withdrawal mechanism and any cross-border transfer.",
        ],
      },
    ],
    related: [
      { href: "/consent", label: "Manage choices" },
      { href: "/privacy", label: "Privacy policy draft" },
    ],
  },
  ru: {
    seo: {
      title: "Политика cookie — черновик",
      description:
        "Категории cookie QULTURE, принципы согласия и список сведений, которые необходимо подтвердить до запуска аналитики и маркетинга.",
    },
    eyebrow: "COOKIES / DRAFT",
    title: "Необязательное — только после выбора",
    lead:
      "Необходимые функции поддерживают работу сайта. Аналитика и маркетинг должны оставаться выключенными, пока пользователь явно их не разрешит.",
    legalStatus: draftStatus.ru,
    sections: [
      {
        id: "categories",
        title: "1. Три категории",
        paragraphs: [
          "Категории разделены по цели. Согласие на одну необязательную категорию не должно автоматически включать другую.",
        ],
        bullets: [
          "Необходимые: безопасность, работа сессии, корзины и сохранение выбора согласия.",
          "Аналитика: измерение использования сайта и ошибок после разрешения пользователя.",
          "Маркетинг: рекламные и персонализационные технологии после отдельного разрешения.",
        ],
      },
      {
        id: "current-state",
        title: "2. Текущее состояние pre-launch версии",
        paragraphs: [
          "Интерфейс сохраняет выбранные категории, версию политики и время обновления в браузере и отправляет запись согласия на сервер, когда он доступен. Это описание технического поведения, а не полный реестр cookie.",
          "Список конкретных cookie, доменов, поставщиков, целей и сроков хранения должен быть составлен по фактически подключённым сервисам перед production-запуском. Мы не публикуем вымышленные записи заранее.",
        ],
      },
      {
        id: "choices",
        title: "3. Доступные действия",
        paragraphs: [
          "Пользователь может принять все категории, отклонить необязательные, настроить каждую категорию и изменить выбор позже. Отказ от аналитики и маркетинга не должен блокировать основной контент сайта.",
        ],
      },
      {
        id: "approval",
        title: "4. Что требует утверждения",
        paragraphs: [
          "До включения сторонних сервисов владелец и профильный специалист должны проверить реестр, основания, сроки, механизм отзыва и трансграничную передачу, если она возникает.",
        ],
      },
    ],
    related: [
      { href: "/consent", label: "Управление выбором" },
      { href: "/privacy", label: "Проект политики конфиденциальности" },
    ],
  },
  kz: {
    seo: {
      title: "Cookie саясаты — жоба нұсқасы",
      description:
        "QULTURE cookie санаттары, келісім қағидалары және аналитика мен маркетинг іске қосылғанға дейін расталатын мәліметтер.",
    },
    eyebrow: "COOKIES / DRAFT",
    title: "Міндетті емес құрал — тек таңдаудан кейін",
    lead:
      "Қажетті функциялар сайт жұмысын қолдайды. Аналитика мен маркетинг қолданушы нақты рұқсат бергенше өшірулі қалуы тиіс.",
    legalStatus: draftStatus.kz,
    sections: [
      {
        id: "categories",
        title: "1. Үш санат",
        paragraphs: [
          "Санаттар мақсат бойынша бөлінеді. Бір міндетті емес санатқа келісу екіншісін автоматты қоспауы тиіс.",
        ],
        bullets: [
          "Қажетті: қауіпсіздік, сессия мен себет жұмысы және келісім таңдауын сақтау.",
          "Аналитика: қолданушы рұқсат бергеннен кейін сайт қолданылуы мен қатені өлшеу.",
          "Маркетинг: бөлек рұқсаттан кейінгі жарнама және дербестендіру технологиялары.",
        ],
      },
      {
        id: "current-state",
        title: "2. Pre-launch нұсқасының қазіргі күйі",
        paragraphs: [
          "Интерфейс таңдалған санаттарды, саясат нұсқасын және жаңарту уақытын браузерде сақтайды әрі сервер қолжетімді болса, келісім жазбасын жібереді. Бұл техникалық әрекеттің сипаттамасы, cookie толық тізілімі емес.",
          "Нақты cookie, домен, провайдер, мақсат және сақтау мерзімі production іске қосылғанға дейін іс жүзінде қосылған сервистер бойынша жасалуы керек. Біз алдын ала ойдан шығарылған жазба жарияламаймыз.",
        ],
      },
      {
        id: "choices",
        title: "3. Қолжетімді әрекеттер",
        paragraphs: [
          "Қолданушы барлық санатты қабылдай алады, міндетті еместерден бас тарта алады, әр санатты баптап, таңдауын кейін өзгерте алады. Аналитика мен маркетингтен бас тарту сайттың негізгі мазмұнын жаппауы тиіс.",
        ],
      },
      {
        id: "approval",
        title: "4. Нені бекіту қажет",
        paragraphs: [
          "Үшінші тарап сервистері қосылғанға дейін иесі мен бейінді маман тізілімді, негізді, мерзімді, келісімді қайтару тетігін және болса, трансшекаралық беруді тексеруі тиіс.",
        ],
      },
    ],
    related: [
      { href: "/consent", label: "Таңдауды басқару" },
      { href: "/privacy", label: "Құпиялық саясатының жобасы" },
    ],
  },
};

export const consentContent: Localized<LegalPage> = {
  en: {
    seo: {
      title: "Consent and data settings — draft",
      description:
        "How QULTURE separates necessary, service and marketing consent. The legal wording still requires approval.",
    },
    eyebrow: "CONSENT / DRAFT",
    title: "One choice does not mean consent to everything",
    lead:
      "Getting an answer, joining a waitlist and subscribing to marketing are different actions. Each needs a clear explanation and a separate choice.",
    legalStatus: draftStatus.en,
    sections: [
      {
        id: "principles",
        title: "1. How purposes are separated",
        paragraphs: [
          "Necessary processing supports the requested action and security. A service notification relates to a specific request, for example notifying someone when a selected variant is available. A marketing subscription is never enabled with it automatically.",
        ],
      },
      {
        id: "record",
        title: "2. What the system records",
        paragraphs: [
          "A choice record contains the categories, version of the text shown and time. For a form it also records the specific consent purpose, but not unnecessary conversation content or sensitive data.",
        ],
      },
      {
        id: "change",
        title: "3. How to change a choice",
        paragraphs: [
          "Cookie settings can be opened again from this page or the footer. A withdrawal route for service and marketing messages, and an official contact for requests, must be added after providers and business details are approved.",
        ],
      },
      {
        id: "legal-copy",
        title: "4. Consent wording is not approved yet",
        paragraphs: [
          "A qualified specialist must prepare the consent wording for personal-data processing, list of responsible parties, retention period and applicable rights. This information page does not replace that consent.",
        ],
      },
    ],
    related: [
      { href: "/cookies", label: "Cookie categories" },
      { href: "/privacy", label: "Data policy draft" },
    ],
  },
  ru: {
    seo: {
      title: "Согласия и настройки данных — черновик",
      description:
        "Как QULTURE разделяет необходимые, сервисные и маркетинговые согласия. Юридические тексты требуют утверждения.",
    },
    eyebrow: "CONSENT / DRAFT",
    title: "Один выбор не означает согласие на всё",
    lead:
      "Получить ответ, встать в лист ожидания и подписаться на маркетинг — разные действия. Для каждого должно быть понятное объяснение и отдельный выбор.",
    legalStatus: draftStatus.ru,
    sections: [
      {
        id: "principles",
        title: "1. Как разделяются цели",
        paragraphs: [
          "Необходимая обработка обеспечивает запрошенное действие и безопасность. Сервисное уведомление относится к конкретному запросу — например, сообщить о поступлении выбранного варианта. Маркетинговая подписка не включается вместе с ним автоматически.",
        ],
      },
      {
        id: "record",
        title: "2. Что фиксирует система",
        paragraphs: [
          "Запись выбора содержит категории, версию показанного текста и время. Для формы дополнительно фиксируется конкретная цель согласия, но не лишнее содержание переписки или чувствительные данные.",
        ],
      },
      {
        id: "change",
        title: "3. Как изменить выбор",
        paragraphs: [
          "Настройки cookie можно открыть повторно с этой страницы или из footer. Механизм отзыва согласия на сервисные и маркетинговые сообщения, а также официальный контакт для запросов должны быть добавлены после утверждения поставщиков и реквизитов.",
        ],
      },
      {
        id: "legal-copy",
        title: "4. Текст согласия ещё не утверждён",
        paragraphs: [
          "Формулировка согласия на обработку персональных данных, перечень ответственных лиц, срок и применимые права должны быть подготовлены профильным специалистом. Эта информационная страница не заменяет такое согласие.",
        ],
      },
    ],
    related: [
      { href: "/cookies", label: "Категории cookie" },
      { href: "/privacy", label: "Проект политики данных" },
    ],
  },
  kz: {
    seo: {
      title: "Келісім және дерек баптаулары — жоба",
      description:
        "QULTURE қажетті, сервистік және маркетингтік келісімдерді қалай бөледі. Заңдық мәтіндер бекітуді қажет етеді.",
    },
    eyebrow: "CONSENT / DRAFT",
    title: "Бір таңдау бәріне келісуді білдірмейді",
    lead:
      "Жауап алу, күту тізіміне қосылу және маркетингке жазылу — бөлек әрекеттер. Әрқайсысына түсінікті түсіндірме мен жеке таңдау қажет.",
    legalStatus: draftStatus.kz,
    sections: [
      {
        id: "principles",
        title: "1. Мақсаттар қалай бөлінеді",
        paragraphs: [
          "Қажетті өңдеу сұралған әрекет пен қауіпсіздікті қамтамасыз етеді. Сервистік хабарлама нақты сұрауға қатысты — мысалы, таңдалған нұсқа түскенін хабарлау. Маркетинг жазылымы онымен бірге автоматты қосылмайды.",
        ],
      },
      {
        id: "record",
        title: "2. Жүйе нені тіркейді",
        paragraphs: [
          "Таңдау жазбасы санаттарды, көрсетілген мәтін нұсқасын және уақытты қамтиды. Форма үшін келісімнің нақты мақсаты қосымша белгіленеді, бірақ артық хат мазмұны немесе сезімтал дерек жазылмайды.",
        ],
      },
      {
        id: "change",
        title: "3. Таңдауды қалай өзгертуге болады",
        paragraphs: [
          "Cookie баптауларын осы беттен немесе footer арқылы қайта ашуға болады. Сервистік және маркетингтік хабарлама келісімін қайтару тетігі мен ресми сұрау байланысы провайдерлер мен деректемелер бекітілгеннен кейін қосылуы тиіс.",
        ],
      },
      {
        id: "legal-copy",
        title: "4. Келісім мәтіні әлі бекітілмеген",
        paragraphs: [
          "Жеке деректі өңдеуге келісім тұжырымы, жауапты тұлғалар тізімі, мерзім және қолданылатын құқықтарды бейінді маман дайындауы керек. Бұл ақпараттық бет мұндай келісімді алмастырмайды.",
        ],
      },
    ],
    related: [
      { href: "/cookies", label: "Cookie санаттары" },
      { href: "/privacy", label: "Дерек саясатының жобасы" },
    ],
  },
};
