"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { useCart } from "@/components/commerce/cart-provider";
import { LocaleSwitcher } from "@/components/site/locale-switch-link";
import { localizePath, type Locale } from "@/lib/i18n";

export type SiteHeaderLabels = {
  shop: string;
  technology: string;
  journal: string;
  about: string;
  ai: string;
  search: string;
  account: string;
  bag: string;
  menu: string;
  close: string;
};

type SiteHeaderProps = {
  locale: Locale;
  labels: SiteHeaderLabels;
  wordmark?: string;
};

type HeaderAccessibilityCopy = {
  primaryNavigation: string;
  navigationMenu: string;
  language: string;
  home: string;
};

const accessibilityCopy: Record<Locale | "en", HeaderAccessibilityCopy> = {
  en: {
    primaryNavigation: "Primary navigation",
    navigationMenu: "Navigation menu",
    language: "Select language",
    home: "Home",
  },
  ru: {
    primaryNavigation: "Основная навигация",
    navigationMenu: "Меню навигации",
    language: "Выбрать язык",
    home: "Главная",
  },
  kz: {
    primaryNavigation: "Негізгі навигация",
    navigationMenu: "Навигация мәзірі",
    language: "Тілді таңдау",
    home: "Басты бет",
  },
};

function localized(locale: Locale, path: string) {
  return localizePath(locale, path);
}

export function SiteHeader({ locale, labels, wordmark = "QULTURE" }: SiteHeaderProps) {
  const cart = useCart();
  const bagCount = cart.count;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const a11y = accessibilityCopy[locale];
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isTransparent = isHome && !scrolled && !menuOpen;

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDialogBehavior(menuOpen, menuRef, closeMenu, menuButtonRef);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const openAI = () => window.dispatchEvent(new CustomEvent("qulture:open-ai", { detail: { entryPoint: "header" } }));
  const openCart = () => window.dispatchEvent(new CustomEvent("qulture:open-cart"));

  return (
    <>
      <header className="site-header" data-transparent={isTransparent}>
        <nav aria-label={a11y.primaryNavigation} className="site-header__inner">
          <div className="site-header__left">
            <Link href={localized(locale, "/shop")} onClick={closeMenu}>{labels.shop}</Link>
            <Link href={localized(locale, "/technology")} onClick={closeMenu}>{labels.technology}</Link>
            <Link href={localized(locale, "/journal")} onClick={closeMenu}>{labels.journal}</Link>
            <Link href={localized(locale, "/about")} onClick={closeMenu}>{labels.about}</Link>
          </div>

          <Link
            aria-label={`${wordmark} — ${a11y.home}`}
            className="q-wordmark site-header__wordmark"
            href={localized(locale, "/")}
            onClick={closeMenu}
          >
            {wordmark}
          </Link>

          <div className="site-header__right">
            <button aria-label={labels.ai} className="site-header__ai" type="button" onClick={openAI}>
              {labels.ai}
            </button>
            <LocaleSwitcher
              ariaLabel={a11y.language}
              className="site-header__locale"
              locale={locale}
              onClick={closeMenu}
            />
            <Link aria-label={labels.search} className="site-header__icon-link" href={localized(locale, "/shop?search=1")}>
              <SearchIcon /> <span>{labels.search}</span>
            </Link>
            <Link aria-label={labels.account} className="site-header__text-link" href={localized(locale, "/account")}>{labels.account}</Link>
            <button aria-label={`${labels.bag}: ${bagCount}`} className="site-header__icon-link" type="button" onClick={openCart}>
              <BagIcon /> <span>{labels.bag} ({bagCount})</span>
            </button>
          </div>

          <button
            ref={menuButtonRef}
            aria-controls="site-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? labels.close : labels.menu}
            className="site-header__mobile-button"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <button aria-label={`${labels.bag}: ${bagCount}`} className="site-header__mobile-bag" type="button" onClick={openCart}>
            <BagIcon /> <span>{bagCount}</span>
          </button>
        </nav>
      </header>

      {menuOpen ? (
        <div
          ref={menuRef}
          aria-label={a11y.navigationMenu}
          aria-modal="true"
          className="mobile-menu"
          id="site-mobile-menu"
          role="dialog"
        >
          <nav aria-label={a11y.primaryNavigation} className="mobile-menu__links">
            <Link href={localized(locale, "/shop")} onClick={closeMenu}>{labels.shop}</Link>
            <Link href={localized(locale, "/technology")} onClick={closeMenu}>{labels.technology}</Link>
            <Link href={localized(locale, "/journal")} onClick={closeMenu}>{labels.journal}</Link>
            <Link href={localized(locale, "/about")} onClick={closeMenu}>{labels.about}</Link>
          </nav>
          <div className="mobile-menu__utility">
            <button aria-label={labels.ai} type="button" onClick={() => { closeMenu(); openAI(); }}>{labels.ai}</button>
            <Link aria-label={labels.account} href={localized(locale, "/account")} onClick={closeMenu}>{labels.account}</Link>
            <LocaleSwitcher ariaLabel={a11y.language} className="site-header__locale" locale={locale} onClick={closeMenu} />
          </div>
        </div>
      ) : null}
    </>
  );
}
