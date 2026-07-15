import Link from "next/link";
import { localizePath, type Locale } from "@/lib/i18n";
import { CookieSettingsButton } from "./cookie-settings-button";
import { LocaleSwitcher } from "./locale-switch-link";

type SiteFooterProps = {
  locale: Locale;
  wordmark?: string;
  legalLinks?: Record<string, string>;
};

type FooterCopy = {
  line: string;
  delivery: string;
  faq: string;
  privacy: string;
  terms: string;
  cookies: string;
  contacts: string;
  journal: string;
  emailPending: string;
  socialPending: string;
  location: string;
  policyNavigation: string;
  brandNavigation: string;
  language: string;
};

const footerCopy: Record<Locale | "en", FooterCopy> = {
  en: {
    line: "Urban apparel for wind, layers, and movement.",
    delivery: "Delivery & returns",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookie settings",
    contacts: "Contact",
    journal: "Journal",
    emailPending: "Official email — pending confirmation",
    socialPending: "Instagram — pending confirmation",
    location: "Astana, Kazakhstan",
    policyNavigation: "Policies",
    brandNavigation: "QULTURE",
    language: "Select language",
  },
  ru: {
    line: "Городская одежда для ветра, слоёв и движения.",
    delivery: "Доставка и возврат",
    faq: "Частые вопросы",
    privacy: "Конфиденциальность",
    terms: "Условия",
    cookies: "Настройки файлов cookie",
    contacts: "Контакты",
    journal: "Журнал",
    emailPending: "Официальный адрес электронной почты — ожидает подтверждения",
    socialPending: "Instagram — ожидает подтверждения",
    location: "Астана, Казахстан",
    policyNavigation: "Документы",
    brandNavigation: "QULTURE",
    language: "Выбрать язык",
  },
  kz: {
    line: "Желге, қабаттарға және қозғалысқа арналған қалалық киім.",
    delivery: "Жеткізу және қайтару",
    faq: "Жиі қойылатын сұрақтар",
    privacy: "Құпиялық",
    terms: "Шарттар",
    cookies: "Cookie файлдарының баптаулары",
    contacts: "Байланыс",
    journal: "Журнал",
    emailPending: "Ресми электрондық пошта — растауды күтуде",
    socialPending: "Instagram — растауды күтуде",
    location: "Астана, Қазақстан",
    policyNavigation: "Құжаттар",
    brandNavigation: "QULTURE",
    language: "Тілді таңдау",
  },
};

export function SiteFooter({ locale, wordmark = "QULTURE", legalLinks = {} }: SiteFooterProps) {
  const copy = footerCopy[locale];
  const path = (value: string) => localizePath(locale, value);

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <Link aria-label={`${wordmark} — ${copy.brandNavigation}`} className="q-wordmark" href={path("/")}>{wordmark}</Link>
          <p>{copy.line}</p>
        </div>
        <nav aria-label={copy.policyNavigation} className="site-footer__column">
          <Link href={path("/delivery-and-returns")}>{copy.delivery}</Link>
          <Link href={path("/faq")}>{copy.faq}</Link>
          <Link href={legalLinks.privacy ?? path("/privacy")}>{copy.privacy}</Link>
          <Link href={legalLinks.terms ?? path("/terms")}>{copy.terms}</Link>
          <CookieSettingsButton>{copy.cookies}</CookieSettingsButton>
        </nav>
        <nav aria-label={copy.brandNavigation} className="site-footer__column">
          <Link href={path("/contacts")}>{copy.contacts}</Link>
          <Link href={path("/journal")}>{copy.journal}</Link>
          <span>{copy.emailPending}</span>
          <span>{copy.location}</span>
        </nav>
        <div className="site-footer__column">
          <span>{copy.socialPending}</span>
          <LocaleSwitcher ariaLabel={copy.language} locale={locale} />
          <span>© {new Date().getFullYear()} QULTURE</span>
        </div>
      </div>
    </footer>
  );
}
