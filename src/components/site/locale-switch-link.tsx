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

type LocaleSwitchLinkProps = {
  locale: "ru" | "kz";
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function switchPath(pathname: string, locale: "ru" | "kz"): string {
  const target = locale === "ru" ? "kz" : "ru";
  const localized = pathname.replace(/^\/(ru|kz)(?=\/|$)/, `/${target}`);
  return localized === pathname ? `/${target}` : localized;
}

function ResolvedLocaleSwitchLink({
  ariaLabel,
  children,
  className,
  hrefBase,
  onClick,
}: Omit<LocaleSwitchLinkProps, "locale"> & { hrefBase: string }) {
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
      aria-label={ariaLabel}
      className={className}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function LocaleSwitchLink(props: LocaleSwitchLinkProps) {
  const pathname = usePathname();
  const hrefBase = switchPath(pathname, props.locale);
  const fallback = (
    <Link
      aria-label={props.ariaLabel}
      className={props.className}
      href={hrefBase}
      onClick={props.onClick}
    >
      {props.children}
    </Link>
  );

  return (
    <Suspense fallback={fallback}>
      <ResolvedLocaleSwitchLink {...props} hrefBase={hrefBase} />
    </Suspense>
  );
}
