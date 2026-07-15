import type { Localized } from "@/lib/i18n";
import type { FaqPage } from "./types";

export const faqContent: Localized<FaqPage> = {
  en: {
    seo: {
      title: "Questions and answers",
      description:
        "Clear answers about the QULTURE launch, products, sizing, technology, notifications and future commerce.",
    },
    eyebrow: "FAQ / CURRENT ANSWERS",
    title: "What is known now",
    lead:
      "We answer only from published information. When a decision is not yet approved, we say that plainly.",
    status: "Updated as information is verified",
    sections: [],
    items: [
      {
        id: "can-i-buy",
        question: "Can I buy QULTURE clothing already?",
        answer: [
          "No. The site is currently in pre-launch: live products, prices, stock and a sales date have not been published. We do not accept payment or create demonstration orders that resemble real ones.",
        ],
      },
      {
        id: "first-product",
        question: "What is being developed first?",
        answer: [
          "The current product focus is an urban top and trousers. The architecture supports each component separately or as a set, while final models and variants will appear only after the catalogue is approved.",
        ],
      },
      {
        id: "separate-sizes",
        question: "Will I be able to choose different sizes for the top and bottom?",
        answer: [
          "Yes. The product and digital architecture support independent sizing for each component. Available combinations will depend on the variants and stock that are actually published.",
        ],
      },
      {
        id: "temperature",
        question: "What temperature range is the clothing designed for?",
        answer: [
          "There is no verified temperature range yet. QULTURE will not turn fabric weight into invented degrees. After testing, we will describe specific scenarios: time outside, activity, transport and layers used.",
        ],
        links: [{ href: "/technology", label: "How scenarios are verified" }],
      },
      {
        id: "size-assist",
        question: "Will QULTURE Assist choose my size exactly?",
        answer: [
          "No. It should not guarantee fit. Public size guidance will open after garment measurements and fit rules are available. The result will include a confidence level and the difference to adjacent sizes; when data is insufficient, the question is passed to a person.",
        ],
      },
      {
        id: "materials",
        question: "What will the product be made from?",
        answer: [
          "The final composition has not been published. Material, function and care information will appear after a production sample is verified and the product team approves it. Until then, the site does not assign properties to a fabric.",
        ],
      },
      {
        id: "waitlist-marketing",
        question: "Does joining the waitlist automatically subscribe me to marketing?",
        answer: [
          "No. A service notification about launch or restock and a marketing subscription are different purposes. Marketing requires a separate choice that can be withdrawn.",
        ],
        links: [{ href: "/consent", label: "How consent choices are separated" }],
      },
      {
        id: "delivery-returns",
        question: "What will delivery and returns look like?",
        answer: [
          "Delivery areas, cost, timing and legal terms are not approved yet. Before sales begin, they will be shown before payment and published in a separate versioned document. The current delivery page is clearly marked as a working draft.",
        ],
        links: [{ href: "/delivery-and-returns", label: "Delivery terms status" }],
      },
      {
        id: "languages",
        question: "Which languages does the site support?",
        answer: [
          "English, Russian and Kazakh are available as separate localized versions of the site. The language you choose applies to the public interface and editorial content.",
        ],
      },
      {
        id: "ai-sources",
        question: "Where does QULTURE Assist get its answers?",
        answer: [
          "The assistant uses only published brand, product and policy records, and after commerce launches it will use current catalogue and order data through restricted tools. When a verified source is unavailable, the correct answer is to say so rather than invent one.",
        ],
      },
    ],
    related: [
      { href: "/contacts", label: "Contact channels status" },
      { href: "/journal", label: "Development journal" },
    ],
  },
  ru: {
    seo: {
      title: "Вопросы и ответы",
      description:
        "Честные ответы о запуске QULTURE, продуктах, размерах, технологиях, уведомлениях и будущей торговле.",
    },
    eyebrow: "FAQ / CURRENT ANSWERS",
    title: "Что известно сейчас",
    lead:
      "Мы отвечаем только на основании опубликованной информации. Там, где решение ещё не утверждено, это обозначено прямо.",
    status: "Обновляется по мере подтверждения данных",
    sections: [],
    items: [
      {
        id: "can-i-buy",
        question: "Можно ли уже купить одежду QULTURE?",
        answer: [
          "Нет. Сейчас сайт работает в pre-launch режиме: реальные товары, цены, остатки и дата начала продаж не опубликованы. Мы не принимаем оплату и не создаём демонстрационные заказы, похожие на настоящие.",
        ],
      },
      {
        id: "first-product",
        question: "Что разрабатывается первым?",
        answer: [
          "Текущий продуктовый фокус — городской верх и брюки. Архитектура поддерживает покупку каждого компонента отдельно или в составе комплекта, но финальные модели и варианты появятся только после утверждения каталога.",
        ],
      },
      {
        id: "separate-sizes",
        question: "Можно ли будет выбрать разные размеры верха и низа?",
        answer: [
          "Да, это заложено в продуктовую и цифровую архитектуру: размеры компонентов выбираются независимо. Доступные сочетания будут зависеть от реально опубликованных вариантов и остатков.",
        ],
      },
      {
        id: "temperature",
        question: "На какую температуру рассчитана одежда?",
        answer: [
          "Подтверждённого температурного диапазона сейчас нет. QULTURE не будет переводить плотность ткани в выдуманные градусы. После тестов будут описаны конкретные сценарии: продолжительность на улице, активность, транспорт и используемые слои.",
        ],
        links: [{ href: "/technology", label: "Как проверяются сценарии" }],
      },
      {
        id: "size-assist",
        question: "QULTURE Assist точно подберёт размер?",
        answer: [
          "Нет, он не должен гарантировать посадку. Публичная рекомендация размера включится после появления замеров изделия и правил fit. Результат будет содержать уровень уверенности и отличие соседнего размера; при недостатке данных вопрос передаётся человеку.",
        ],
      },
      {
        id: "materials",
        question: "Из чего будет сделан продукт?",
        answer: [
          "Финальный состав пока не опубликован. Материал, функции и уход появятся после проверки по серийному образцу и утверждения продуктовой командой. До этого сайт не приписывает ткани свойства.",
        ],
      },
      {
        id: "waitlist-marketing",
        question: "Лист ожидания автоматически подписывает на рекламу?",
        answer: [
          "Нет. Сервисное уведомление о запуске или поступлении и маркетинговая подписка — разные цели. Маркетинг требует отдельного выбора, который можно отозвать.",
        ],
        links: [{ href: "/consent", label: "О разделении согласий" }],
      },
      {
        id: "delivery-returns",
        question: "Какие будут доставка и возврат?",
        answer: [
          "География, стоимость, сроки и юридические условия ещё не утверждены. До начала продаж они будут показаны до оплаты и опубликованы отдельной версией документа. Текущая страница доставки — явно помеченный рабочий черновик.",
        ],
        links: [{ href: "/delivery-and-returns", label: "Статус условий доставки" }],
      },
      {
        id: "languages",
        question: "На каких языках работает сайт?",
        answer: [
          "Английская, русская и казахская версии доступны как отдельные локализованные страницы. Выбранный язык применяется ко всему публичному интерфейсу и редакционному контенту.",
        ],
      },
      {
        id: "ai-sources",
        question: "Откуда QULTURE Assist берёт ответы?",
        answer: [
          "Консультант использует только опубликованные записи о бренде, продукте и политиках, а после запуска торговли — актуальные данные каталога и заказов через ограниченные инструменты. Если подтверждённого источника нет, корректный ответ — сообщить об этом, а не додумывать.",
        ],
      },
    ],
    related: [
      { href: "/contacts", label: "Статус каналов связи" },
      { href: "/journal", label: "Журнал разработки" },
    ],
  },
  kz: {
    seo: {
      title: "Сұрақтар мен жауаптар",
      description:
        "QULTURE іске қосылуы, өнім, өлшем, технология, хабарлама және болашақ сауда туралы ашық жауаптар.",
    },
    eyebrow: "FAQ / CURRENT ANSWERS",
    title: "Қазір не белгілі",
    lead:
      "Біз тек жарияланған ақпаратқа сүйеніп жауап береміз. Шешім әлі бекітілмесе, оны ашық көрсетеміз.",
    status: "Дерек расталған сайын жаңартылады",
    sections: [],
    items: [
      {
        id: "can-i-buy",
        question: "QULTURE киімін қазір сатып алуға бола ма?",
        answer: [
          "Жоқ. Қазір сайт pre-launch режимінде: нақты тауар, баға, қалдық және сату басталатын күн жарияланған жоқ. Біз төлем қабылдамаймыз және шынайыға ұқсайтын демонстрациялық тапсырыс жасамаймыз.",
        ],
      },
      {
        id: "first-product",
        question: "Алдымен қандай өнім әзірленіп жатыр?",
        answer: [
          "Қазіргі өнім бағыты — қалалық үстіңгі бөлік пен шалбар. Архитектура әр бөлікті жеке немесе жиынтық ретінде сатып алуды қолдайды, бірақ соңғы модельдер мен нұсқалар каталог бекітілгеннен кейін ғана пайда болады.",
        ],
      },
      {
        id: "separate-sizes",
        question: "Үстіңгі және астыңғы бөліктің өлшемін бөлек таңдауға бола ма?",
        answer: [
          "Иә, бұл өнім мен цифрлық архитектураға енгізілген: компонент өлшемдері тәуелсіз таңдалады. Қолжетімді үйлесім нақты жарияланған нұсқалар мен қалдыққа байланысты болады.",
        ],
      },
      {
        id: "temperature",
        question: "Киім қандай температураға арналған?",
        answer: [
          "Қазір расталған температура диапазоны жоқ. QULTURE мата тығыздығын ойдан шығарылған градусқа айналдырмайды. Сынақтан кейін далада өткізілетін уақыт, белсенділік, көлік және қабаттар сияқты нақты сценарийлер сипатталады.",
        ],
        links: [{ href: "/technology", label: "Сценарийлер қалай тексеріледі" }],
      },
      {
        id: "size-assist",
        question: "QULTURE Assist өлшемді дәл таңдап бере ме?",
        answer: [
          "Жоқ, ол пішімге кепілдік бермеуі керек. Ашық ұсыным бұйым өлшемдері мен fit ережелері пайда болғаннан кейін қосылады. Нәтижеде сенімділік деңгейі мен көршілес өлшем айырмасы беріледі; дерек жетпесе, сұрақ адамға жолданады.",
        ],
      },
      {
        id: "materials",
        question: "Өнім неден жасалады?",
        answer: [
          "Соңғы құрам әзірге жарияланған жоқ. Материал, функция және күтім сериялық үлгімен тексеріліп, өнім командасы бекіткеннен кейін шығады. Оған дейін сайт матаға қасиет телімейді.",
        ],
      },
      {
        id: "waitlist-marketing",
        question: "Күту тізімі жарнамаға автоматты түрде жаза ма?",
        answer: [
          "Жоқ. Іске қосылу не тауар түсуі туралы сервистік хабарлама мен маркетинг жазылымы — бөлек мақсат. Маркетинг үшін қайтарып алуға болатын жеке таңдау керек.",
        ],
        links: [{ href: "/consent", label: "Келісімдердің бөлінуі" }],
      },
      {
        id: "delivery-returns",
        question: "Жеткізу мен қайтару қалай болады?",
        answer: [
          "География, құн, мерзім және заңдық шарттар әлі бекітілмеген. Сату басталғанға дейін олар төлемге дейін көрсетіліп, құжаттың бөлек нұсқасы ретінде жарияланады. Қазіргі жеткізу беті жұмыс жобасы деп анық белгіленген.",
        ],
        links: [{ href: "/delivery-and-returns", label: "Жеткізу шарттарының мәртебесі" }],
      },
      {
        id: "languages",
        question: "Сайт қай тілдерде жұмыс істейді?",
        answer: [
          "Ағылшын, орыс және қазақ нұсқалары бөлек локализацияланған бет ретінде қолжетімді. Таңдалған тіл бүкіл ашық интерфейс пен редакциялық контентке қолданылады.",
        ],
      },
      {
        id: "ai-sources",
        question: "QULTURE Assist жауаптарды қайдан алады?",
        answer: [
          "Кеңесші бренд, өнім және саясат туралы тек жарияланған жазбаларды, ал сауда іске қосылғаннан кейін шектеулі құралдар арқылы каталог пен тапсырыстың өзекті деректерін қолданады. Расталған дереккөз болмаса, ойдан қоспай, соны ашық айтуы керек.",
        ],
      },
    ],
    related: [
      { href: "/contacts", label: "Байланыс арналарының мәртебесі" },
      { href: "/journal", label: "Әзірлеу журналы" },
    ],
  },
};
