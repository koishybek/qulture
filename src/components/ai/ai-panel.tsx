"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { HandoffForm } from "@/components/ai/handoff-form";
import { useCart } from "@/components/commerce/cart-provider";
import { CloseIcon, SendIcon } from "@/components/ui/icons";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import { trackEvent } from "@/lib/analytics/client";
import { resolveAIAction } from "@/lib/ai/client-actions";
import {
  AI_CONTEXT_EVENT,
  AI_OPEN_EVENT,
  getCurrentAIProductContext,
  type AIContextEventDetail,
  type AIOpenDetail,
  type AIProductContext,
} from "@/lib/ai/client-events";
import {
  parseAIClientState,
  serializeAIClientState,
  type AIClientMessage,
} from "@/lib/ai/client-state";
import { AIActionSchema, type AIAction } from "@/lib/ai/schemas";

type AIPanelProps = {
  locale: "ru" | "kz";
  teaserDelay?: number;
  teaserEnabled?: boolean;
  teaserFrequency?: string;
  policyVersion?: string;
  captureEnabled?: boolean;
  quickActions?: string[];
};

type TeaserFrequency = "once_per_session" | "once_per_day" | "always";

const panelCopy = {
  ru: {
    title: "AI-консультант QULTURE",
    intro: "Помогу разобраться в системе, размере и сценариях носки. Отвечаю только по подтверждённым данным.",
    quick: [
      "Помочь выбрать размер",
      "Что подойдёт под мой климат?",
      "Сравнить комплект и отдельные вещи",
      "Собрать образ",
      "Наличие и доставка",
      "Поговорить с консультантом",
    ],
    placeholder: "Задайте вопрос…",
    send: "Отправить",
    close: "Закрыть консультанта",
    teaser: "Чем я могу помочь?",
    error: "Консультант временно недоступен. Вы можете оставить вопрос команде.",
    actionUnavailable: "Не могу безопасно выполнить это действие. Откройте товар или передайте вопрос команде.",
    cartConfirmed: "Выбранная позиция добавлена в корзину после вашего подтверждения.",
    handoffRecorded: "Вопрос передан команде.",
    measurementConsent: "Согласен использовать и сохранять отправленные мной параметры тела для подбора размера в этом диалоге.",
    measurementNote: "Без этого согласия параметры не сохраняются и точный size tool по ним не запускается.",
  },
  kz: {
    title: "QULTURE AI-кеңесшісі",
    intro: "Жүйе, өлшем және кию сценарийлерін түсіндіремін. Тек расталған деректерге сүйенемін.",
    quick: [
      "Өлшем таңдауға көмектесу",
      "Менің климатыма не сай келеді?",
      "Жиынтық пен жеке заттарды салыстыру",
      "Образ құру",
      "Қолжетімділік және жеткізу",
      "Кеңесшімен сөйлесу",
    ],
    placeholder: "Сұрағыңызды жазыңыз…",
    send: "Жіберу",
    close: "Кеңесшіні жабу",
    teaser: "Қалай көмектесе аламын?",
    error: "Кеңесші уақытша қолжетімсіз. Сұрағыңызды командаға қалдыра аласыз.",
    actionUnavailable: "Бұл әрекетті қауіпсіз орындай алмаймын. Өнімді ашыңыз немесе сұрақты командаға жіберіңіз.",
    cartConfirmed: "Таңдалған позиция сіздің растауыңыздан кейін себетке қосылды.",
    handoffRecorded: "Сұрақ командаға жіберілді.",
    measurementConsent: "Осы диалогта өлшем таңдау үшін өзім жіберген дене параметрлерін қолдануға және сақтауға келісемін.",
    measurementNote: "Бұл келісімсіз параметрлер сақталмайды және олар бойынша нақты size tool іске қосылмайды.",
  },
} as const;

const SESSION_STATE_PREFIX = "qulture-ai-state-v1";
const SESSION_ID_PREFIX = "qulture-ai-session-v1";
const TEASER_SESSION_KEY = "qulture-ai-teaser-dismissed-v2";
const TEASER_DAY_KEY = "qulture-ai-teaser-dismissed-day-v1";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function frequency(value: string | undefined): TeaserFrequency {
  return value === "once_per_day" || value === "always"
    ? value
    : "once_per_session";
}

