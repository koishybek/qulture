"use client";

import Image from "next/image";
import Link from "next/link";

import { CloseIcon } from "@/components/ui/icons";
import { commerceText, type CommerceLocale } from "@/lib/commerce/locale";

import { displayCartLineColor, displayCartLineName, displayCartMediaAlt, formatKzt, useCart } from "./cart-provider";

export function CartPage({ locale }: { locale: CommerceLocale }) {
  const { lines, subtotal, discount, total, removeLine, updateLine } = useCart();
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);

  if (lines.length === 0) {
    return (
      <section className="q-page commerce-empty">
        <div className="q-page-header"><h1 className="q-display q-display--medium">{t("Bag", "Корзина", "Себет")}</h1><p className="q-lead">{t("Your bag is empty. Leave your interest and we will share confirmed information only.", "Корзина пуста. Оставьте интерес — мы сообщим только подтверждённую информацию.", "Себет бос. Қызығушылық қалдырыңыз — біз тек расталған ақпаратты хабарлаймыз.")}</p></div>
        <div className="q-page-body"><Link className="q-button" href={`/${locale}/waitlist`}>{t("Join the waitlist", "Лист ожидания", "Күту тізімі")}<span aria-hidden="true">→</span></Link></div>
      </section>
    );
  }

  return (
    <section className="q-page cart-page">
      {lines.some((line) => line.demo) ? <div className="demo-rail">DEMO COMMERCE — NOT FOR PUBLICATION</div> : null}
      <div className="cart-page__header"><h1 className="q-display q-display--medium">{t("Bag", "Корзина", "Себет")}</h1><span>{lines.length} {t("items", "компонента", "бөлік")}</span></div>
      <div className="cart-page__layout">
        <div className="cart-page__lines">
          {lines.map((line) => {
            const name = displayCartLineName(line, locale);
            const color = displayCartLineColor(line, locale);
            const options = line.variantOptions?.length ? line.variantOptions : [{ variantId: line.variantId, size: line.size, color: line.color, colorByLocale: line.colorByLocale, unitPrice: line.unitPrice, availability: line.availability, eta: line.eta }];
            return <article key={line.id} className="cart-page-line">
              <div className="cart-page-line__media">{line.mediaSrc || line.demo ? <Image fill alt={displayCartMediaAlt(line, locale)} sizes="180px" src={line.mediaSrc ?? "/media/hero/hero-poster.png"} /> : <span aria-hidden="true" className="cart-line__media-fallback">Q</span>}</div>
              <div className="cart-page-line__content">
                <p className="q-meta q-accent">{line.demo ? "DEMO" : line.availability}</p><h2>{name}</h2><p>{line.role.toUpperCase()} · {color}</p>
                {line.bundleGroupId ? <p>{t("Part of a set", "Связан с комплектом", "Жиынтықпен байланысты")}</p> : null}
                <div className="cart-page-line__controls">
                  <label>{t("Size", "Размер", "Өлшем")}<select aria-label={`${t("Size", "Размер", "Өлшем")}: ${name}`} value={line.variantId} onChange={(event) => { const option = options.find((candidate) => candidate.variantId === event.target.value); if (option) updateLine(line.id, option); }}>{options.map((option) => <option key={option.variantId} value={option.variantId}>{option.size}{displayCartLineColor({ ...line, color: option.color, colorByLocale: option.colorByLocale }, locale) !== color ? ` · ${displayCartLineColor({ ...line, color: option.color, colorByLocale: option.colorByLocale }, locale)}` : ""}</option>)}</select></label>
                  <label>{t("Quantity", "Количество", "Саны")}<input aria-label={`${t("Quantity", "Количество", "Саны")}: ${name}`} min={1} type="number" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })} /></label>
                </div>
              </div>
              <strong className="cart-page-line__price">{formatKzt(line.unitPrice * line.quantity, locale)}</strong>
              <button aria-label={`${t("Remove", "Удалить", "Жою")} ${name}`} className="cart-page-line__remove" type="button" onClick={() => removeLine(line.id)}><CloseIcon /></button>
            </article>;
          })}
        </div>
        <aside className="cart-page__summary"><h2>{t("Summary", "Итого", "Қорытынды")}</h2><dl><div><dt>Subtotal</dt><dd>{formatKzt(subtotal, locale)}</dd></div>{discount ? <div className="q-accent"><dt>{t("Set saving", "Выгода комплекта", "Жинақ жеңілдігі")}</dt><dd>− {formatKzt(discount, locale)}</dd></div> : null}<div><dt>{t("Delivery", "Доставка", "Жеткізу")}</dt><dd>{t("At checkout", "На checkout", "Checkout кезінде")}</dd></div><div><dt>Total</dt><dd>{formatKzt(total, locale)}</dd></div></dl><Link className="q-button q-button--solid" data-testid="checkout-link" href={`/${locale}/checkout`}>{t("Go to checkout", "Перейти к checkout", "Checkout-қа өту")}<span aria-hidden="true">→</span></Link><p>{t("Final delivery is shown before test confirmation. No real charge is made.", "Итоговая доставка показывается до тестового подтверждения. Реальное списание не выполняется.", "Жеткізудің қорытындысы тест растауына дейін көрсетіледі. Нақты төлем алынбайды.")}</p></aside>
      </div>
    </section>
  );
}
