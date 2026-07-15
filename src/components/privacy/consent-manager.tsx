"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CloseIcon } from "@/components/ui/icons";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import type { Locale } from "@/lib/i18n";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  policyVersion: string;
  updatedAt: string;
};

type ConsentCopy = {
  eyebrow: string;
  title: string;
  description: string;
  details: string;
  necessary: string;
  analytics: string;
  marketing: string;
  reject: string;
  save: string;
  customize: string;
  acceptAll: string;
  close: string;
};

const STORAGE_KEY = "qulture-consent-v1";
const DEFAULT_POLICY_VERSION = "2026-07-draft";

const copy: Record<Locale | "en", ConsentCopy> = {
  en: {
    eyebrow: "QULTURE / PRIVACY",
    title: "Privacy preferences",
    description: "Essential cookies keep the site running. Analytics and marketing stay off until you choose otherwise.",
    details: "Learn more",
    necessary: "Essential — always on",
    analytics: "Analytics",
    marketing: "Marketing",
    reject: "Reject optional cookies",
    save: "Save preferences",
    customize: "Customize",
    acceptAll: "Accept all",
    close: "Close",
  },
  ru: {
    eyebrow: "QULTURE / КОНФИДЕНЦИАЛЬНОСТЬ",
    title: "Настройки данных",
    description: "Необходимые файлы cookie поддерживают работу сайта. Аналитика и маркетинг не запускаются без вашего выбора.",
    details: "Подробнее",
    necessary: "Необходимые — всегда включены",
    analytics: "Аналитика",
    marketing: "Маркетинг",
    reject: "Отклонить необязательные",
    save: "Сохранить выбор",
    customize: "Настроить",
    acceptAll: "Принять все",
    close: "Закрыть",
  },
  kz: {
    eyebrow: "QULTURE / ҚҰПИЯЛЫЛЫҚ",
    title: "Деректер баптаулары",
    description: "Қажетті cookie файлдары сайт жұмысын қолдайды. Аналитика мен маркетинг сіздің таңдауыңызсыз іске қосылмайды.",
    details: "Толығырақ",
    necessary: "Қажетті — әрқашан қосулы",
    analytics: "Талдау",
    marketing: "Маркетинг",
    reject: "Қосымша cookie файлдарынан бас тарту",
    save: "Таңдауды сақтау",
    customize: "Баптау",
    acceptAll: "Барлығын қабылдау",
    close: "Жабу",
  },
};

export function ConsentManager({ locale, policyVersion = DEFAULT_POLICY_VERSION }: { locale: Locale; policyVersion?: string }) {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [hasStored, setHasStored] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const text = copy[locale];
  useDialogBehavior(open, modalRef, close, triggerRef);

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
    <div
      ref={modalRef}
      aria-describedby="consent-description"
      aria-labelledby="consent-title"
      aria-modal="true"
      className="consent-panel"
      role="dialog"
    >
      <div className="consent-panel__copy">
        <p className="q-meta">{text.eyebrow}</p>
        <h2 id="consent-title">{text.title}</h2>
        <p id="consent-description">{text.description}</p>
        <Link href={`/${locale}/cookies`}>{text.details} →</Link>
      </div>
      {customizing ? (
        <div className="consent-panel__choices">
          <label className="q-checkbox"><input checked disabled type="checkbox" /><span>{text.necessary}</span></label>
          <label className="q-checkbox"><input checked={analytics} type="checkbox" onChange={(event) => setAnalytics(event.target.checked)} /><span>{text.analytics}</span></label>
          <label className="q-checkbox"><input checked={marketing} type="checkbox" onChange={(event) => setMarketing(event.target.checked)} /><span>{text.marketing}</span></label>
        </div>
      ) : null}
      <div className="consent-panel__actions">
        <button className="q-button" type="button" onClick={() => void persist(false, false)}>{text.reject}</button>
        {customizing ? (
          <button className="q-button q-button--solid" type="button" onClick={() => void persist(analytics, marketing)}>{text.save}</button>
        ) : (
          <>
            <button className="q-button" type="button" onClick={() => setCustomizing(true)}>{text.customize}</button>
            <button className="q-button q-button--solid" type="button" onClick={() => void persist(true, true)}>{text.acceptAll}</button>
          </>
        )}
      </div>
      {hasStored ? <button aria-label={text.close} className="consent-panel__close" type="button" onClick={() => setOpen(false)}><CloseIcon /></button> : null}
    </div>
  );
}
