"use client";

import Image from "next/image";
import Link from "next/link";
import { CloseIcon } from "@/components/ui/icons";
import { formatKzt, useCart } from "./cart-provider";

export function CartPage({ locale }: { locale: "ru" | "kz" }) {
  const { lines, subtotal, discount, total, removeLine, updateLine } = useCart();
  const isRu = locale === "ru";

  if (lines.length === 0) {
    return (
      <section className="q-page commerce-empty">
        <div className="q-page-header">
          <h1 className="q-display q-display--medium">{isRu ? "Корзина" : "Себет"}</h1>
          <p className="q-lead">{isRu ? "Корзина пуста. Оставьте интерес — мы сообщим только подтверждённую информацию." : "Себет бос. Қызығушылық қалдырыңыз — біз тек расталған ақпаратты хабарлаймыз."}</p>
        </div>
        <div className="q-page-body"><Link className="q-button" href={`/${locale}/waitlist`}>{isRu ? "Лист ожидания" : "Күту тізімі"}<span aria-hidden="true">→</span></Link></div>
      </section>
    );
  }

  return (
    <section className="q-page cart-page">
      {lines.some((line) => line.demo) ? <div className="demo-rail">DEMO COMMERCE — NOT FOR PUBLICATION</div> : null}
      <div className="cart-page__header">
        <h1 className="q-display q-display--medium">{isRu ? "Корзина" : "Себет"}</h1>
        <span>{lines.length} {isRu ? "компонента" : "бөлік"}</span>
      </div>
      <div className="cart-page__layout">
        <div className="cart-page__lines">
          {lines.map((line) => (
            <article key={line.id} className="cart-page-line">
              <div className="cart-page-line__media">
                {line.mediaSrc || line.demo ? (
                  <Image fill alt={line.mediaAlt ?? ""} sizes="180px" src={line.mediaSrc ?? "/media/hero/hero-poster.png"} />
                ) : (
                  <span aria-hidden="true" className="cart-line__media-fallback">Q</span>
                )}
              </div>
              <div className="cart-page-line__content">
                <p className="q-meta q-accent">{line.demo ? "DEMO" : line.availability}</p>
                <h2>{line.name}</h2>
                <p>{line.role.toUpperCase()} · {line.color}</p>
                {line.bundleGroupId ? <p>{isRu ? "Связан с комплектом" : "Жиынтықпен байланысты"}</p> : null}
                <div className="cart-page-line__controls">
                  <label>{isRu ? "Размер" : "Өлшем"}<select aria-label={isRu ? `Размер: ${line.name}` : `Өлшем: ${line.name}`} value={line.variantId} onChange={(event) => { const option = line.variantOptions?.find((candidate) => candidate.variantId === event.target.value); if (option) updateLine(line.id, option); }}>{(line.variantOptions?.length ? line.variantOptions : [{ variantId: line.variantId, size: line.size, color: line.color, unitPrice: line.unitPrice, availability: line.availability, eta: line.eta }]).map((option) => <option key={option.variantId} value={option.variantId}>{option.size}{option.color !== line.color ? ` · ${option.color}` : ""}</option>)}</select></label>
                  <label>{isRu ? "Количество" : "Саны"}<input aria-label={isRu ? `Количество: ${line.name}` : `Саны: ${line.name}`} min={1} type="number" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })} /></label>
                </div>
              </div>
              <strong className="cart-page-line__price">{formatKzt(line.unitPrice * line.quantity, locale)}</strong>
              <button aria-label={isRu ? `Удалить ${line.name}` : `${line.name} жою`} className="cart-page-line__remove" type="button" onClick={() => removeLine(line.id)}><CloseIcon /></button>
            </article>
          ))}
        </div>
        <aside className="cart-page__summary">
          <h2>{isRu ? "Итого" : "Қорытынды"}</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatKzt(subtotal, locale)}</dd></div>
            {discount ? <div className="q-accent"><dt>Bundle saving</dt><dd>− {formatKzt(discount, locale)}</dd></div> : null}
            <div><dt>{isRu ? "Доставка" : "Жеткізу"}</dt><dd>{isRu ? "На checkout" : "Checkout кезінде"}</dd></div>
            <div><dt>Total</dt><dd>{formatKzt(total, locale)}</dd></div>
          </dl>
          <Link className="q-button q-button--solid" data-testid="checkout-link" href={`/${locale}/checkout`}>{isRu ? "Перейти к checkout" : "Checkout-қа өту"}<span aria-hidden="true">→</span></Link>
          <p>{isRu ? "Итоговая доставка показывается до тестового подтверждения. Реальное списание не выполняется." : "Жеткізудің қорытындысы тест растауына дейін көрсетіледі. Нақты төлем алынбайды."}</p>
        </aside>
      </div>
    </section>
  );
}
