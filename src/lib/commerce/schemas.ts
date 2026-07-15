import { z } from "zod";

const trimmed = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const checkoutLineSchema = z.object({
  variantId: trimmed(1, 100),
  quantity: z.number().int().min(1).max(5),
  bundleGroupId: trimmed(1, 100).optional(),
});

export const demoOrderRequestSchema = z.object({
  locale: z.enum(["en", "ru", "kz"]),
  idempotencyKey: trimmed(8, 200).optional(),
  customer: z.object({
    name: trimmed(2, 100),
    email: z.string().trim().email().max(254),
    phone: trimmed(7, 32).regex(/^[+\d][\d\s()+-]+$/),
  }),
  delivery: z.object({
    city: trimmed(2, 80),
    address: trimmed(5, 240),
    method: z.literal("mock_courier"),
    comment: z.string().trim().max(500).optional().default(""),
  }),
  paymentMethod: z.literal("development_mock"),
  termsAccepted: z.literal(true),
  serviceConsent: z.literal(true),
  marketingConsent: z.boolean().optional().default(false),
  lines: z.array(checkoutLineSchema).min(1).max(8),
});

export type DemoOrderRequest = z.infer<typeof demoOrderRequestSchema>;

export const demoOrderResponseSchema = z.object({
  orderNumber: z.string(),
  statusToken: z.string(),
  total: z.number().int().nonnegative(),
  currency: z.literal("KZT"),
  status: z.literal("CONFIRMED"),
  paymentStatus: z.literal("PAID"),
});

export type DemoOrderResponse = z.infer<typeof demoOrderResponseSchema>;
