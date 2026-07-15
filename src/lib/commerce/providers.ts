import { randomBytes } from "node:crypto";

export type ProviderReadiness = {
  kind: "payment" | "delivery" | "address" | "fiscal";
  configured: boolean;
  provider: string | null;
  reason: "missing_configuration" | "adapter_not_implemented" | null;
};

export type PaymentAuthorization = {
  provider: string;
  reference: string;
  status: "AUTHORIZED" | "PAID" | "DECLINED";
};

export type PaymentRequest = {
  amountMinor: number;
  currency: "KZT";
  orderReference: string;
  idempotencyKey: string;
  isTest: boolean;
};

export interface PaymentProvider {
  readonly name: string;
  authorize(request: PaymentRequest): Promise<PaymentAuthorization>;
}

export type DeliveryQuoteRequest = {
  city: string;
  address: string;
  postalCode?: string;
  weightGrams?: number;
};

export type DeliveryQuote = {
  provider: string;
  serviceCode: string;
  amountMinor: number;
  currency: "KZT";
  estimatedDays: { min: number; max: number } | null;
};

export interface DeliveryProvider {
  readonly name: string;
  quote(request: DeliveryQuoteRequest): Promise<DeliveryQuote[]>;
}

export type NormalizedAddress = {
  city: string;
  address: string;
  postalCode?: string;
  providerReference?: string;
};

export interface AddressProvider {
  readonly name: string;
  normalize(input: DeliveryQuoteRequest): Promise<NormalizedAddress>;
}

export type FiscalReceiptRequest = {
  orderNumber: string;
  paymentReference: string;
  totalMinor: number;
  currency: "KZT";
};

export interface FiscalProvider {
  readonly name: string;
  issueReceipt(request: FiscalReceiptRequest): Promise<{ reference: string }>;
}

/** Test-only adapter. It refuses non-test requests so it cannot accidentally
 * become a production payment integration. */
export const developmentMockPaymentProvider: PaymentProvider = {
  name: "development_mock",
  async authorize(request) {
    if (!request.isTest) {
      throw new Error("The development payment adapter is test-only.");
    }
    if (request.amountMinor <= 0 || request.currency !== "KZT") {
      throw new Error("A positive KZT amount is required.");
    }
    return {
      provider: this.name,
      reference: `mock_${randomBytes(12).toString("hex")}`,
      status: "PAID",
    };
  },
};

function readiness(
  kind: ProviderReadiness["kind"],
  configuredName: string | undefined,
): ProviderReadiness {
  const provider = configuredName?.trim() || null;
  return {
    kind,
    configured: false,
    provider,
    reason: provider ? "adapter_not_implemented" : "missing_configuration",
  };
}

/** Public production checkout remains closed until concrete, reviewed adapters
 * are registered. Environment labels alone never mark an integration ready. */
export function getProductionCommerceReadiness(): ProviderReadiness[] {
  return [
    readiness("payment", process.env.PAYMENT_PROVIDER),
    readiness("delivery", process.env.DELIVERY_PROVIDER),
    readiness("address", process.env.ADDRESS_PROVIDER),
    readiness("fiscal", process.env.FISCAL_PROVIDER),
  ];
}

export function isProductionCommerceReady(
  states = getProductionCommerceReadiness(),
): boolean {
  return states.every((state) => state.configured);
}
