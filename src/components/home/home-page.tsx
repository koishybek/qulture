import Image from "next/image";
import Link from "next/link";

import { OpenAIButton } from "@/components/ai/open-ai-button";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { HeroMedia } from "@/components/site/hero-media";
import { ArrowIcon } from "@/components/ui/icons";
import type { Locale } from "@/lib/i18n";

type HomePresentation = {
  content?: Record<string, unknown>;
  visibility?: Record<string, unknown>;
  heroPoster?: string;
  heroVideo?: string;
  policyVersion?: string;
  captureEnabled?: boolean;
};

type ProductStudyProps = {
  action: string;
  alt: string;
  href: string;
  label: string;
  position: "set" | "top" | "pants";
  soon: string;
};

type ScenarioFrameProps = {
  alt: string;
  label: string;
  layer: string;
  position: "street" | "car" | "transit" | "inside";
};

function route(locale: Locale, path: string) {
  return `/${locale}${path}`;
}

function ProductStudy({ action, alt, href, label, position, soon }: ProductStudyProps) {
  return (
    <Link className={`product-study product-study--${position}`} href={href}>
      <span className="product-study__head"><strong>{label}</strong><span>{soon}</span></span>
      <span className="product-study__media">
        <Image fill alt={alt} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 26vw" src="/media/hero/hero-poster.png" />
      </span>
      <span className="product-study__action">{action} <ArrowIcon /></span>
    </Link>
  );
}

function ScenarioFrame({ alt, label, layer, position }: ScenarioFrameProps) {
  return (
    <figure className={`scenario-frame scenario-frame--${position}`}>
      <div className="scenario-frame__media">
        <Image fill alt={alt} sizes="(max-width: 700px) 82vw, (max-width: 1100px) 44vw, 28vw" src="/media/editorial/city-scenarios.png" />
      </div>
      <figcaption>
        <strong>{label}</strong>
        <span>{layer}</span>
      </figcaption>
    </figure>
  );
}

