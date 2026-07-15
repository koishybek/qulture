import { z } from "zod";

import { AIActionSchema, type AIAction } from "@/lib/ai/schemas";
import type { AILocale } from "@/lib/ai/types";

export type AIClientMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AIAction[];
};

export type AIClientState = {
  conversationId?: string;
  measurementConsent: boolean;
  messages: AIClientMessage[];
};

const StoredMessageSchema = z
  .object({
    id: z.string().trim().min(1).max(160),
    role: z.enum(["user", "assistant"]),
    content: z.string().max(2_000),
    actions: z.array(AIActionSchema).max(3).optional(),
  })
  .strict();

const StoredStateSchema = z
  .object({
    version: z.literal(1),
    conversationId: z.string().uuid().optional(),
    measurementConsent: z.boolean(),
    messages: z.array(StoredMessageSchema).max(30),
  })
  .strict();

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;
const PHONE_PATTERN = /(?:\+?\d[\d ()-]{7,}\d)/gu;

const redactionCopy: Record<AILocale, { email: string; phone: string; measurement: string }> = {
  en: { email: "[email hidden]", phone: "[phone hidden]", measurement: "[hidden without consent]" },
  ru: { email: "[email скрыт]", phone: "[телефон скрыт]", measurement: "[скрыто без согласия]" },
  kz: { email: "[email жасырылды]", phone: "[телефон жасырылды]", measurement: "[келісімсіз жасырылды]" },
};

export function redactSensitiveSessionText(
  content: string,
  measurementConsent: boolean,
  locale: AILocale = "en",
): string {
  const labels = redactionCopy[locale];
  let safe = content
    .slice(0, 2_000)
    .replace(EMAIL_PATTERN, labels.email)
    .replace(PHONE_PATTERN, labels.phone);

  if (!measurementConsent) {
    const measurementLabel =
      /(рост|вес|груд(?:ь|и)?|тал(?:ия|ии)?|б[её]д(?:ра|ер|ро)?|бой|салмақ|кеуде|бел|жамбас|height|weight|chest|waist|hips?)/giu;
    safe = safe.replace(
      new RegExp(
        `${measurementLabel.source}\\s*[:=—-]?\\s*\\d{2,3}(?:[.,]\\d+)?\\s*(?:см|cm|кг|kg)?`,
        "giu",
      ),
      `$1: ${labels.measurement}`,
    );
    safe = safe.replace(
      /\b\d{2,3}(?:[.,]\d+)?\s*(?:см|cm|кг|kg)\b/giu,
      labels.measurement,
    );
  }
  return safe;
}

export function parseAIClientState(raw: string | null): AIClientState | null {
  if (!raw) return null;
  try {
    const parsed = StoredStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return {
      conversationId: parsed.data.conversationId,
      measurementConsent: parsed.data.measurementConsent,
      messages: parsed.data.messages,
    };
  } catch {
    return null;
  }
}

export function serializeAIClientState(state: AIClientState, locale: AILocale = "en"): string {
  const measurementConsent = state.measurementConsent === true;
  const messages = state.messages.slice(-30).map((message) => ({
    ...message,
    content: redactSensitiveSessionText(message.content, measurementConsent, locale),
    actions: message.actions?.map((action) => ({
      ...action,
      label: redactSensitiveSessionText(action.label, measurementConsent, locale).slice(0, 80),
      value: redactSensitiveSessionText(action.value, measurementConsent, locale).slice(0, 300),
    })),
  }));
  return JSON.stringify({
    version: 1,
    conversationId: state.conversationId,
    measurementConsent,
    messages,
  });
}
