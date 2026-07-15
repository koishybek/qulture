import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/home/home-page";
import { isLocale } from "@/lib/i18n";
import { getSiteSettings, internalAsset, jsonObject, localizedSettings } from "@/lib/site-settings";
import { canCapturePiiUnderPolicy, DEFAULT_CONSENT_POLICY_VERSION } from "@/lib/privacy/pii-policy";

type HomeProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "ru" ? "Для меняющегося климата" : "Құбылмалы климатқа арналған",
    description: locale === "ru"
      ? "QULTURE — городская одежда для ветра, слоёв и движения."
      : "QULTURE — желге, қабаттарға және қозғалысқа арналған қалалық киім.",
  };
}

export default async function Page({ params }: HomeProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const settings = await getSiteSettings();
  const policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
  const brandAssets = jsonObject(settings?.brandAssets);
  return (
    <HomePage
      locale={locale}
      presentation={{
        content: localizedSettings(settings?.homeContent, locale),
        visibility: jsonObject(settings?.sectionVisibility),
        heroPoster: internalAsset(brandAssets.heroPoster, "/media/hero/hero-poster.png"),
        heroVideo: internalAsset(brandAssets.heroVideo, "/media/hero/hero-video.mp4"),
        policyVersion,
        captureEnabled: canCapturePiiUnderPolicy({ policyVersion }),
      }}
    />
  );
}
