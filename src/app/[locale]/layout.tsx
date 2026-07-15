import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AIPanel } from "@/components/ai/ai-panel";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { CartProvider } from "@/components/commerce/cart-provider";
import { ConsentManager } from "@/components/privacy/consent-manager";
import { AnalyticsBridge } from "@/components/privacy/analytics-bridge";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { LocaleDocument } from "@/components/site/locale-document";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { getSiteSettings, internalAsset, jsonObject, siteCssVariables, stringArray, stringSetting } from "@/lib/site-settings";
import { canCapturePiiUnderPolicy, DEFAULT_CONSENT_POLICY_VERSION } from "@/lib/privacy/pii-policy";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const localeMetadata: Record<Locale, {
  title: string;
  description: string;
  openGraphLocale: string;
  documentLanguage: string;
}> = {
  en: {
    title: "Designed for changing climates",
    description: "Urban apparel designed for wind, layers, and movement.",
    openGraphLocale: "en_US",
    documentLanguage: "en",
  },
  ru: {
    title: "Для меняющегося климата",
    description: "Городская одежда для ветра, слоёв и движения.",
    openGraphLocale: "ru_KZ",
    documentLanguage: "ru",
  },
  kz: {
    title: "Құбылмалы климатқа арналған",
    description: "Желге, қабаттарға және қозғалысқа арналған қалалық киім.",
    openGraphLocale: "kk_KZ",
    documentLanguage: "kk",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};

  const locale = rawLocale;
  const seo = localeMetadata[locale];
  const settings = await getSiteSettings();
  const brandAssets = jsonObject(settings?.brandAssets);
  const socialPreview = internalAsset(brandAssets.socialPreview, "/media/hero/hero-poster.png");
  const favicon = internalAsset(brandAssets.favicon, "/icon.svg");
  const siteOrigin = configuredSiteOrigin();
  const canonical = absoluteSiteUrl(siteOrigin, `/${locale}`);
  const englishCanonical = absoluteSiteUrl(siteOrigin, "/en");
  const russianCanonical = absoluteSiteUrl(siteOrigin, "/ru");
  const kazakhCanonical = absoluteSiteUrl(siteOrigin, "/kz");
  const socialImage = absoluteSiteUrl(siteOrigin, socialPreview);
  const alternateOpenGraphLocales = locales
    .filter((candidate) => candidate !== locale)
    .map((candidate) => localeMetadata[candidate].openGraphLocale);

  return {
    title: seo.title,
    description: seo.description,
    ...(canonical && englishCanonical && russianCanonical && kazakhCanonical
      ? {
          alternates: {
            canonical,
            languages: {
              en: englishCanonical,
              ru: russianCanonical,
              kk: kazakhCanonical,
              "x-default": englishCanonical,
            },
          },
        }
      : {}),
    icons: { icon: favicon },
    openGraph: {
      type: "website",
      siteName: "QULTURE",
      title: `QULTURE — ${seo.title}`,
      description: seo.description,
      locale: seo.openGraphLocale,
      alternateLocale: alternateOpenGraphLocales,
      ...(socialImage ? { images: [{ url: socialImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `QULTURE — ${seo.title}`,
      description: seo.description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const settings = await getSiteSettings();
  const policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
  const brandAssets = jsonObject(settings?.brandAssets);
  const wordmark = stringSetting(brandAssets.wordmark, "QULTURE");
  const quickActions = stringArray(jsonObject(settings?.aiQuickActions)[locale]);
  const legalLinks = Object.fromEntries(
    Object.entries(jsonObject(settings?.legalLinks)).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  const siteStyle = siteCssVariables(settings?.paletteTokens, settings?.typographySettings) as React.CSSProperties;

  const labels = {
    shop: dictionary.nav.shop,
    technology: dictionary.nav.technology,
    journal: dictionary.nav.journal,
    about: dictionary.nav.about,
    ai: dictionary.nav.aiAssist,
    search: dictionary.nav.search,
    account: dictionary.nav.account,
    bag: dictionary.nav.bag,
    menu: dictionary.common.openMenu,
    close: dictionary.common.close,
  };

  const organizationUrl = absoluteSiteUrl(configuredSiteOrigin(), `/${locale}`);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QULTURE",
    ...(organizationUrl ? { url: organizationUrl } : {}),
    inLanguage: localeMetadata[locale].documentLanguage,
    foundingLocation: { "@type": "Place", name: "Astana, Kazakhstan" },
  };

  return (
    <div className="site-shell" style={siteStyle}>
      <LocaleDocument locale={locale} />
      <CartProvider>
        <a className="skip-link" href="#main-content">{dictionary.common.skipToContent}</a>
        <SiteHeader labels={labels} locale={locale} wordmark={wordmark} />
        <main id="main-content">{children}</main>
        <SiteFooter legalLinks={legalLinks} locale={locale} wordmark={wordmark} />
        <AIPanel
          locale={locale}
          quickActions={quickActions}
          teaserDelay={settings?.aiTeaserDelayMs ?? 6500}
          teaserEnabled={settings?.aiTeaserEnabled !== false}
          teaserFrequency={settings?.aiTeaserFrequency}
          policyVersion={policyVersion}
          captureEnabled={canCapturePiiUnderPolicy({ policyVersion })}
        />
        <CartDrawer locale={locale} />
        <AnalyticsBridge locale={locale} />
        <ConsentManager locale={locale} policyVersion={policyVersion} />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
          type="application/ld+json"
        />
      </CartProvider>
    </div>
  );
}