const copy = {
  en: {
    heroTitle: "DESIGNED FOR\nCHANGING CLIMATES.",
    heroSubtitle: "Urban clothing for wind, layers and movement.",
    heroPrimary: "Explore the system",
    heroSecondary: "Ask QULTURE AI",
    systemMeta: "02 / City layer system",
    systemTitle: "CITY LAYER\nSYSTEM",
    systemLine: "One set. Two independent sizes.",
    systemBody: "Build the whole system or choose only the layer you need.",
    viewSystem: "Explore the system",
    soon: "In development",
    set: "Set",
    top: "Top",
    pants: "Trousers",
    setAction: "City Layer Set",
    topAction: "City Layer Top",
    pantsAction: "City Layer Trousers",
    principles: ["Layering logic", "Climate scenarios", "Material construction", "Movement in the city"],
    scenariosMeta: "03 / City route",
    scenariosTitle: "FROM STREET\nTO INSIDE",
    scenarios: ["Street", "Car", "Transit", "Interior"],
    layers: ["Solo / base / outerwear", "Seated / articulated", "Mobile / protected", "Layer off / reset"],
    proofMeta: "04 / Evidence index",
    proofTitle: "PROOF,\nNOT PROMISES",
    proofBody: "Measurements, materials and tests are published only after verification.",
    proofCta: "Receive updates",
    proofItems: [
      ["Layering logic", "Publishing after fit-system verification."],
      ["Material construction", "Documentation in progress."],
      ["Fit and movement", "Testing across real city routes."],
      ["Climate scenarios", "Publishing after field verification."],
      ["Care and longevity", "Care guidance is being prepared."],
    ],
    proofStatus: "In testing",
    aiMeta: "05 / QULTURE Assist",
    aiTitle: "ASK QULTURE",
    aiBody: "Find a size, build for a climate or compare the system with confirmed product context.",
    aiActions: ["Find my size", "Build for my climate", "Compare the set", "Explain the material", "Delivery & returns", "Speak to a consultant"],
    openAI: "Open the assistant",
    aiPreviewTitle: "QULTURE AI / product context",
    aiPreviewStatus: "Ready",
    aiPreviewQuestion: "What should I wear between transit and the studio?",
    aiPreviewAnswer: "Start with the City Layer Set. I can narrow the recommendation once you share your city and typical commute.",
    aiPreviewPrompt: "Ask about your climate or fit…",
    brandMeta: "06 / Astana, Kazakhstan",
    brandTitle: "DESIGNED IN ASTANA.\nBUILT FOR CHANGING CLIMATES.",
    brandBody: "A city system for shifting wind, transport, streets and interiors — observed from Astana, then tested in movement.",
    journalMeta: "Journal / progress",
    journalTitle: "BUILDING THE\nCITY LAYER SYSTEM",
    journalBody: "No invented dates. We publish only verified progress and the work still in motion.",
    journalCta: "View journal",
    latestUpdates: "Latest updates",
    progress: ["Fit and movement", "Construction details", "Materials and hardware", "Model data"],
    waitlistMeta: "07 / Launch updates",
    waitlistTitle: "JOIN THE WAITLIST",
    waitlistBody: "Get a note when the configuration you selected becomes available.",
    altSet: "The complete QULTURE City Layer Set",
    altTop: "Close study of the QULTURE City Layer Top",
    altPants: "Detail study of the QULTURE City Layer Trousers",
  },
  ru: {
    heroTitle: "СОЗДАНО ДЛЯ\nМЕНЯЮЩЕГОСЯ КЛИМАТА.",
    heroSubtitle: "Городская одежда для ветра, слоёв и движения.",
    heroPrimary: "Смотреть систему",
    heroSecondary: "Спросить QULTURE AI",
    systemMeta: "02 / Система городских слоёв",
    systemTitle: "СИСТЕМА\nГОРОДСКИХ СЛОЁВ",
    systemLine: "Один комплект. Два независимых размера.",
    systemBody: "Соберите систему целиком или выберите только нужный слой.",
    viewSystem: "Смотреть систему",
    soon: "В разработке",
    set: "Комплект",
    top: "Верх",
    pants: "Брюки",
    setAction: "Комплект City Layer",
    topAction: "Верх City Layer",
    pantsAction: "Брюки City Layer",
    principles: ["Логика слоёв", "Сценарии климата", "Конструкция материала", "Движение в городе"],
    scenariosMeta: "03 / Городской маршрут",
    scenariosTitle: "ОТ УЛИЦЫ\nК ПОМЕЩЕНИЮ",
    scenarios: ["Улица", "Автомобиль", "Транспорт", "Помещение"],
    layers: ["Соло / базовый / верхний", "Сидя / свободно", "В движении / защищён", "Снять слой / восстановить"],
    proofMeta: "04 / Индекс доказательств",
    proofTitle: "ДОКАЗАТЕЛЬСТВА,\nНЕ ОБЕЩАНИЯ",
    proofBody: "Замеры, материалы и тесты публикуются только после проверки.",
    proofCta: "Получать обновления",
    proofItems: [
      ["Логика слоёв", "Публикуем после проверки системы посадки."],
      ["Конструкция материала", "Документация в процессе."],
      ["Посадка и движение", "Тестируем на реальных городских маршрутах."],
      ["Сценарии климата", "Опубликуем после полевой проверки."],
      ["Уход и долговечность", "Готовим инструкции по уходу."],
    ],
    proofStatus: "В тестировании",
    aiMeta: "05 / QULTURE Assist",
    aiTitle: "СПРОСИТЬ QULTURE",
    aiBody: "Поможем выбрать размер, собрать систему под климат и сравнить вещи с подтверждённым контекстом продукта.",
    aiActions: ["Подобрать размер", "Собрать под мой климат", "Сравнить комплект", "Объяснить материал", "Доставка и возврат", "Связаться с консультантом"],
    openAI: "Открыть консультанта",
    aiPreviewTitle: "QULTURE AI / контекст продукта",
    aiPreviewStatus: "Готов",
    aiPreviewQuestion: "Что надеть между транспортом и студией?",
    aiPreviewAnswer: "Начните с комплекта City Layer. Я уточню рекомендацию, если вы расскажете о городе и обычном маршруте.",
    aiPreviewPrompt: "Спросите о климате или посадке…",
    brandMeta: "06 / Астана, Казахстан",
    brandTitle: "СОЗДАНО В АСТАНЕ.\nДЛЯ МЕНЯЮЩЕГОСЯ КЛИМАТА.",
    brandBody: "Система для ветра, транспорта, улицы и помещения — наблюдаемая в Астане и проверяемая в движении.",
    journalMeta: "Журнал / прогресс",
    journalTitle: "СОЗДАЁМ\nСИСТЕМУ CITY LAYER",
    journalBody: "Без выдуманных дат. Публикуем только подтверждённый прогресс и работу, которая ещё продолжается.",
    journalCta: "Открыть журнал",
    latestUpdates: "Последние обновления",
    progress: ["Посадка и движение", "Конструктивные узлы", "Материалы и фурнитура", "Данные модели"],
    waitlistMeta: "07 / Новости запуска",
    waitlistTitle: "ВСТУПИТЬ В ЛИСТ ОЖИДАНИЯ",
    waitlistBody: "Сообщим, когда выбранная вами конфигурация станет доступна.",
    altSet: "Полный комплект QULTURE City Layer",
    altTop: "Крупный план верха QULTURE City Layer",
    altPants: "Деталь брюк QULTURE City Layer",
  },
  kz: {
    heroTitle: "ӨЗГЕРМЕЛІ\nКЛИМАТҚА АРНАЛҒАН.",
    heroSubtitle: "Желге, қабаттап киюге және қозғалысқа арналған қалалық киім.",
    heroPrimary: "Жүйені көру",
    heroSecondary: "QULTURE AI-ден сұрау",
    systemMeta: "02 / Қалалық қабаттар жүйесі",
    systemTitle: "ҚАЛАЛЫҚ\nҚАБАТТАР ЖҮЙЕСІ",
    systemLine: "Бір жиынтық. Екі тәуелсіз өлшем.",
    systemBody: "Жүйені толығымен жинаңыз немесе қажет қабатты ғана таңдаңыз.",
    viewSystem: "Жүйені көру",
    soon: "Әзірленуде",
    set: "Жиынтық",
    top: "Үсті",
    pants: "Шалбар",
    setAction: "City Layer жиынтығы",
    topAction: "City Layer үсті",
    pantsAction: "City Layer шалбары",
    principles: ["Қабаттау логикасы", "Климат сценарийлері", "Материал құрылысы", "Қаладағы қозғалыс"],
    scenariosMeta: "03 / Қалалық маршрут",
    scenariosTitle: "КӨШЕДЕН\nҒИМАРАТҚА ДЕЙІН",
    scenarios: ["Көше", "Автокөлік", "Көлік", "Ғимарат"],
    layers: ["Жеке / негізгі / сыртқы", "Отыру / еркін", "Қозғалыс / қорғаныс", "Қабатты шешу / қалпына келу"],
    proofMeta: "04 / Дәлелдер индексі",
    proofTitle: "ДӘЛЕЛДЕР,\nУӘДЕЛЕР ЕМЕС",
    proofBody: "Өлшемдер, материалдар мен сынақтар тек тексеруден кейін жарияланады.",
    proofCta: "Жаңартуларды алу",
    proofItems: [
      ["Қабаттау логикасы", "Пішім жүйесін тексергеннен кейін жариялаймыз."],
      ["Материал құрылысы", "Құжаттама дайындалуда."],
      ["Пішім және қозғалыс", "Нақты қалалық маршруттарда сынақтан өтуде."],
      ["Климат сценарийлері", "Далалық тексерістен кейін жарияланады."],
      ["Күтім және ұзақтық", "Күтім нұсқаулығы дайындалуда."],
    ],
    proofStatus: "Сынақта",
    aiMeta: "05 / QULTURE Assist",
    aiTitle: "QULTURE-ДЕН СҰРАУ",
    aiBody: "Өлшемді таңдауға, климатқа сай жүйені жинауға және заттарды расталған өнім контекстімен салыстыруға көмектесеміз.",
    aiActions: ["Өлшемді табу", "Менің климатыма жинау", "Жиынтықты салыстыру", "Материалды түсіндіру", "Жеткізу және қайтару", "Кеңесшімен сөйлесу"],
    openAI: "Кеңесшіні ашу",
    aiPreviewTitle: "QULTURE AI / өнім контексті",
    aiPreviewStatus: "Дайын",
    aiPreviewQuestion: "Көлік пен студия арасында не киген дұрыс?",
    aiPreviewAnswer: "City Layer жиынтығынан бастаңыз. Қалаңыз бен күнделікті маршрутыңызды айтсаңыз, ұсынымды нақтылаймын.",
    aiPreviewPrompt: "Климат немесе пішім туралы сұраңыз…",
    brandMeta: "06 / Астана, Қазақстан",
    brandTitle: "АСТАНАДА ЖОБАЛАНҒАН.\nӨЗГЕРМЕЛІ КЛИМАТҚА АРНАЛҒАН.",
    brandBody: "Жел, көлік, көше мен ғимаратқа арналған жүйе — Астанада байқалып, қозғалыста тексеріледі.",
    journalMeta: "Журнал / прогресс",
    journalTitle: "CITY LAYER\nЖҮЙЕСІН ЖАСАП ЖАТЫРМЫЗ",
    journalBody: "Ойдан шығарылған күндерсіз. Тек расталған прогресті және жалғасып жатқан жұмысты жариялаймыз.",
    journalCta: "Журналды ашу",
    latestUpdates: "Соңғы жаңартулар",
    progress: ["Пішім және қозғалыс", "Құрылымдық түйіндер", "Материалдар мен фурнитура", "Модель деректері"],
    waitlistMeta: "07 / Іске қосылу жаңалықтары",
    waitlistTitle: "КҮТУ ТІЗІМІНЕ ҚОСЫЛУ",
    waitlistBody: "Таңдаған конфигурацияңыз қолжетімді болғанда хабарлаймыз.",
    altSet: "QULTURE City Layer толық жиынтығы",
    altTop: "QULTURE City Layer үстінің жақын көрінісі",
    altPants: "QULTURE City Layer шалбарының деталі",
  },
} as const;