function localDay(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function sessionId(locale: "ru" | "kz"): string {
  const key = `${SESSION_ID_PREFIX}:${locale}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing && /^[a-zA-Z0-9_.:-]{8,128}$/.test(existing)) return existing;
    const created = makeId();
    sessionStorage.setItem(key, created);
    return created;
  } catch {
    return makeId();
  }
}

function responseActions(value: unknown): AIAction[] | undefined {
  const parsed = AIActionSchema.array().max(3).safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function AIPanel({
  locale,
  teaserDelay = 7000,
  teaserEnabled = true,
  teaserFrequency,
  policyVersion = "2026-07-draft",
  captureEnabled = true,
  quickActions,
}: AIPanelProps) {
  const text = panelCopy[locale];
  const initialActions: readonly string[] = quickActions?.length
    ? quickActions
    : text.quick;
  const pathname = usePathname();
  const checkoutPage = pathname.includes("/checkout");
  const router = useRouter();
  const { lines, updateLine } = useCart();
  const normalizedFrequency = frequency(teaserFrequency);
  const storageKey = `${SESSION_STATE_PREFIX}:${locale}`;
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [entryPoint, setEntryPoint] = useState("floating");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<AIClientMessage[]>([]);
  const [measurementConsent, setMeasurementConsent] = useState(false);
  const [productContext, setProductContext] = useState<AIProductContext | null>(null);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const queuedPromptRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const teaserShownPathRef = useRef<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setHandoffOpen(false);
  }, []);
  useDialogBehavior(open, panelRef, close, triggerRef);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoadedStorageKey(null);
      const stored = (() => {
        try {
          return parseAIClientState(sessionStorage.getItem(storageKey));
        } catch {
          return null;
        }
      })();
      setConversationId(stored?.conversationId);
      setMessages(stored?.messages ?? []);
      setMeasurementConsent(stored?.measurementConsent ?? false);
      sessionIdRef.current = sessionId(locale);
      setLoadedStorageKey(storageKey);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    try {
      sessionStorage.setItem(
        storageKey,
        serializeAIClientState({ conversationId, measurementConsent, messages }),
      );
    } catch {
      // Session persistence is best-effort; the live assistant remains usable.
    }
  }, [conversationId, loadedStorageKey, measurementConsent, messages, storageKey]);

  useEffect(() => {
    let cancelled = false;
    const onContext = (event: Event) => {
      const detail = (event as CustomEvent<AIContextEventDetail>).detail;
      if (!detail) return;
      if (detail.type === "register") {
        setProductContext(detail.context);
      } else {
        setProductContext((current) =>
          current?.registrationId === detail.registrationId ? null : current,
        );
      }
    };
    window.addEventListener(AI_CONTEXT_EVENT, onContext);
    queueMicrotask(() => {
      if (!cancelled) setProductContext(getCurrentAIProductContext());
    });
    return () => {
      cancelled = true;
      window.removeEventListener(AI_CONTEXT_EVENT, onContext);
    };
  }, []);

  const markTeaserSeen = useCallback(() => {
    setTeaser(false);
    try {
      if (normalizedFrequency === "once_per_session") {
        sessionStorage.setItem(TEASER_SESSION_KEY, "1");
      } else if (normalizedFrequency === "once_per_day") {
        localStorage.setItem(TEASER_DAY_KEY, localDay());
      }
    } catch {
      // Storage can be disabled; in-memory state still prevents an immediate repeat.
    }
  }, [normalizedFrequency]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<AIOpenDetail>).detail;
      const nextEntryPoint = (detail?.entryPoint ?? "site").slice(0, 80);
      const registered = getCurrentAIProductContext();
      if (detail?.productId) {
        const sameProduct = registered?.productId === detail.productId;
        setProductContext({
          ...(sameProduct && registered ? registered : {}),
          registrationId: sameProduct && registered
            ? registered.registrationId
            : `open-event-${makeId()}`,
          productId: detail.productId.slice(0, 128),
          productSlug: detail.productSlug?.slice(0, 128),
          selectedVariantId: detail.selectedVariantId?.slice(0, 128),
          selectedColor: detail.selectedColor?.slice(0, 160),
          selectedSize: detail.selectedSize?.slice(0, 80),
        });
      } else if (registered) {
        setProductContext(registered);
      }
      setEntryPoint(nextEntryPoint);
      queuedPromptRef.current = detail?.prompt?.slice(0, 2_000) ?? null;
      setOpen(true);
      setHandoffOpen(false);
      markTeaserSeen();
      trackEvent("AI_OPEN", { entryPoint: nextEntryPoint }, { locale });
      requestAnimationFrame(() => inputRef.current?.focus());
    };
    window.addEventListener(AI_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(AI_OPEN_EVENT, onOpen);
  }, [locale, markTeaserSeen]);

  useEffect(() => {
    if (!open || !queuedPromptRef.current) return;
    const timer = window.setTimeout(() => {
      const prompt = queuedPromptRef.current;
      queuedPromptRef.current = null;
      if (!prompt || !inputRef.current) return;
      inputRef.current.value = prompt;
      inputRef.current.form?.requestSubmit();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (
      !teaserEnabled ||
      open ||
      checkoutPage ||
      teaserShownPathRef.current === pathname
    ) {
      return;
    }
    try {
      if (
        normalizedFrequency === "once_per_session" &&
        sessionStorage.getItem(TEASER_SESSION_KEY) === "1"
      ) {
        return;
      }
      if (
        normalizedFrequency === "once_per_day" &&
        localStorage.getItem(TEASER_DAY_KEY) === localDay()
      ) {
        return;
      }
    } catch {
      // Continue with in-memory frequency behavior when storage is unavailable.
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      teaserShownPathRef.current = pathname;
      setTeaser(true);
      trackEvent("AI_TEASER_SHOWN", { page: pathname }, { locale });
    };
    const timer = window.setTimeout(
      show,
      Math.min(Math.max(teaserDelay, 5_000), 8_000),
    );
    const onScroll = () => {
      if (window.scrollY < Math.min(window.innerHeight * 0.3, 280)) return;
      window.clearTimeout(timer);
      show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [checkoutPage, locale, normalizedFrequency, open, pathname, teaserDelay, teaserEnabled]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [actionPending, handoffOpen, messages, open, pending]);

  const dismissTeaser = () => {
    markTeaserSeen();
    trackEvent("AI_TEASER_CLOSED", { page: pathname }, { locale });
  };

  const appendAssistantNotice = useCallback((content: string) => {
    setMessages((current) => [
      ...current,
      { id: makeId(), role: "assistant", content },
    ]);
  }, []);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || pending || actionPending) return;
    const userMessage: AIClientMessage = {
      id: makeId(),
      role: "user",
      content: trimmed.slice(0, 2_000),
    };
    setMessages((current) => [...current, userMessage]);
    setPending(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          locale,
          conversationId: conversationId ?? null,
          context: {
            currentPage: pathname,
            productId: productContext?.productId ?? null,
            selectedVariantId: productContext?.selectedVariantId ?? null,
            selectedColor: productContext?.selectedColor ?? null,
            selectedSize: productContext?.selectedSize ?? null,
            cart: lines.slice(0, 30).map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              quantity: Math.min(Math.max(line.quantity, 1), 10),
            })),
            entryPoint,
            sessionId: sessionIdRef.current ?? sessionId(locale),
            measurementConsent,
          },
        }),
      });
      const payload = (await response.json()) as {
        conversationId?: unknown;
        message?: unknown;
        actions?: unknown;
      };
      if (!response.ok || typeof payload.message !== "string" || !payload.message.trim()) {
        throw new Error("ai_unavailable");
      }
      const assistantMessage = payload.message.slice(0, 2_000);
      if (typeof payload.conversationId === "string") {
        setConversationId(payload.conversationId);
      }
      const safeActions = responseActions(payload.actions);
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: assistantMessage,
          actions: safeActions,
        },
      ]);
      trackEvent(
        "AI_RECOMMENDATION",
        { hasActions: Boolean(safeActions?.length) },
        { locale },
      );
    } catch {
      appendAssistantNotice(text.error);
    } finally {
      setPending(false);
    }
  }

  async function handleAction(action: AIAction) {
    if (pending || actionPending) return;
    trackEvent("AI_QUICK_ACTION_CLICKED", { kind: action.kind }, { locale });
    let resolved = resolveAIAction(action, locale);
    if (
      resolved.type === "invalid" &&
      action.kind === "open_product" &&
      productContext?.productSlug
    ) {
      resolved = {
        type: "navigate",
        href: `/${locale}/product/${encodeURIComponent(productContext.productSlug)}`,
      };
    }

    if (resolved.type === "prompt") {
      await sendMessage(resolved.prompt);
      return;
    }
    if (resolved.type === "navigate") {
      close();
      router.push(resolved.href);
      return;
    }
    if (resolved.type === "handoff") {
      setHandoffOpen(true);
      return;
    }
    if (resolved.type === "invalid") {
      appendAssistantNotice(text.actionUnavailable);
      return;
    }

    setActionPending(true);
    try {
      let confirmed = false;
      const handler = productContext?.onConfirmAddToCart;
      const matchesCurrentSelection =
        resolved.items.length === 1 &&
        resolved.items[0]?.productId === productContext?.productId &&
        resolved.items[0]?.variantId === productContext?.selectedVariantId;
      if (handler && matchesCurrentSelection) {
        confirmed = await handler(resolved.items);
      } else {
        const matchingLines = resolved.items.map((item) => ({
          item,
          line: lines.find(
            (line) =>
              line.productId === item.productId &&
              line.variantId === item.variantId,
          ),
        }));
        if (matchingLines.every((match) => match.line !== undefined)) {
          for (const match of matchingLines) {
            if (!match.line) continue;
            updateLine(match.line.id, {
              quantity: Math.min(10, match.line.quantity + match.item.quantity),
            });
          }
          confirmed = true;
        }
      }

      if (confirmed) {
        appendAssistantNotice(text.cartConfirmed);
        window.dispatchEvent(new CustomEvent("qulture:open-cart"));
      } else {
        appendAssistantNotice(text.actionUnavailable);
      }
    } catch {
      appendAssistantNotice(text.actionUnavailable);
    } finally {
      setActionPending(false);
    }
  }

  function handleInitialAction(value: string) {
    trackEvent("AI_QUICK_ACTION_CLICKED", { kind: "prompt" }, { locale });
    if (!quickActions?.length && value === text.quick[text.quick.length - 1]) {
      setHandoffOpen(true);
      return;
    }
    void sendMessage(value);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get("message") ?? "");
    event.currentTarget.reset();
    void sendMessage(value);
  }

  const lastUserQuestion =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const lastAssistantSummary =
    [...messages].reverse().find((message) => message.role === "assistant")?.content;

  return (
    <>
      {teaser && !open && !checkoutPage ? (
        <div className="ai-teaser" role="status">
          <button
            type="button"
            onClick={() => {
              setEntryPoint("teaser");
              setOpen(true);
              markTeaserSeen();
              trackEvent("AI_OPEN", { entryPoint: "teaser" }, { locale });
            }}
          >
            {text.teaser}
          </button>
          <button aria-label={text.close} type="button" onClick={dismissTeaser}>
            <CloseIcon size={18} />
          </button>
        </div>
      ) : null}
      <button
        ref={triggerRef}
        aria-label={text.title}
        className="ai-floating-button"
        type="button"
        onClick={() => {
          setEntryPoint("floating");
          setOpen(true);
          setHandoffOpen(false);
          markTeaserSeen();
          trackEvent("AI_OPEN", { entryPoint: "floating" }, { locale });
        }}
      >
        <span>AI</span>
        <span className="ai-floating-button__label">ASSIST</span>
      </button>
      {open ? (
        <button aria-label={text.close} className="overlay-backdrop" type="button" onClick={close} />
      ) : null}
      <aside
        ref={panelRef}
        aria-hidden={!open}
        aria-labelledby="ai-panel-title"
        aria-modal="true"
        className="ai-panel q-dark"
        data-open={open}
        inert={!open}
        role="dialog"
      >
        <header className="ai-panel__header">
          <div>
            <p className="q-meta">QULTURE</p>
            <h2 id="ai-panel-title">{text.title}</h2>
          </div>
          <button aria-label={text.close} className="ai-panel__close" type="button" onClick={close}>
            <CloseIcon />
          </button>
        </header>
        <div ref={messagesRef} aria-busy={pending || actionPending} aria-live="polite" className="ai-panel__messages">
          {handoffOpen ? (
            <HandoffForm
              context={{
                productId: productContext?.productId,
                selectedVariantId: productContext?.selectedVariantId,
              }}
              conversationId={conversationId}
              defaultQuestion={lastUserQuestion}
              defaultSummary={lastAssistantSummary}
              locale={locale}
              measurementConsent={measurementConsent}
              policyVersion={policyVersion}
              captureEnabled={captureEnabled}
              onCancel={() => setHandoffOpen(false)}
              onSuccess={() => appendAssistantNotice(text.handoffRecorded)}
            />
          ) : messages.length === 0 ? (
            <div className="ai-panel__intro">
              <p>{text.intro}</p>
              <div className="ai-panel__quick">
                {initialActions.map((action) => (
                  <button key={action} type="button" onClick={() => handleInitialAction(action)}>
                    {action}<span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <article key={message.id} className="ai-message" data-role={message.role}>
                <p className="q-meta">
                  {message.role === "user" ? (locale === "ru" ? "Вы" : "Сіз") : "QULTURE AI"}
                </p>
                <p>{message.content}</p>
                {message.actions?.length ? (
                  <div className="ai-message__actions">
                    {message.actions.map((action, index) => (
                      <button
                        disabled={pending || actionPending}
                        key={`${action.kind}-${action.value}-${index}`}
                        type="button"
                        onClick={() => void handleAction(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          )}
          {pending || actionPending ? <p className="ai-panel__typing">QULTURE AI ···</p> : null}
        </div>
        <div className="ai-panel__measurement">
          <label className="q-checkbox">
            <input
              checked={measurementConsent}
              type="checkbox"
              onChange={(event) => setMeasurementConsent(event.currentTarget.checked)}
            />
            <span>{text.measurementConsent}</span>
          </label>
          <small>{text.measurementNote}</small>
        </div>
        <form className="ai-panel__composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="ai-message-input">{text.placeholder}</label>
          <input
            ref={inputRef}
            autoComplete="off"
            disabled={handoffOpen}
            id="ai-message-input"
            maxLength={2_000}
            name="message"
            placeholder={text.placeholder}
          />
          <button aria-label={text.send} disabled={pending || actionPending || handoffOpen} type="submit">
            <SendIcon />
          </button>
        </form>
      </aside>
    </>
  );
}
