import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { isLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";
import { canCapturePiiUnderPolicy, DEFAULT_CONSENT_POLICY_VERSION } from "@/lib/privacy/pii-policy";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryValue(value: string | string[] | undefined, maximum: number): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.trim();
  return normalized && normalized.length <= maximum ? normalized : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const origin = configuredSiteOrigin();
  const canonical = absoluteSiteUrl(origin, `/${locale}/waitlist`);
  return {
    title: locale === "ru" ? "Лист ожидания" : "Күту тізімі",
    description: locale === "ru" ? "Оставьте выбранный контакт, чтобы получить сервисное уведомление о готовности QULTURE." : "QULTURE дайын болғанда сервистік хабарлама алу үшін таңдаған байланыс дерегін қалдырыңыз.",
    ...(canonical
      ? {
          alternates: {
            canonical,
            languages: {
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
  const isRu = locale === "ru";
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
        <h1 className="q-display q-display--medium">JOIN THE<br />WAITLIST</h1>
        <p className="q-lead">{isRu ? "Сообщим о готовности системы — без выдуманной даты запуска и без автоматической подписки на маркетинг." : "Жүйе дайын болғанда хабарлаймыз — ойдан шығарылған іске қосылу күнінсіз және маркетингке автоматты жазылусыз."}</p>
      </div>
      <div className="q-page-body waitlist-page__body">
        <div>
          <p className="q-meta">01 / YOUR CHOICE</p>
          <h2>{isRu ? "Вы контролируете способ связи" : "Байланыс тәсілін өзіңіз басқарасыз"}</h2>
          <p>{isRu ? "Сервисное согласие относится только к выбранному запросу. Новости QULTURE включаются отдельным необязательным выбором." : "Сервистік келісім тек таңдаған сұрауыңызға қатысты. QULTURE жаңалықтары бөлек, міндетті емес таңдау арқылы қосылады."}</p>
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
