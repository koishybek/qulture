"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";

type WaitlistFormProps = {
  locale: "ru" | "kz";
  compact?: boolean;
  source?: string;
  policyVersion?: string;
  captureEnabled?: boolean;
  context?: {
    intent?: "launch" | "restock";
    productId?: string;
    variantId?: string;
    color?: string;
    size?: string;
  };
};

const DEFAULT_POLICY_VERSION = "2026-07-draft";

const copy = {
  ru: {
    name: "Имя",
    city: "Город",
    interest: "Что вас интересует",
    size: "Размер",
    contact: "Email или телефон",
    choose: "Выберите",
    astana: "Астана",
    almaty: "Алматы",
    other: "Другой город",
    set: "Комплект",
    top: "Верх",
    pants: "Брюки",
    unknown: "Пока не знаю",
    service: "Согласен получить сервисное уведомление о готовности",
    restock: "Согласен получить сервисное уведомление о поступлении выбранного варианта",
    selectedVariant: "Запрос о поступлении",
    marketing: "Отдельно согласен получать новости QULTURE",
    policy: "Перед отправкой ознакомьтесь с проектом политики конфиденциальности и условиями согласия.",
    privacyLink: "Конфиденциальность",
    consentLink: "Согласие",
    policyVersion: "Версия текста",
    submit: "Сообщить о готовности",
    pending: "Сохраняем…",
    success: "Готово. Мы сохранили ваш интерес и выбранные согласия.",
    error: "Не удалось сохранить. Проверьте контакт и повторите безопасно.",
    policyChanged: "Версия текста изменилась. Обновите страницу и перед отправкой прочитайте её снова.",
    unavailable: "Сбор контактов временно отключён до утверждения политики.",
    invalidContext: "Выбранный товар или вариант больше недоступен. Вернитесь в каталог и выберите его снова.",
  },
  kz: {
    name: "Аты",
    city: "Қала",
    interest: "Сізді не қызықтырады",
    size: "Өлшем",
    contact: "Email немесе телефон",
    choose: "Таңдаңыз",
    astana: "Астана",
    almaty: "Алматы",
    other: "Басқа қала",
    set: "Жиынтық",
    top: "Үстіңгі бөлік",
    pants: "Шалбар",
    unknown: "Әзірге білмеймін",
    service: "Дайындық туралы сервистік хабарлама алуға келісемін",
    restock: "Таңдалған нұсқа қайта түскенде сервистік хабарлама алуға келісемін",
    selectedVariant: "Қайта түсу сұрауы",
    marketing: "QULTURE жаңалықтарын бөлек алуға келісемін",
    policy: "Жібермес бұрын құпиялылық саясатының жобасымен және келісім шарттарымен танысыңыз.",
    privacyLink: "Құпиялылық",
    consentLink: "Келісім",
    policyVersion: "Мәтін нұсқасы",
    submit: "Дайын болғанда хабарлау",
    pending: "Сақтап жатырмыз…",
    success: "Дайын. Қызығушылығыңыз бен келісімдеріңіз сақталды.",
    error: "Сақтау мүмкін болмады. Байланысты тексеріп, қайта көріңіз.",
    policyChanged: "Мәтін нұсқасы өзгерді. Бетті жаңартып, жібермес бұрын қайта оқыңыз.",
    unavailable: "Саясат бекітілгенге дейін байланыс деректерін жинау уақытша өшірілді.",
    invalidContext: "Таңдалған тауар немесе нұсқа енді қолжетімсіз. Каталогқа оралып, қайта таңдаңыз.",
  },
} as const;

