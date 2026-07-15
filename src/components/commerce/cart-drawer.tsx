"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import { formatKzt, useCart } from "./cart-provider";

export function CartDrawer({ locale }: { locale: "ru" | "kz" }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const { lines, count, subtotal, discount, total, removeLine, updateLine } = useCart();
  const close = useCallback(() => setOpen(false), []);
  useDialogBehavior(open, drawerRef, close, triggerRef);
  const isRu = locale === "ru";

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("qulture:open-cart", onOpen);
    return () => window.removeEventListener("qulture:open-cart", onOpen);
  }, []);

  return (
    <>
      {open ? <button aria-label={isRu ? "Закрыть корзину" : "Себетті жабу"} className="overlay-backdrop" type="button" onClick={close} /> : null}
      <aside ref={drawerRef} aria-hidden={!open} aria-labelledby="cart-drawer-title" aria-modal="true" className="cart-drawer" data-open={open} inert={!open} role="dialog">
        <header className="cart-drawer__header">
          <h2 id="cart-drawer-title">{isRu ? "Корзина" : "Себет"} ({count})</h2>
          <button aria-label={isRu ? "Закрыть" : "Жабу"} type="button" onClick={close}><CloseIcon /></button>
        </header>
        <div className="cart-drawer__lines">
          {lines.length === 0 ? (
            <div className="cart-drawer__empty">
              <p>{isRu ? "Корзина пуста. Публичный pre-launch не показывает неподтверждённые товары." : "Себет бос. Ашық pre-launch расталмаған өнімдерді көрсетпейді."}</p>
              <Link className="q-button" href={`/${locale}/waitlist`} onClick={close}>{isRu ? "Лист ожидания" : "Күту тізімі"}<span aria-hidden="true">→</span></Link>
            </div>
          ) : lines.map((line) => (
            <article key={line.id} className="cart-line">
              <div className="cart-line__media">
                {line.mediaSrc || line.demo ? (
                  <Image fill alt={line.mediaAlt ?? ""} sizes="96px" src={line.mediaSrc ?? "/media/hero/hero-poster.png"} />
                ) : (
                  <span aria-hidden="true" className="cart-line__media-fallback">Q</span>
                )}
              </div>
              <div className="cart-line__body">
                <p className="q-meta">{line.demo ? "DEMO" : line.availability}</p>
                <h3>{line.name}</h3>
                <p>{line.role.toUpperCase()} · {line.color}</p>
                <label>{isRu ? "Размер" : "Өлшем"}
                  <select aria-label={isRu ? `Размер: ${line.name}` : `Өлшем: ${line.name}`} value={line.variantId} onChange={(event) => { const option = line.variantOptions?.find((candidate) => candidate.variantId === event.target.value); if (option) updateLine(line.id, option); }}>
                    {(line.variantOptions?.length ? line.variantOptions : [{ variantId: line.variantId, size: line.size, color: line.color, unitPrice: line.unitPrice, availability: line.availability, eta: line.eta }]).map((option) => <option key={option.variantId} value={option.variantId}>{option.size}{option.color !== line.color ? ` · ${option.color}` : ""}</option>)}
                  </select>
                </label>
                <strong>{formatKzt(line.unitPrice, locale)}</strong>
              </div>
              <button aria-label={isRu ? `Удалить ${line.name}` : `${line.name} жою`} className="cart-line__remove" type="button" onClick={() => removeLine(line.id)}><CloseIcon size={18} /></button>
            </article>
          ))}
        </div>
        {lines.length ? (
          <footer className="cart-drawer__summary">
            {lines.some((line) => line.demo) ? <p className="demo-note">DEMO COMMERCE — NOT FOR PUBLICATION</p> : null}
            <dl><div><dt>Subtotal</dt><dd>{formatKzt(subtotal, locale)}</dd></div>{discount ? <div><dt>Bundle saving</dt><dd>− {formatKzt(discount, locale)}</dd></div> : null}<div><dt>Total</dt><dd>{formatKzt(total, locale)}</dd></div></dl>
            <Link className="q-button q-button--solid" href={`/${locale}/cart`} onClick={close}>{isRu ? "Открыть корзину" : "Себетті ашу"}<span aria-hidden="true">→</span></Link>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