export function HomePage({ locale, presentation = {} }: { locale: Locale; presentation?: HomePresentation }) {
  const base = copy[locale];
  const configuredText = Object.fromEntries(
    Object.entries(presentation.content ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  const heroSubtitle = configuredText.heroSubtitle ?? configuredText.title ?? base.heroSubtitle;
  const journalBody = configuredText.journalBody ?? configuredText.note ?? base.journalBody;
  const visible = (section: string) => presentation.visibility?.[section] !== false;

  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <HeroMedia poster={presentation.heroPoster} video={presentation.heroVideo} />
        <div className="home-hero__scrim" />
        <div className="home-hero__content home-rail">
          <p className="home-hero__index">01 / QULTURE</p>
          <h1 id="home-hero-title">{base.heroTitle}</h1>
          <p>{heroSubtitle}</p>
          <div className="home-hero__actions">
            <Link className="q-button" href={visible("cityLayerSystem") ? "#city-layer-system" : route(locale, "/waitlist")}>{base.heroPrimary}<ArrowIcon /></Link>
            <OpenAIButton className="q-text-link" entryPoint="hero">{base.heroSecondary}<ArrowIcon /></OpenAIButton>
          </div>
        </div>
        <a aria-label={base.heroPrimary} className="home-hero__scroll" href={visible("cityLayerSystem") ? "#city-layer-system" : route(locale, "/waitlist")}><span>{base.heroPrimary}</span><ArrowIcon /></a>
      </section>

      {visible("cityLayerSystem") ? <section className="system-section" id="city-layer-system">
        <div className="home-rail system-section__grid">
          <div className="system-section__intro">
            <p className="q-meta">{base.systemMeta}</p>
            <h2 className="q-display q-display--medium">{base.systemTitle}</h2>
            <p className="q-lead">{base.systemLine}</p>
            <p className="system-section__body">{base.systemBody}</p>
            <Link className="q-button" href={route(locale, "/build-a-set")}>{base.viewSystem}<ArrowIcon /></Link>
          </div>
          <div className="system-section__products">
            <ProductStudy action={base.setAction} alt={base.altSet} href={route(locale, "/build-a-set")} label={base.set} position="set" soon={base.soon} />
            <ProductStudy action={base.topAction} alt={base.altTop} href={route(locale, "/shop")} label={base.top} position="top" soon={base.soon} />
            <ProductStudy action={base.pantsAction} alt={base.altPants} href={route(locale, "/shop")} label={base.pants} position="pants" soon={base.soon} />
          </div>
        </div>
      </section> : null}

      <section className="principles-strip" aria-label={base.systemTitle}>
        <div className="home-rail principles-strip__grid">
          {base.principles.map((principle, index) => <span key={principle}><small>0{index + 1}</small>{principle}</span>)}
        </div>
      </section>

      {visible("scenarios") ? <section className="scenarios-section">
        <div className="home-rail">
          <div className="scenarios-section__heading">
            <p className="q-meta">{base.scenariosMeta}</p>
            <h2 className="q-heading">{base.scenariosTitle}</h2>
          </div>
          <div className="scenarios-section__grid">
            <ScenarioFrame alt={base.scenarios[0]} label={base.scenarios[0]} layer={base.layers[0]} position="street" />
            <ScenarioFrame alt={base.scenarios[1]} label={base.scenarios[1]} layer={base.layers[1]} position="car" />
            <ScenarioFrame alt={base.scenarios[2]} label={base.scenarios[2]} layer={base.layers[2]} position="transit" />
            <ScenarioFrame alt={base.scenarios[3]} label={base.scenarios[3]} layer={base.layers[3]} position="inside" />
          </div>
        </div>
      </section> : null}

      {visible("proof") ? <section className="proof-section q-dark">
        <div className="home-rail proof-section__grid">
          <div className="proof-section__intro">
            <p className="q-meta q-accent">{base.proofMeta}</p>
            <h2 className="q-display q-display--medium">{base.proofTitle}</h2>
            <p className="q-lead">{base.proofBody}</p>
            <Link className="q-button" href={route(locale, "/waitlist")}>{base.proofCta}<ArrowIcon /></Link>
          </div>
          <ol className="proof-list">
            {base.proofItems.map(([title, detail], index) => (
              <li key={title}>
                <details>
                  <summary><span>0{index + 1}</span><strong>{title}</strong><small>{base.proofStatus}</small><ArrowIcon /></summary>
                  <p>{detail}</p>
                </details>
              </li>
            ))}
          </ol>
        </div>
      </section> : null}

      {visible("ai") ? <section className="home-ai q-dark">
        <div className="home-rail home-ai__grid">
          <div className="home-ai__actions">
            <p className="q-meta q-accent">{base.aiMeta}</p>
            <h2 className="q-display q-display--medium">{base.aiTitle}</h2>
            <p className="q-lead">{base.aiBody}</p>
            <div className="home-ai__quick">
              {base.aiActions.map((action, index) => <OpenAIButton key={action} className="home-ai__quick-action" entryPoint="home_ai" prompt={action}><span>0{index + 1}</span>{action}<ArrowIcon /></OpenAIButton>)}
            </div>
            <OpenAIButton className="q-button" entryPoint="home_ai">{base.openAI}<ArrowIcon /></OpenAIButton>
          </div>
          <div className="home-ai__preview" aria-label={base.aiPreviewTitle}>
            <div className="home-ai__preview-head"><span>{base.aiPreviewTitle}</span><span>{base.aiPreviewStatus}</span></div>
            <div className="home-ai__conversation">
              <p className="home-ai__message home-ai__message--user"><span>01</span>{base.aiPreviewQuestion}</p>
              <p className="home-ai__message"><span>QULTURE AI</span>{base.aiPreviewAnswer}</p>
            </div>
            <div className="home-ai__preview-input"><span>{base.aiPreviewPrompt}</span><ArrowIcon /></div>
          </div>
        </div>
      </section> : null}

      {visible("about") ? <section className="brand-origin">
        <div className="home-rail brand-origin__grid">
          <p className="q-meta">{base.brandMeta}</p>
          <h2 className="q-display q-display--medium">{base.brandTitle}</h2>
          <p className="q-lead">{base.brandBody}</p>
          <div className="brand-origin__detail"><span>51.1694° N</span><span>71.4491° E</span><span>ASTANA / 2026</span></div>
        </div>
      </section> : null}

      {visible("journal") ? <section className="journal-home">
        <div className="home-rail journal-home__grid">
          <div className="journal-home__feature">
            <div className="journal-home__media"><Image fill alt={base.journalTitle} sizes="(max-width: 960px) 100vw, 44vw" src="/media/hero/hero-poster.png" /></div>
            <div className="journal-home__copy">
              <p className="q-meta">{base.journalMeta}</p>
              <h2 className="q-heading">{base.journalTitle}</h2>
              <p>{journalBody}</p>
              <Link className="q-button" href={route(locale, "/journal")}>{base.journalCta}<ArrowIcon /></Link>
            </div>
          </div>
          <div className="journal-home__rail">
            <p className="q-meta">{base.latestUpdates}</p>
            {base.progress.map((item, index) => <Link key={item} href={route(locale, "/journal/building-qulture-openly")}><small>0{index + 1}</small><span>{item}</span><ArrowIcon /></Link>)}
          </div>
        </div>
      </section> : null}

      {visible("waitlist") ? <section className="home-waitlist q-dark" id="waitlist">
        <div className="home-rail home-waitlist__grid">
          <div className="home-waitlist__intro">
            <p className="q-meta q-accent">{base.waitlistMeta}</p>
            <h2 className="q-heading">{base.waitlistTitle}</h2>
            <p>{base.waitlistBody}</p>
          </div>
          <WaitlistForm captureEnabled={presentation.captureEnabled} locale={locale} policyVersion={presentation.policyVersion} source="home" />
        </div>
      </section> : null}
    </>
  );
}
