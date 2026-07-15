"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CloseIcon } from "@/components/ui/icons";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  policyVersion: string;
  updatedAt: string;
};

const STORAGE_KEY = "qulture-consent-v1";
const DEFAULT_POLICY_VERSION = "2026-07-draft";

export function ConsentManager({ locale, policyVersion = DEFAULT_POLICY_VERSION }: { locale: "ru" | "kz"; policyVersion?: string }) {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [hasStored, setHasStored] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDialogBehavior(open, modalRef, close, triggerRef);

  const isRu = locale === "ru";

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPolicy = "";
      if (stored) {
        try { currentPolicy = (JSON.parse(stored) as Partial<ConsentState>).policyVersion ?? ""; } catch { currentPolicy = ""; }
      }
      const validStored = Boolean(stored && currentPolicy === policyVersion);
      setHasStored(validStored);
      if (!validStored) setOpen(true);
    });
    const onSettings = () => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) {
        try {
          const parsed = JSON.parse(current) as Partial<ConsentState>;
          setAnalytics(Boolean(parsed.analytics));
          setMarketing(Boolean(parsed.marketing));
        } catch {
          setAnalytics(false);
          setMarketing(false);
        }
      }
      setCustomizing(true);
      setOpen(true);
    };
    window.addEventListener("qulture:cookie-settings", onSettings);
    return () => {
      cancelled = true;
      window.removeEventListener("qulture:cookie-settings", onSettings);
    };
  }, [policyVersion]);

  async function persist(nextAnalytics: boolean, nextMarketing: boolean) {
    const value: ConsentState = {
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      policyVersion,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setHasStored(true);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("qulture:consent-updated", { detail: value }));
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...value, locale }),
    }).catch(() => undefined);
  }

  if (!open) return <button ref={triggerRef} aria-hidden="true" className="consent-trigger-sentinel" tabIndex={-1} type="button" />;

  return (
    <div ref={modalRef} aria-labelledby="consent-title" aria-modal="true" className="consent-panel" role="dialog">
      <div className="consent-panel__copy">
        <p className="q-meta">QULTURE / PRIVACY</p>
        <h2 id="consent-title">{isRu ? "Настройки данных" : "Деректер баптаулары"}</h2>
        <p>{isRu ? "Необходимые cookies поддерживают работу сайта. Аналитика и маркетинг не запускаются без вашего выбора." : "Қажетті cookies сайт жұмысын қолдайды. Аналитика мен маркетинг сіздің таңдауыңызсыз іске қосылмайды."}</p>
        <Link href={`/${locale}/cookies`}>{isRu ? "Подробнее" : "Толығырақ"} →</Link>
      </div>
      {customizing ? (
        <div className="consent-panel__choices">
          <label className="q-checkbox"><input checked disabled type="checkbox" /><span>{isRu ? "Необходимые — всегда включены" : "Қажетті — әрқашан қосулы"}</span></label>
          <label className="q-checkbox"><input checked={analytics} type="checkbox" onChange={(event) => setAnalytics(event.target.checked)} /><span>{isRu ? "Аналитика" : "Аналитика"}</span></label>
          <label className="q-checkbox"><input checked={marketing} type="checkbox" onChange={(event) => setMarketing(event.target.checked)} /><span>{isRu ? "Маркетинг" : "Маркетинг"}</span></label>
        </div>
      ) : null}
      <div className="consent-panel__actions">
        <button className="q-button" type="button" onClick={() => void persist(false, false)}>{isRu ? "Отклонить необязательные" : "Қосымшадан бас тарту"}</button>
        {customizing ? (
          <button className="q-button q-button--solid" type="button" onClick={() => void persist(analytics, marketing)}>{isRu ? "Сохранить выбор" : "Таңдауды сақтау"}</button>
        ) : (
          <>
            <button className="q-button" type="button" onClick={() => setCustomizing(true)}>{isRu ? "Настроить" : "Баптау"}</button>
            <button className="q-button q-button--solid" type="button" onClick={() => void persist(true, true)}>{isRu ? "Принять все" : "Барлығын қабылдау"}</button>
          </>
        )}
      </div>
      {hasStored ? <button aria-label={isRu ? "Закрыть" : "Жабу"} className="consent-panel__close" type="button" onClick={() => setOpen(false)}><CloseIcon /></button> : null}
    </div>
  );
}
