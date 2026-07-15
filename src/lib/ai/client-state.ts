import { z } from "zod";

import { AIActionSchema, type AIAction } from "@/lib/ai/schemas";

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

export function redactSensitiveSessionText(
  content: string,
  measurementConsent: boolean,
): string {
  let safe = content
    .slice(0, 2_000)
    .replace(EMAIL_PATTERN, "[email скрыт]")
    .replace(PHONE_PATTERN, "[телефон скрыт]");

  if (!measurementConsent) {
    const measurementLabel =
      /(рост|вес|груд(?:ь|и)?|тал(?:ия|ии)?|б[её]д(?:ра|ер|ро)?|бой|салмақ|кеуде|бел|жамбас|height|weight|chest|waist|hips?)/giu;
    safe = safe.replace(
      new RegExp(
        `${measurementLabel.source}\\s*[:=—-]?\\s*\\d{2,3}(?:[.,]\\d+)?\\s*(?:см|cm|кг|kg)?`,
        "giu",
      ),
      "$1: [скрыто без согласия]",
    );
    safe = safe.replace(
      /\b\d{2,3}(?:[.,]\d+)?\s*(?:см|cm|кг|kg)\b/giu,
      "[скрыто без согласия]",
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

export function serializeAIClientState(state: AIClientState): string {
  const measurementConsent = state.measurementConsent === true;
  const messages = state.messages.slice(-30).map((message) => ({
    ...message,
    content: redactSensitiveSessionText(message.content, measurementConsent),
    actions: message.actions?.map((action) => ({
      ...action,
      label: redactSensitiveSessionText(action.label, measurementConsent).slice(0, 80),
      value: redactSensitiveSessionText(action.value, measurementConsent).slice(0, 300),
    })),
  }));
  return JSON.stringify({
    version: 1,
    conversationId: state.conversationId,
    measurementConsent,
    messages,
  });
}
