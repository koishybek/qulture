export const DEFAULT_CONSENT_POLICY_VERSION = "2026-07-draft";

export function isDraftPolicyVersion(policyVersion: string): boolean {
  return /(^|[^a-z])draft([^a-z]|$)/i.test(policyVersion.trim());
}

type DraftPiiCaptureOptions = {
  policyVersion: string;
  nodeEnv?: string;
  explicitOptIn?: string;
};

export function canCapturePiiUnderPolicy({
  policyVersion,
  nodeEnv = process.env.NODE_ENV,
  explicitOptIn = process.env.QULTURE_ALLOW_DRAFT_PII_CAPTURE,
}: DraftPiiCaptureOptions): boolean {
  if (nodeEnv !== "production" || !isDraftPolicyVersion(policyVersion)) return true;
  return explicitOptIn === "1" || explicitOptIn?.toLowerCase() === "true";
}