export function WaitlistForm({
  locale,
  compact = false,
  source = "waitlist",
  policyVersion = DEFAULT_POLICY_VERSION,
  captureEnabled = true,
  context,
}: WaitlistFormProps) {
  const text = copy[locale];
  const id = useId();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [failure, setFailure] = useState<"generic" | "policy_changed" | "unavailable" | "invalid_context">("generic");
  const isRestock = context?.intent === "restock";
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const selectedSize = context?.size?.trim() || "unknown";
  if (selectedSize !== "unknown" && !sizes.includes(selectedSize)) sizes.push(selectedSize);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!captureEnabled) {
      setFailure("unavailable");
      setStatus("error");
      return;
    }
    const formElement = event.currentTarget;
    setStatus("pending");
    const form = new FormData(formElement);
    setFailure("generic");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.get("city"),
          interest: form.get("interest"),
          intent: isRestock ? "restock" : "launch",
          productId: context?.productId,
          variantId: context?.variantId,
          color: context?.color,
          size: context?.size ?? form.get("size"),
          name: form.get("name"),
          contact: form.get("contact"),
          serviceConsent: form.get("serviceConsent") === "on",
          restockConsent: form.get("restockConsent") === "on",
          marketingConsent: form.get("marketingConsent") === "on",
          policyVersion,
          locale,
          source,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        const code = payload?.error ?? payload?.message;
        if (code === "policy_version_changed") setFailure("policy_changed");
        if (code === "draft_policy_capture_disabled") setFailure("unavailable");
        if (code === "invalid_waitlist_context") setFailure("invalid_context");
        throw new Error("waitlist_failed");
      }
      setStatus("success");
      formElement.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className={`waitlist-form${compact ? " waitlist-form--compact" : ""}`} onSubmit={handleSubmit}>
      <div className="q-field">
        <label htmlFor={`${id}-city`}>{text.city}</label>
        <select required className="q-select" defaultValue="" id={`${id}-city`} name="city">
          <option disabled value="">{text.choose}</option>
          <option value="astana">{text.astana}</option>
          <option value="almaty">{text.almaty}</option>
          <option value="other">{text.other}</option>
        </select>
      </div>
      <div className="q-field">
        <label htmlFor={`${id}-interest`}>{text.interest}</label>
        <select required className="q-select" defaultValue="" id={`${id}-interest`} name="interest">
          <option disabled value="">{text.choose}</option>
          <option value="set">{text.set}</option>
          <option value="top">{text.top}</option>
          <option value="pants">{text.pants}</option>
        </select>
      </div>
      <div className="q-field">
        <label htmlFor={`${id}-size`}>{text.size}</label>
        <select required className="q-select" defaultValue={selectedSize} disabled={Boolean(context?.size)} id={`${id}-size`} name="size">
          <option value="unknown">{text.unknown}</option>
          {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </div>
      {isRestock ? (
        <p className="waitlist-form__context">
          <strong>{text.selectedVariant}</strong>
          {context?.color ? <span>{context.color}</span> : null}
          {context?.size ? <span>{context.size}</span> : null}
        </p>
      ) : null}
      <div className="q-field waitlist-form__contact">
        <label htmlFor={`${id}-name`}>{text.name}</label>
        <input required autoComplete="name" className="q-input" id={`${id}-name`} name="name" />
      </div>
      <div className="q-field waitlist-form__contact">
        <label htmlFor={`${id}-contact`}>{text.contact}</label>
        <input required autoComplete="email" className="q-input" id={`${id}-contact`} name="contact" placeholder="name@example.com / +7…" />
      </div>
      <label className="q-checkbox waitlist-form__service">
        <input required name="serviceConsent" type="checkbox" />
        <span>{text.service}</span>
      </label>
      {isRestock ? (
        <label className="q-checkbox waitlist-form__service">
          <input required name="restockConsent" type="checkbox" />
          <span>{text.restock}</span>
        </label>
      ) : null}
      <label className="q-checkbox waitlist-form__marketing">
        <input name="marketingConsent" type="checkbox" />
        <span>{text.marketing}</span>
      </label>
      <p className="waitlist-form__policy">
        {text.policy}{" "}
        <Link href={`/${locale}/privacy`}>{text.privacyLink}</Link>{" / "}
        <Link href={`/${locale}/consent`}>{text.consentLink}</Link>.
        {" "}{text.policyVersion}: <strong>{policyVersion}</strong>.
      </p>
      <button className="q-button q-button--solid waitlist-form__submit" disabled={!captureEnabled || status === "pending"} type="submit">
        {status === "pending" ? text.pending : text.submit} <ArrowIcon />
      </button>
      <p aria-live="polite" className="q-status waitlist-form__status" data-kind={status} role="status">
        {!captureEnabled
          ? text.unavailable
          : status === "success"
          ? text.success
          : status === "error"
            ? failure === "policy_changed"
              ? text.policyChanged
              : failure === "unavailable"
                ? text.unavailable
                : failure === "invalid_context"
                  ? text.invalidContext
                : text.error
            : ""}
      </p>
    </form>
  );
}
