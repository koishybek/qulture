import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { isLocale, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";
import { canCapturePiiUnderPolicy, DEFAULT_CONSENT_POLICY_VERSION } from "@/lib/privacy/pii-policy";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type WaitlistCopy = {
  metadataTitle: string;
  metadataDescription: string;
  titleLines: readonly [string, string];
  lead: string;
  choiceEyebrow: string;
  choiceTitle: string;
  choiceBody: string;
};

const waitlistCopy: Record<Locale, WaitlistCopy> = {
  en: {
    metadataTitle: "Waitlist",
    metadataDescription:
      "Leave your preferred contact to receive a service notification when QULTURE is ready.",
    titleLines: ["JOIN THE", "WAITLIST"],
    lead:
      "We will let you know when the system is ready — without an invented launch date or an automatic marketing subscription.",
    choiceEyebrow: "01 / YOUR CHOICE",
    choiceTitle: "You control how we contact you",
    choiceBody:
      "Service consent applies only to the request you choose. QULTURE news are an optional, separate choice.",
  },
  ru: {
    metadataTitle: "Лист ожидания",
    metadataDescription:
      "Оставьте выбранный контакт, чтобы получить сервисное уведомление о готовности QULTURE.",
    titleLines: ["ЛИСТ", "ОЖИДАНИЯ"],
    lead:
      "Сообщим о готовности системы — без выдуманной даты запуска и без автоматической подписки на маркетинг.",
    choiceEyebrow: "01 / ВАШ ВЫБОР",
    choiceTitle: "Вы контролируете способ связи",
    choiceBody:
      "Сервисное согласие относится только к выбранному запросу. Новости QULTURE включаются отдельным необязательным выбором.",
  },
  kz: {
    metadataTitle: "Күту тізімі",
    metadataDescription:
      "QULTURE дайын болғанда сервистік хабарлама алу үшін таңдаған байланыс дерегін қалдырыңыз.",
    titleLines: ["КҮТУ", "ТІЗІМІ"],
    lead:
      "Жүйе дайын болғанда хабарлаймыз — ойдан шығарылған іске қосылу күнінсіз және маркетингке автоматты жазылусыз.",
    choiceEyebrow: "01 / СІЗДІҢ ТАҢДАУЫҢЫЗ",
    choiceTitle: "Байланыс тәсілін өзіңіз басқарасыз",
    choiceBody:
      "Сервистік келісім тек таңдаған сұрауыңызға қатысты. QULTURE жаңалықтары бөлек, міндетті емес таңдау арқылы қосылады.",
  },
};

function queryValue(value: string | string[] | undefined, maximum: number): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.trim();
  return normalized && normalized.length <= maximum ? normalized : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = waitlistCopy[locale];
  const origin = configuredSiteOrigin();
  const canonical = absoluteSiteUrl(origin, `/${locale}/waitlist`);
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    ...(canonical
      ? {
          alternates: {
            canonical,
            languages: {
              en: absoluteSiteUrl(origin, "/en/waitlist")!,
              ru: absoluteSiteUrl(origin, "/ru/waitlist")!,
              kk: absoluteSiteUrl(origin, "/kz/waitlist")!,
            },
          },
        }
      : {}),
  };
}

export default async function WaitlistPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = waitlistCopy[locale];
  const settings = await getSiteSettings();
  const policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
  const query = await searchParams;
  const intent = queryValue(query.intent, 20) === "restock" ? "restock" : "launch";
  const context = {
    intent,
    productId: queryValue(query.product ?? query.productId, 80),
    variantId: queryValue(query.variant ?? query.variantId, 80),
    color: queryValue(query.color, 80),
    size: queryValue(query.size, 40),
  } as const;
  return (
    <section className="q-page waitlist-page">
      <div className="q-page-header">
        <p className="q-meta">QULTURE / PRE-LAUNCH</p>
        <h1 className="q-display q-display--medium">
          {copy.titleLines[0]}
          <br />
          {copy.titleLines[1]}
        </h1>
        <p className="q-lead">{copy.lead}</p>
      </div>
      <div className="q-page-body waitlist-page__body">
        <div>
          <p className="q-meta">{copy.choiceEyebrow}</p>
          <h2>{copy.choiceTitle}</h2>
          <p>{copy.choiceBody}</p>
        </div>
        <WaitlistForm
          locale={locale}
          context={context}
          captureEnabled={canCapturePiiUnderPolicy({ policyVersion })}
          policyVersion={policyVersion}
          source="waitlist-page"
        />
      </div>
    </section>
  );
}
