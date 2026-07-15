"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics/client";
import { commerceText, type CommerceLocale } from "@/lib/commerce/locale";
import type { ProviderReadiness } from "@/lib/commerce/providers";

import { displayCartLineColor, displayCartLineName, formatKzt, useCart } from "./cart-provider";

function makeId() { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }

export function CheckoutPage({ demoCaptureEnabled, locale, providerReadiness }: { demoCaptureEnabled: boolean; locale: CommerceLocale; providerReadiness: ProviderReadiness[] }) {
  const router = useRouter();
  const { lines, subtotal, discount, total, clear } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useMemo(() => makeId(), []);
  const t = (en: string, ru: string, kz: string) => commerceText(locale, en, ru, kz);

  useEffect(() => { if (lines.length) trackEvent("BEGIN_CHECKOUT", { lineCount: lines.length, demo: lines.some((line) => line.demo) }, { locale }); }, [lines, locale]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length || pending) return;
    setPending(true); setError("");
    trackEvent("PAYMENT_METHOD_SELECTED", { method: "development_mock" }, { locale });
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify({ locale, idempotencyKey, customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone") }, delivery: { city: form.get("city"), address: form.get("address"), method: form.get("deliveryMethod"), comment: form.get("comment") }, paymentMethod: "development_mock", termsAccepted: form.get("terms") === "on", serviceConsent: form.get("serviceConsent") === "on", marketingConsent: form.get("marketingConsent") === "on", lines }) });
      const payload = (await response.json()) as { orderNumber?: string; statusToken?: string; total?: number; currency?: string; message?: string };
      if (!response.ok || !payload.orderNumber || !payload.statusToken) throw new Error(payload.message ?? "order_failed");
      trackEvent("PURCHASE", { orderNumber: payload.orderNumber, total: payload.total ?? null, currency: payload.currency ?? null, demo: true }, { locale });
      clear();
      router.push(`/${locale}/order-status?order=${encodeURIComponent(payload.orderNumber)}#token=${encodeURIComponent(payload.statusToken)}`);
    } catch {
      setError(t("Your order was not created. No duplicate data was sent — check the fields and try again.", "Заказ не создан. Данные не были отправлены повторно — проверьте поля и повторите.", "Тапсырыс жасалмады. Деректер қайталанып жіберілмеді — өрістерді тексеріп, қайта көріңіз."));
    } finally { setPending(false); }
  }

  if (!lines.length) return <section className="q-page commerce-empty"><div className="q-page-header"><h1 className="q-heading">Checkout</h1><p className="q-lead">{t("Add demo components to your bag first.", "Сначала добавьте demo-компоненты в корзину.", "Алдымен demo-бөліктерді себетке қосыңыз.")}</p></div><div className="q-page-body"><Link className="q-button" href={`/${locale}/build-a-set?demo=1`}>Demo build-a-set <span aria-hidden="true">→</span></Link></div></section>;

  if (lines.some((line) => !line.demo)) return <section className="q-page commerce-empty"><div className="q-page-header"><p className="q-meta">QULTURE / CHECKOUT STATUS</p><h1 className="q-display q-display--medium">PAYMENT<br />PENDING.</h1><p className="q-lead">{t("The catalogue is ready for approved products, but production payment, fiscalisation and delivery are not connected yet. We never create a fake payment for a real bag.", "Каталог готов к утверждённым товарам, но production payment, фискализация и доставка ещё не подключены. Мы не создаём фиктивную оплату для реальной корзины.", "Каталог бекітілген тауарларға дайын, бірақ production төлемі, фискализация және жеткізу әлі қосылмаған. Нақты себет үшін жалған төлем жасалмайды.")}</p></div><div className="q-page-body content-sections"><section><h2>{t("Your bag is saved in this browser", "Корзина сохранена в этом браузере", "Себет осы браузерде сақталды")}</h2>{lines.map((line) => <p key={line.id}>{displayCartLineName(line, locale)} · {displayCartLineColor(line, locale)} · {line.size} × {line.quantity}</p>)}<p>{t("When an approved provider is connected, checkout will verify price and availability on the server again.", "После подключения утверждённого провайдера checkout заново проверит цену и наличие на сервере.", "Бекітілген провайдер қосылғаннан кейін checkout баға мен қолжетімділікті серверде қайта тексереді.")}</p></section><section><h2>{t("Integration readiness", "Готовность интеграций", "Интеграциялар дайындығы")}</h2><ul className="integration-status-list">{providerReadiness.map((state) => <li key={state.kind}><strong>{state.kind.toUpperCase()}</strong><span>{state.provider ?? t("No provider selected", "провайдер не выбран", "провайдер таңдалмаған")}</span><span>{state.configured ? "READY" : "PENDING"}</span></li>)}</ul></section><div className="home-hero__actions"><Link className="q-button q-button--solid" href={`/${locale}/waitlist`}>{t("Get notified", "Получить уведомление", "Хабарлама алу")} <span aria-hidden="true">→</span></Link><Link className="q-text-link" href={`/${locale}/contacts`}>{t("Integration status", "Статус интеграций", "Интеграциялар мәртебесі")}</Link></div></div></section>;

  if (!demoCaptureEnabled) return <section className="q-page commerce-empty"><div className="q-page-header"><p className="q-meta">QULTURE / DEMO CHECKOUT</p><h1 className="q-display q-display--medium">DATA CAPTURE<br />DISABLED.</h1><p className="q-lead">{t("Test checkout is available only when server-side demo mode and the data-processing policy are both explicitly active. Your bag remains in this browser.", "Тестовое оформление доступно только в явно включённом server-side demo-режиме и при действующей политике обработки данных. Корзина сохранена в этом браузере.", "Тест рәсімдеу тек server-side demo режимі анық қосылғанда және деректерді өңдеу саясаты күшінде болғанда қолжетімді. Себет осы браузерде сақталды.")}</p></div><div className="q-page-body"><Link className="q-button" href={`/${locale}/privacy`}>{t("Open policy", "Открыть политику", "Саясатты ашу")}<span aria-hidden="true">→</span></Link></div></section>;

  return <section className="checkout-page">
    {lines.some((line) => line.demo) ? <div className="demo-rail">DEMO CHECKOUT — NO REAL PAYMENT</div> : null}
    <div className="checkout-page__header"><p className="q-meta">QULTURE / CHECKOUT</p><h1 className="q-display q-display--medium">{t("Checkout", "Оформление", "Рәсімдеу")}</h1></div>
    <form className="checkout-page__layout" onSubmit={submit}>
      <div className="checkout-page__form">
        <fieldset><legend>01 / {t("Contact", "Контакты", "Байланыс")}</legend><div className="checkout-fields"><div className="q-field"><label htmlFor="checkout-name">{t("Name", "Имя", "Аты")}</label><input required autoComplete="name" className="q-input" id="checkout-name" name="name" /></div><div className="q-field"><label htmlFor="checkout-email">Email</label><input required autoComplete="email" className="q-input" id="checkout-email" name="email" type="email" /></div><div className="q-field"><label htmlFor="checkout-phone">{t("Phone", "Телефон", "Телефон")}</label><input required autoComplete="tel" className="q-input" id="checkout-phone" name="phone" type="tel" /></div></div></fieldset>
        <fieldset><legend>02 / {t("Delivery", "Доставка", "Жеткізу")}</legend><div className="checkout-fields"><div className="q-field"><label htmlFor="checkout-city">{t("City", "Город", "Қала")}</label><select required className="q-select" defaultValue="astana" id="checkout-city" name="city"><option value="astana">Astana</option><option value="almaty">Almaty</option></select></div><div className="q-field checkout-fields__wide"><label htmlFor="checkout-address">{t("Address", "Адрес", "Мекенжай")}</label><input required autoComplete="street-address" className="q-input" id="checkout-address" name="address" /></div><div className="q-field"><label htmlFor="checkout-delivery">{t("Method", "Способ", "Тәсіл")}</label><select className="q-select" id="checkout-delivery" name="deliveryMethod"><option value="mock_courier">{t("Demo courier", "Demo courier", "Demo курьер")}</option></select></div><div className="q-field checkout-fields__wide"><label htmlFor="checkout-comment">{t("Comment", "Комментарий", "Түсініктеме")}</label><textarea className="q-textarea" id="checkout-comment" name="comment" rows={3} /></div></div></fieldset>
        <fieldset><legend>03 / {t("Payment", "Оплата", "Төлем")}</legend><label className="checkout-payment"><input checked readOnly name="payment" type="radio" /><span><strong>DEVELOPMENT MOCK</strong><small>{t("Test adapter. No real charge or Apple Pay is performed.", "Тестовый adapter. Реальное списание и Apple Pay не выполняются.", "Тест adapter. Нақты төлем және Apple Pay орындалмайды.")}</small></span></label></fieldset>
        <fieldset><legend>04 / {t("Consent", "Согласия", "Келісімдер")}</legend><label className="q-checkbox"><input required name="terms" type="checkbox" /><span>{t("I accept the draft Terms of Sale and the data-processing notice", "Принимаю draft Terms of Sale и уведомление об обработке данных", "Draft Terms of Sale және деректерді өңдеу ескертуін қабылдаймын")}</span></label><label className="q-checkbox"><input required name="serviceConsent" type="checkbox" /><span>{t("I consent to service notifications about my order", "Согласен на сервисные уведомления по заказу", "Тапсырыс бойынша сервистік хабарламаларға келісемін")}</span></label><label className="q-checkbox"><input name="marketingConsent" type="checkbox" /><span>{t("I separately consent to QULTURE news", "Отдельно согласен на новости QULTURE", "QULTURE жаңалықтарына бөлек келісемін")}</span></label></fieldset>
        <p aria-live="assertive" className="q-status" data-kind="error">{error}</p>
      </div>
      <aside className="checkout-summary"><h2>{t("Your order", "Ваш заказ", "Тапсырысыңыз")}</h2>{lines.map((line) => <div key={line.id} className="checkout-summary__line"><span>{displayCartLineName(line, locale)}<small>{line.role.toUpperCase()} · {line.size} · {displayCartLineColor(line, locale)}</small></span><strong>{formatKzt(line.unitPrice * line.quantity, locale)}</strong></div>)}<dl><div><dt>Subtotal</dt><dd>{formatKzt(subtotal, locale)}</dd></div>{discount ? <div className="q-accent"><dt>{t("Set saving", "Выгода комплекта", "Жинақ жеңілдігі")}</dt><dd>− {formatKzt(discount, locale)}</dd></div> : null}<div><dt>{t("Delivery", "Доставка", "Жеткізу")}</dt><dd>DEMO 0 ₸</dd></div><div><dt>Total</dt><dd>{formatKzt(total, locale)}</dd></div></dl><button className="q-button q-button--solid" data-testid="create-test-order" disabled={pending} type="submit">{pending ? t("Creating test order…", "Создаём test order…", "Test order жасалуда…") : t("Create test order", "Создать test order", "Test order жасау")}<span aria-hidden="true">→</span></button><p>{t("This creates a test order in the local database. Money cannot be charged.", "Нажатие создаёт тестовый заказ в локальной базе. Денежное списание невозможно.", "Батырма локалды базада тест тапсырысын жасайды. Ақша алынбайды.")}</p></aside>
    </form>
  </section>;
}
