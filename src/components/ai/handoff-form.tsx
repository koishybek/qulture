"use client";

import { FormEvent, useId, useRef, useState } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics/client";
import type { AILocale } from "@/lib/ai/types";

type HandoffContext = {
  productId?: string;
  selectedVariantId?: string;
};

type HandoffFormProps = {
  context: HandoffContext;
  conversationId?: string;
  defaultQuestion: string;
  defaultSummary?: string;
  locale: AILocale;
  measurementConsent: boolean;
  policyVersion: string;
  captureEnabled: boolean;
  onCancel: () => void;
  onSuccess: () => void;
};

const copy = {
  ru: {
    eyebrow: "QULTURE / ПЕРЕДАЧА ЧЕЛОВЕКУ",
    title: "Передать вопрос команде",
    intro: "Команда получит вопрос и выбранный способ связи. Маркетинговая подписка не включается.",
    reason: "Тема",
    reasons: {
      user_request: "Хочу поговорить с командой",
      product_question: "Вопрос о продукте",
      size_help: "Помощь с размером",
      order_help: "Вопрос о заказе",
      technical_error: "Техническая проблема",
    },
    question: "Ваш вопрос",
    name: "Имя (необязательно)",
    email: "Email",
    phone: "Телефон",
    contactHint: "Укажите email или телефон.",
    consent: "Согласен получить сервисный ответ на этот вопрос по указанному контакту.",
    policy: "Применяется версия",
    privacy: "Конфиденциальность",
    consentPage: "Согласие",
    submit: "Передать вопрос",
    pending: "Отправляем…",
    cancel: "Назад к диалогу",
    success: "Вопрос передан команде. Статус можно уточнить через этот диалог.",
    error: "Не удалось передать вопрос. Проверьте контакт и повторите попытку.",
    policyChanged: "Версия политики изменилась. Обновите страницу и прочитайте её снова.",
    unavailable: "Сбор контактов временно отключён до утверждения политики.",
  },
  kz: {
    eyebrow: "QULTURE / КОМАНДАҒА БЕРУ",
    title: "Сұрақты командаға жіберу",
    intro: "Команда сұрақты және таңдаған байланыс тәсілін алады. Маркетингтік жазылым қосылмайды.",
    reason: "Тақырып",
    reasons: {
      user_request: "Командамен сөйлескім келеді",
      product_question: "Өнім туралы сұрақ",
      size_help: "Өлшем бойынша көмек",
      order_help: "Тапсырыс туралы сұрақ",
      technical_error: "Техникалық мәселе",
    },
    question: "Сұрағыңыз",
    name: "Аты (міндетті емес)",
    email: "Email",
    phone: "Телефон",
    contactHint: "Email немесе телефон көрсетіңіз.",
    consent: "Осы сұраққа көрсетілген байланыс арқылы сервистік жауап алуға келісемін.",
    policy: "Қолданылатын нұсқа",
    privacy: "Құпиялылық",
    consentPage: "Келісім",
    submit: "Сұрақты жіберу",
    pending: "Жіберіп жатырмыз…",
    cancel: "Диалогқа оралу",
    success: "Сұрақ командаға жіберілді. Күйін осы диалогтан нақтылауға болады.",
    error: "Сұрақты жіберу мүмкін болмады. Байланысты тексеріп, қайталаңыз.",
    policyChanged: "Саясат нұсқасы өзгерді. Бетті жаңартып, қайта оқыңыз.",
    unavailable: "Саясат бекітілгенге дейін байланыс деректерін жинау уақытша өшірілді.",
  },
  en: {
    eyebrow: "QULTURE / HUMAN HANDOFF",
    title: "Pass your question to the team",
    intro: "The team will receive your question and chosen contact method. This does not subscribe you to marketing.",
    reason: "Topic",
    reasons: {
      user_request: "I want to speak with the team",
      product_question: "Product question",
      size_help: "Sizing help",
      order_help: "Order question",
      technical_error: "Technical issue",
    },
    question: "Your question",
    name: "Name (optional)",
    email: "Email",
    phone: "Phone",
    contactHint: "Enter an email address or phone number.",
    consent: "I agree to receive a service reply to this question using the contact details provided.",
    policy: "Policy version",
    privacy: "Privacy",
    consentPage: "Consent",
    submit: "Send question",
    pending: "Sending…",
    cancel: "Back to conversation",
    success: "Your question was sent to the team. You can ask for an update through this conversation.",
    error: "We could not send your question. Check your contact details and try again.",
    policyChanged: "The policy version changed. Refresh the page and review it again.",
    unavailable: "Contact collection is temporarily disabled until the policy is approved.",
  },
} as const;

function makeIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `handoff-${crypto.randomUUID()}`
    : `handoff-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function HandoffForm({
  context,
  conversationId,
  defaultQuestion,
  defaultSummary,
  locale,
  measurementConsent,
  policyVersion,
  captureEnabled,
  onCancel,
  onSuccess,
}: HandoffFormProps) {
  const text = copy[locale];
  const id = useId();
  const idempotencyKeyRef = useRef(makeIdempotencyKey());
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState(false);
  const [failure, setFailure] = useState<"generic" | "policy_changed" | "unavailable">("generic");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!captureEnabled) {
      setFailure("unavailable");
      setStatus("error");
      return;
    }
    if (status === "pending" || status === "success") return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!email && !phone) {
      setContactError(true);
      return;
    }

    setContactError(false);
    setFailure("generic");
    setStatus("pending");
    const idempotencyKey = idempotencyKeyRef.current;
    try {
      const response = await fetch("/api/handoff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
          "X-QULTURE-Locale": locale,
        },
        body: JSON.stringify({
          conversationId: conversationId ?? null,
          reason: form.get("reason"),
          userQuestion: form.get("question"),
          productId: context.productId ?? null,
          selectedVariantId: context.selectedVariantId ?? null,
          aiConfidence: null,
          summary: defaultSummary?.slice(0, 1_000) || null,
          contactName: String(form.get("name") ?? "").trim() || null,
          contactEmail: email || null,
          contactPhone: phone || null,
          idempotencyKey,
          locale,
          measurementConsent,
          contactConsent: form.get("contactConsent") === "on",
          policyVersion,
        }),
      });
      const payload = (await response.json()) as { status?: string; error?: { code?: string } };
      if (!response.ok || payload.status !== "success") {
        if (payload.error?.code === "policy_version_changed") setFailure("policy_changed");
        if (["draft_policy_capture_disabled", "policy_unavailable"].includes(payload.error?.code ?? "")) setFailure("unavailable");
        throw new Error("handoff_failed");
      }
      setStatus("success");
      trackEvent(
        "AI_HANDOFF",
        { source: "assistant_handoff_form", hasProduct: Boolean(context.productId) },
        { locale, category: "NECESSARY" },
      );
      onSuccess();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="ai-handoff" aria-labelledby={`${id}-title`}>
      <p className="q-meta">{text.eyebrow}</p>
      <h3 id={`${id}-title`}>{text.title}</h3>
      <p>{text.intro}</p>
      <form className="ai-handoff__form" onSubmit={submit}>
        <div className="q-field">
          <label htmlFor={`${id}-reason`}>{text.reason}</label>
          <select className="q-select" defaultValue="user_request" id={`${id}-reason`} name="reason">
            {Object.entries(text.reasons).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="q-field">
          <label htmlFor={`${id}-question`}>{text.question}</label>
          <textarea className="q-textarea" defaultValue={defaultQuestion} id={`${id}-question`} maxLength={2_000} name="question" required rows={4} />
        </div>
        <div className="q-field">
          <label htmlFor={`${id}-name`}>{text.name}</label>
          <input autoComplete="name" className="q-input" id={`${id}-name`} maxLength={160} name="name" />
        </div>
        <div className="q-field">
          <label htmlFor={`${id}-email`}>{text.email}</label>
          <input autoComplete="email" className="q-input" id={`${id}-email`} maxLength={254} name="email" type="email" />
        </div>
        <div className="q-field">
          <label htmlFor={`${id}-phone`}>{text.phone}</label>
          <input autoComplete="tel" className="q-input" id={`${id}-phone`} maxLength={24} name="phone" type="tel" />
        </div>
        {contactError ? <p className="q-status" data-kind="error" role="alert">{text.contactHint}</p> : null}
        <label className="q-checkbox">
          <input name="contactConsent" required type="checkbox" />
          <span>{text.consent}</span>
        </label>
        <p className="ai-handoff__policy">
          {text.policy}: <strong>{policyVersion}</strong>.{" "}
          <Link href={`/${locale}/privacy`}>{text.privacy}</Link>{" / "}
          <Link href={`/${locale}/consent`}>{text.consentPage}</Link>.
        </p>
        <div className="ai-handoff__actions">
          <button className="q-button q-button--solid" disabled={!captureEnabled || status === "pending" || status === "success"} type="submit">
            {status === "pending" ? text.pending : text.submit}
          </button>
          <button className="q-button-quiet" disabled={status === "pending"} onClick={onCancel} type="button">{text.cancel}</button>
        </div>
        <p aria-live="polite" className="q-status" data-kind={status} role="status">
          {!captureEnabled
            ? text.unavailable
            : status === "success"
            ? text.success
            : status === "error"
              ? failure === "policy_changed"
                ? text.policyChanged
                : failure === "unavailable"
                  ? text.unavailable
                  : text.error
              : ""}
        </p>
      </form>
    </section>
  );
}
