import { createHash } from "node:crypto";

import { z } from "zod";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().toLowerCase().email().max(254).optional(),
);

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}

const optionalPhone = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((value) => /^\+?\d{7,15}$/.test(value), "Enter a valid phone number")
    .optional(),
);

export const waitlistContactPurposeSchema = z.enum([
  "LAUNCH",
  "RESTOCK",
  "PRODUCT_UPDATES",
  "QUESTION",
]);

export const waitlistInputSchema = z
  .object({
    productId: optionalText(80),
    variantId: optionalText(80),
    color: optionalText(80),
    size: optionalText(40),
    city: z.string().trim().min(2).max(120),
    name: z.string().trim().min(2).max(120),
    email: optionalEmail,
    phone: optionalPhone,
    contactPurpose: waitlistContactPurposeSchema,
    serviceConsent: z.literal(true, {
      error: "Service consent is required to process this request",
    }),
    restockConsent: z.boolean().default(false),
    marketingConsent: z.boolean().default(false),
    policyVersion: z.string().trim().min(1).max(80),
    language: z.enum(["RU", "KZ", "EN"]),
    source: z.string().trim().min(1).max(120).default("website"),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email or phone is required",
      });
    }

    if (value.contactPurpose === "RESTOCK" && !value.restockConsent) {
      context.addIssue({
        code: "custom",
        path: ["restockConsent"],
        message: "Restock consent is required for restock notifications",
      });
    }
  });

export type WaitlistInput = z.input<typeof waitlistInputSchema>;
export type ValidatedWaitlistInput = z.output<typeof waitlistInputSchema>;

function normalizedDedupPart(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export function createWaitlistDedupKey(input: ValidatedWaitlistInput): string {
  const contact = input.email ?? input.phone ?? "";
  const identity = [
    normalizedDedupPart(contact),
    normalizedDedupPart(input.productId),
    normalizedDedupPart(input.variantId),
    normalizedDedupPart(input.color),
    normalizedDedupPart(input.size),
    input.contactPurpose,
  ].join("|");

  return createHash("sha256").update(identity).digest("hex");
}

export function parseWaitlistInput(input: unknown): ValidatedWaitlistInput & { dedupKey: string } {
  const parsed = waitlistInputSchema.parse(input);
  return { ...parsed, dedupKey: createWaitlistDedupKey(parsed) };
}
