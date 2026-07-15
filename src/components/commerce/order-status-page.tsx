"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type OrderView = { orderNumber: string; status: string; paymentStatus: string; total: number; currency: string; createdAt: string; lines: Array<{ name: string; size: string; quantity: number }> };

export function OrderStatusPage({ locale, initialOrder }: { locale: "ru" | "kz"; initialOrder?: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [proofInput, setProofInput] = useState("");
  const isRu = locale === "ru";

  const lookup = useCallback(async (orderNumber: string, tokenOrContact: string) => {
    setPending(true); setError("");
    try { const response = await fetch("/api/orders/status", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber, proof: tokenOrContact }) }); const payload = (await response.json()) as OrderView & { message?: string }; if (!response.ok || !payload.orderNumber) throw new Error(); setOrder(payload); }
    catch { setOrder(null); setError(isRu ? "Заказ не найден или данные подтверждения не совпадают." : "Тапсырыс табылмады немесе растау деректері сәйкес емес."); }
    finally { setPending(false); }
  }, [isRu]);

  useEffect(() => {
    const linkToken = new URLSearchParams(window.location.hash.slice(1)).get("token")?.trim() ?? "";
    if (!linkToken) return;
    const timer = window.setTimeout(() => {
      setProofInput(linkToken);
      if (initialOrder) void lookup(initialOrder, linkToken);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialOrder, lookup]);

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); void lookup(String(form.get("orderNumber") ?? ""), String(form.get("proof") ?? "")); }

  return <section className="q-page order-status-page"><div className="q-page-header"><h1 className="q-display q-display--medium">ORDER<br />STATUS</h1><p className="q-lead">{isRu ? "Проверьте test order по номеру и защищённой ссылке либо контактному email." : "Test order нөмірі және қорғалған сілтеме не email арқылы тексеріңіз."}</p></div><div className="q-page-body"><div className="order-status-content"><form className="order-status-form" onSubmit={submit}><div className="q-field"><label htmlFor="status-number">{isRu ? "Номер заказа" : "Тапсырыс нөмірі"}</label><input required className="q-input" defaultValue={initialOrder} id="status-number" name="orderNumber" /></div><div className="q-field"><label htmlFor="status-proof">{isRu ? "Код ссылки или email" : "Сілтеме коды немесе email"}</label><input required className="q-input" id="status-proof" name="proof" onChange={(event) => setProofInput(event.target.value)} value={proofInput} /></div><button className="q-button" disabled={pending} type="submit">{pending ? "…" : (isRu ? "Проверить" : "Тексеру")}<span aria-hidden="true">→</span></button></form><p aria-live="assertive" className="q-status" data-kind="error">{error}</p>{order ? <article className="order-result"><p className="q-meta q-accent">{order.status}</p><h2>{order.orderNumber}</h2><dl><div><dt>Payment</dt><dd>{order.paymentStatus}</dd></div><div><dt>Total</dt><dd>{new Intl.NumberFormat("ru-KZ").format(order.total)} {order.currency}</dd></div><div><dt>{isRu ? "Создан" : "Жасалды"}</dt><dd>{new Date(order.createdAt).toLocaleString(locale === "ru" ? "ru-KZ" : "kk-KZ")}</dd></div></dl>{order.lines.map((line) => <p key={`${line.name}-${line.size}`}>{line.name} · {line.size} × {line.quantity}</p>)}</article> : null}</div></div></section>;
}
