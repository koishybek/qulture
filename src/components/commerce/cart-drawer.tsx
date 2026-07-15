"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/ui/icons";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import { commerceText, type CommerceLocale } from "@/lib/commerce/locale";

import { displayCartLineColor, displayCartLineName, displayCartMediaAlt, formatKzt, useCart } from "./cart-provider";

export function CartDrawer({ locale }: { locale: CommerceLocale }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const { lines, count, subtotal, discount, total, removeLine, updateLine } = useCart();
  const close = useCallback(() => setOpen(false), []);
  useDialogBehavior(open, drawerRef, close, triggerRef);
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);

  useEffect(() => { const onOpen = () => setOpen(true); window.addEventListener("qulture:open-cart", onOpen); return () => window.removeEventListener("qulture:open-cart", onOpen); }, []);

  return <>
    {open ? <button aria-label={t("Close bag", "Закрыть корзину", "Себетті жабу")} className="overlay-backdrop" type="button" onClick={close} /> : null}
    <aside ref={drawerRef} aria-hidden={!open} aria-labelledby="cart-drawer-title" aria-modal="true" className="cart-drawer" data-open={open} inert={!open} role="dialog">
      <header className="cart-drawer__header"><h2 id="cart-drawer-title">{t("Bag", "Корзина", "Себет")} ({count})</h2><button aria-label={t("Close", "Закрыть", "Жабу")} type="button" onClick={close}><CloseIcon /></button></header>
      <div className="cart-drawer__lines">{lines.length === 0 ? <div className="cart-drawer__empty"><p>{t("Your bag is empty. Public pre-launch does not show unverified products.", "Корзина пуста. Публичный pre-launch не показывает неподтверждённые товары.", "Себет бос. Ашық pre-launch расталмаған өнімдерді көрсетпейді.")}</p><Link className="q-button" href={`/${locale}/waitlist`} onClick={close}>{t("Join the waitlist", "Лист ожидания", "Күту тізімі")}<span aria-hidden="true">→</span></Link></div> : lines.map((line) => {
        const name = displayCartLineName(line, locale); const color = displayCartLineColor(line, locale); const options = line.variantOptions?.length ? line.variantOptions : [{ variantId: line.variantId, size: line.size, color: line.color, colorByLocale: line.colorByLocale, unitPrice: line.unitPrice, availability: line.availability, eta: line.eta }];
        return <article key={line.id} className="cart-line"><div className="cart-line__media">{line.mediaSrc || line.demo ? <Image fill alt={displayCartMediaAlt(line, locale)} sizes="96px" src={line.mediaSrc ?? "/media/hero/hero-poster.png"} /> : <span aria-hidden="true" className="cart-line__media-fallback">Q</span>}</div><div className="cart-line__body"><p className="q-meta">{line.demo ? "DEMO" : line.availability}</p><h3>{name}</h3><p>{line.role.toUpperCase()} · {color}</p><label>{t("Size", "Размер", "Өлшем")}<select aria-label={`${t("Size", "Размер", "Өлшем")}: ${name}`} value={line.variantId} onChange={(event) => { const option = options.find((candidate) => candidate.variantId === event.target.value); if (option) updateLine(line.id, option); }}>{options.map((option) => <option key={option.variantId} value={option.variantId}>{option.size}{displayCartLineColor({ ...line, color: option.color, colorByLocale: option.colorByLocale }, locale) !== color ? ` · ${displayCartLineColor({ ...line, color: option.color, colorByLocale: option.colorByLocale }, locale)}` : ""}</option>)}</select></label><strong>{formatKzt(line.unitPrice, locale)}</strong></div><button aria-label={`${t("Remove", "Удалить", "Жою")} ${name}`} className="cart-line__remove" type="button" onClick={() => removeLine(line.id)}><CloseIcon size={18} /></button></article>;
      })}</div>
      {lines.length ? <footer className="cart-drawer__summary">{lines.some((line) => line.demo) ? <p className="demo-note">DEMO COMMERCE — NOT FOR PUBLICATION</p> : null}<dl><div><dt>Subtotal</dt><dd>{formatKzt(subtotal, locale)}</dd></div>{discount ? <div><dt>{t("Set saving", "Выгода комплекта", "Жинақ жеңілдігі")}</dt><dd>− {formatKzt(discount, locale)}</dd></div> : null}<div><dt>Total</dt><dd>{formatKzt(total, locale)}</dd></div></dl><Link className="q-button q-button--solid" href={`/${locale}/cart`} onClick={close}>{t("Open bag", "Открыть корзину", "Себетті ашу")}<span aria-hidden="true">→</span></Link></footer> : null}
    </aside>
  </>;
}
