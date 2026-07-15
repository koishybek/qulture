"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type MouseEventHandler,
  type ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { locales, replaceLocaleInPath, type Locale } from "@/lib/i18n";

type LocaleSwitchLinkProps = {
  locale: Locale;
  targetLocale: Locale;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type LocaleSwitcherProps = {
  locale: Locale;
  className?: string;
  ariaLabel: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const languageNames: Record<Locale | "en", string> = {
  en: "English",
  ru: "Русский",
  kz: "Қазақша",
};

const languageNamesByLocale: Record<Locale, Record<Locale, string>> = {
  en: {
    en: "English",
    ru: "Russian",
    kz: "Kazakh",
  },
  ru: {
    en: "Английский",
    ru: "Русский",
    kz: "Казахский",
  },
  kz: {
    en: "Ағылшын тілі",
    ru: "Орыс тілі",
    kz: "Қазақша",
  },
};

function ResolvedLocaleSwitchLink({
  ariaLabel,
  children,
  className,
  currentLocale,
  hrefBase,
  onClick,
  targetLocale,
}: Omit<LocaleSwitchLinkProps, "locale"> & {
  currentLocale: Locale;
  hrefBase: string;
}) {
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");
  const query = searchParams.toString();

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [hrefBase, query]);

  const href = `${hrefBase}${query ? `?${query}` : ""}${hash}`;
  return (
    <Link
      aria-current={currentLocale === targetLocale ? "page" : undefined}
      aria-label={ariaLabel}
      className={className}
      href={href}
      onClick={onClick}
    >
      {children ?? targetLocale.toUpperCase()}
    </Link>
  );
}

/**
 * A single locale link that retains the current page, search string, and hash.
 */
export function LocaleSwitchLink({ locale, targetLocale, ...props }: LocaleSwitchLinkProps) {
  const pathname = usePathname();
  const hrefBase = replaceLocaleInPath(pathname, targetLocale);
  const fallback = (
    <Link
      aria-current={locale === targetLocale ? "page" : undefined}
      aria-label={props.ariaLabel}
      className={props.className}
      href={hrefBase}
      onClick={props.onClick}
    >
      {props.children ?? targetLocale.toUpperCase()}
    </Link>
  );

  return (
    <Suspense fallback={fallback}>
      <ResolvedLocaleSwitchLink
        {...props}
        currentLocale={locale}
        hrefBase={hrefBase}
        targetLocale={targetLocale}
      />
    </Suspense>
  );
}

/**
 * Compact EN / RU / KZ selector used in the site chrome.
 */
export function LocaleSwitcher({ ariaLabel, className, locale, onClick }: LocaleSwitcherProps) {
  return (
    <div aria-label={ariaLabel} className={className} role="group">
      {locales.map((targetLocale, index) => (
        <LocaleSwitchLink
          key={targetLocale}
          ariaLabel={languageNamesByLocale[locale][targetLocale] ?? languageNames[targetLocale]}
          locale={locale}
          onClick={onClick}
          targetLocale={targetLocale}
        >
          {targetLocale.toUpperCase()}{index < locales.length - 1 ? <span aria-hidden="true">/</span> : null}
        </LocaleSwitchLink>
      ))}
    </div>
  );
}
