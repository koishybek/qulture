import Link from "next/link";
import { CookieSettingsButton } from "./cookie-settings-button";
import { LocaleSwitchLink } from "./locale-switch-link";

type SiteFooterProps = {
  locale: "ru" | "kz";
  wordmark?: string;
  legalLinks?: Record<string, string>;
};

const footerCopy = {
  ru: {
    line: "Городская одежда для ветра, слоёв и движения.",
    delivery: "Доставка и возврат",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookie settings",
    contacts: "Контакты",
    journal: "Журнал",
    emailPending: "Официальный email / ожидает подтверждения",
    socialPending: "Instagram / ожидает подтверждения",
  },
  kz: {
    line: "Желге, қабаттарға және қозғалысқа арналған қалалық киім.",
    delivery: "Жеткізу және қайтару",
    faq: "FAQ",
    privacy: "Құпиялық",
    terms: "Шарттар",
    cookies: "Cookie баптаулары",
    contacts: "Байланыс",
    journal: "Журнал",
    emailPending: "Ресми email / растауды күтуде",
    socialPending: "Instagram / растауды күтуде",
  },
} as const;

export function SiteFooter({ locale, wordmark = "QULTURE", legalLinks = {} }: SiteFooterProps) {
  const copy = footerCopy[locale];
  const path = (value: string) => `/${locale}${value}`;

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <Link className="q-wordmark" href={path("")}>{wordmark}</Link>
          <p>{copy.line}</p>
        </div>
        <nav aria-label="Policies" className="site-footer__column">
          <Link href={path("/delivery-and-returns")}>{copy.delivery}</Link>
          <Link href={path("/faq")}>{copy.faq}</Link>
          <Link href={legalLinks.privacy ?? path("/privacy")}>{copy.privacy}</Link>
          <Link href={legalLinks.terms ?? path("/terms")}>{copy.terms}</Link>
          <CookieSettingsButton>{copy.cookies}</CookieSettingsButton>
        </nav>
        <nav aria-label="QULTURE" className="site-footer__column">
          <Link href={path("/contacts")}>{copy.contacts}</Link>
          <Link href={path("/journal")}>{copy.journal}</Link>
          <span>{copy.emailPending}</span>
          <span>Astana, Kazakhstan</span>
        </nav>
        <div className="site-footer__column">
          <span>{copy.socialPending}</span>
          <LocaleSwitchLink locale={locale}>RU / KZ</LocaleSwitchLink>
          <span>© {new Date().getFullYear()} QULTURE</span>
        </div>
      </div>
    </footer>
  );
}
