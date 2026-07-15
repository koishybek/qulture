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

const copy = {
  ru: {
    heroSubtitle: "Городская одежда для ветра, слоёв и движения.",
    heroPrimary: "Смотреть систему",
    heroSecondary: "AI-консультант",
    systemLine: "Один комплект. Два независимых размера.",
    systemBody: "Соберите систему целиком или выберите только нужный слой.",
    viewSystem: "Смотреть систему",
    soon: "Скоро",
    principles: ["Логика слоёв", "Сценарии климата", "Материалы", "Движение в городе"],
    scenariosTitle: "From street to inside",
    scenarios: ["Улица", "Автомобиль", "Транспорт", "Помещение"],
    layers: "Solo + base layer + outerwear",
    proofBody: "Замеры, материалы и тесты публикуются только после проверки.",
    proofCta: "Получать обновления",
    proofItems: ["Снятие мерок и посадка", "Материалы и фурнитура", "Тесты на движение", "Конструктивные узлы", "Уход и эксплуатация", "Данные модели"],
    inProgress: "В работе",
    aiBody: "Помогу разобраться в системе, размере и сценариях носки.",
    aiActions: ["Помочь выбрать размер", "Сравнить set и компоненты", "Спросить о климате", "Передать вопрос команде"],
    openAI: "Открыть консультанта",
    brandBody: "Мы проектируем систему для городского движения и переменчивой среды.",
    journalBody: "Без выдуманных дат. Публикуем только подтверждённый прогресс.",
    readJournal: "Читать журнал",
    waitlistBody: "Узнайте, когда система будет готова.",
    progress: ["Тесты на движение", "Конструктивные узлы", "Материалы и фурнитура", "Данные модели"],
  },
  kz: {
    heroSubtitle: "Желге, қабаттарға және қозғалысқа арналған қалалық киім.",
    heroPrimary: "Жүйені көру",
    heroSecondary: "AI-кеңесші",
    systemLine: "Бір жиынтық. Екі тәуелсіз өлшем.",
    systemBody: "Жүйені толық жинаңыз немесе қажет қабатты ғана таңдаңыз.",
    viewSystem: "Жүйені көру",
    soon: "Жақында",
    principles: ["Қабаттау логикасы", "Климат сценарийлері", "Материалдар", "Қала қозғалысы"],
    scenariosTitle: "Көшеден ғимаратқа дейін",
    scenarios: ["Көше", "Автокөлік", "Көлік", "Ғимарат"],
    layers: "Solo + негізгі қабат + сыртқы киім",
    proofBody: "Өлшемдер, материалдар және сынақтар тек тексерілгеннен кейін жарияланады.",
    proofCta: "Жаңартуларды алу",
    proofItems: ["Өлшем және пішім", "Материалдар мен фурнитура", "Қозғалыс сынақтары", "Құрылымдық түйіндер", "Күтім және пайдалану", "Модель деректері"],
    inProgress: "Жұмыста",
    aiBody: "Жүйе, өлшем және кию сценарийлерін түсіндіруге көмектесемін.",
    aiActions: ["Өлшем таңдауға көмектесу", "Жиынтық пен бөліктерді салыстыру", "Климат туралы сұрау", "Командаға сұрақ беру"],
    openAI: "Кеңесшіні ашу",
    brandBody: "Біз қала қозғалысы мен құбылмалы ортаға арналған жүйені жобалаймыз.",
    journalBody: "Ойдан шығарылған күндерсіз. Тек расталған прогресті жариялаймыз.",
    readJournal: "Журналды оқу",
    waitlistBody: "Жүйе дайын болғанда біліңіз.",
    progress: ["Қозғалыс сынақтары", "Құрылымдық түйіндер", "Материалдар мен фурнитура", "Модель деректері"],
  },
} as const;

function route(locale: Locale, path: string) {
  return `/${locale}${path}`;
}

export function HomePage({ locale, presentation = {} }: { locale: Locale; presentation?: HomePresentation }) {
  const base = copy[locale];
  const configuredText = Object.fromEntries(
    Object.entries(presentation.content ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  const text = { ...base, ...configuredText };
  const heroSubtitle = configuredText.heroSubtitle ?? configuredText.title ?? base.heroSubtitle;
  const journalBody = configuredText.journalBody ?? configuredText.note ?? base.journalBody;
  const visible = (section: string) => presentation.visibility?.[section] !== false;

  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <HeroMedia poster={presentation.heroPoster} video={presentation.heroVideo} />
        <div className="home-hero__scrim" />
        <div className="home-hero__content">
          <h1 id="home-hero-title">DESIGNED FOR<br />CHANGING CLIMATES.</h1>
          <p>{heroSubtitle}</p>
          <div className="home-hero__actions">
            <Link className="q-button" href={visible("cityLayerSystem") ? "#city-layer-system" : route(locale, "/waitlist")}>{text.heroPrimary}<ArrowIcon /></Link>
            <OpenAIButton className="q-text-link" entryPoint="hero">{text.heroSecondary}</OpenAIButton>
          </div>
        </div>
        <a aria-label={text.heroPrimary} className="home-hero__scroll" href={visible("cityLayerSystem") ? "#city-layer-system" : route(locale, "/waitlist")}><span>01</span><ArrowIcon /></a>
      </section>

      {visible("cityLayerSystem") ? <section className="system-section" id="city-layer-system">
        <div className="system-section__intro">
          <p className="q-meta">02 / CITY LAYER SYSTEM</p>
          <h2 className="q-display q-display--medium">CITY LAYER<br />SYSTEM</h2>
          <p className="q-lead">{text.systemLine}</p>
          <p>{text.systemBody}</p>
          <Link className="q-button" href={route(locale, "/build-a-set")}>{text.viewSystem}<ArrowIcon /></Link>
        </div>
        <div className="system-section__products">
          <Link className="product-study product-study--set" href={route(locale, "/build-a-set")}>
            <span className="product-study__head"><strong>SET</strong><span>{text.soon}</span></span>
            <span className="product-study__media"><Image fill alt="Editorial preview of the QULTURE city layer set" sizes="(max-width: 960px) 100vw, 34vw" src="/media/hero/hero-poster.png" /></span>
            <span className="product-study__action">CITY LAYER SET <ArrowIcon /></span>
          </Link>
          <Link className="product-study product-study--top" href={route(locale, "/shop")}>
            <span className="product-study__head"><strong>TOP</strong><span>{text.soon}</span></span>
            <span className="product-study__media"><Image fill alt="Editorial preview of the QULTURE city layer top" sizes="(max-width: 960px) 50vw, 22vw" src="/media/hero/hero-poster.png" /></span>
            <span className="product-study__action">CITY LAYER TOP <ArrowIcon /></span>
          </Link>
          <Link className="product-study product-study--pants" href={route(locale, "/shop")}>
            <span className="product-study__head"><strong>PANTS</strong><span>{text.soon}</span></span>
            <span className="product-study__media"><Image fill alt="Editorial preview of QULTURE city layer pants" sizes="(max-width: 960px) 50vw, 22vw" src="/media/hero/hero-poster.png" /></span>
            <span className="product-study__action">CITY LAYER PANTS <ArrowIcon /></span>
          </Link>
        </div>
      </section> : null}

      <div className="principles-strip" aria-label="QULTURE product principles">
        {text.principles.map((principle, index) => <span key={principle}><small>0{index + 1}</small>{principle}</span>)}
      </div>

      {visible("scenarios") ? <section className="scenarios-section">
        <div className="scenarios-section__heading">
          <p className="q-meta">03 / CITY ROUTE</p>
          <h2 className="q-heading">{text.scenariosTitle}</h2>
        </div>
        <div className="scenarios-section__labels">{text.scenarios.map((item) => <span key={item}>{item}</span>)}</div>
        <div className="scenarios-section__media"><Image fill alt="Four QULTURE editorial wear scenarios: street, car, transport and interior" sizes="100vw" src="/media/editorial/city-scenarios.png" /></div>
        <div className="scenarios-section__layers">{text.scenarios.map((item) => <span key={item}>{text.layers}</span>)}</div>
      </section> : null}

      {visible("proof") ? <section className="proof-section q-dark">
        <div className="proof-section__intro">
          <p className="q-meta q-accent">04 / PROOF</p>
          <h2 className="q-display q-display--medium">PROOF,<br />NOT PROMISES</h2>
          <p className="q-lead">{text.proofBody}</p>
          <Link className="q-button" href={route(locale, "/waitlist")}>{text.proofCta}<ArrowIcon /></Link>
        </div>
        <ol className="proof-list">
          {text.proofItems.map((item, index) => <li key={item}><span>0{index + 1}</span><strong>{item}</strong><small>{text.inProgress}</small></li>)}
        </ol>
      </section> : null}

      {visible("ai") ? <section className="home-ai q-dark">
        <div className="home-ai__actions">
          <p className="q-meta q-accent">05 / QULTURE ASSIST</p>
          <h2 className="q-display q-display--medium">ASK QULTURE</h2>
          <p className="q-lead">{text.aiBody}</p>
          <div className="home-ai__quick">
            {text.aiActions.map((action) => <OpenAIButton key={action} className="home-ai__quick-action" entryPoint="home_ai" prompt={action}>{action}</OpenAIButton>)}
          </div>
          <OpenAIButton entryPoint="home_ai">{text.openAI}</OpenAIButton>
        </div>
        <div className="home-ai__preview" aria-label="QULTURE AI conversation preview">
          <div className="home-ai__preview-head"><span>AI-КОНСУЛЬТАНТ QULTURE</span><span>ONLINE</span></div>
          <div className="home-ai__message"><small>QULTURE AI</small><p>{locale === "ru" ? "Сначала уточню город, сезон и способ передвижения. Подтверждённые данные покажу только из базы QULTURE." : "Алдымен қала, маусым және қозғалыс тәсілін нақтылаймын. Расталған деректерді тек QULTURE базасынан көрсетемін."}</p></div>
          <div className="home-ai__preview-input"><span>{locale === "ru" ? "Задайте вопрос консультанту…" : "Кеңесшіге сұрақ қойыңыз…"}</span><span aria-hidden="true">↑</span></div>
        </div>
      </section> : null}

      {visible("about") ? <section className="brand-origin">
        <p className="q-meta">06 / ASTANA</p>
        <h2 className="q-display q-display--medium">DESIGNED IN ASTANA.<br />BUILT FOR CHANGING CLIMATES.</h2>
        <p className="q-lead">{text.brandBody}</p>
      </section> : null}

      {visible("journal") ? <section className="journal-home">
        <div className="journal-home__feature">
          <div className="journal-home__media"><Image fill alt="QULTURE progress journal editorial" sizes="(max-width: 960px) 100vw, 42vw" src="/media/hero/hero-poster.png" /></div>
          <div className="journal-home__copy">
            <p className="q-meta">JOURNAL / PROGRESS</p>
            <h2 className="q-heading">BUILDING THE<br />CITY LAYER SYSTEM</h2>
            <p>{journalBody}</p>
            <Link className="q-button" href={route(locale, "/journal")}>{text.readJournal}<ArrowIcon /></Link>
          </div>
        </div>
        <div className="journal-home__rail">
          <p className="q-meta">{locale === "ru" ? "Последние обновления" : "Соңғы жаңартулар"}</p>
          {text.progress.map((item) => <Link key={item} href={route(locale, "/journal/building-qulture-openly")}><span>{item}</span><ArrowIcon /></Link>)}
        </div>
      </section> : null}

      {visible("waitlist") ? <section className="home-waitlist q-dark" id="waitlist">
        <div className="home-waitlist__intro">
          <p className="q-meta q-accent">07 / WAITLIST</p>
          <h2 className="q-heading">JOIN THE WAITLIST</h2>
          <p>{text.waitlistBody}</p>
        </div>
        <WaitlistForm captureEnabled={presentation.captureEnabled} locale={locale} policyVersion={presentation.policyVersion} source="home" />
      </section> : null}
    </>
  );
}
