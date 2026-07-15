type SafeLogFields = {
  correlationId?: string;
  event?: string;
  tool?: string;
  status?: string;
  durationMs?: number;
  providerRequestId?: string;
  rounds?: number;
};

function safeField(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  return value.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, maxLength);
}

/**
 * Logs only an explicit allowlist of operational metadata. User content, tool
 * arguments, contacts, environment variables, and provider credentials must
 * never be passed to this function.
 */
export function logAIEvent(
  level: "info" | "warn" | "error",
  fields: SafeLogFields,
): void {
  const payload = {
    scope: "qulture_ai",
    correlationId: safeField(fields.correlationId, 80),
    event: safeField(fields.event, 80),
    tool: safeField(fields.tool, 40),
    status: safeField(fields.status, 40),
    durationMs:
      typeof fields.durationMs === "number" && Number.isFinite(fields.durationMs)
        ? Math.max(0, Math.round(fields.durationMs))
        : undefined,
    providerRequestId: safeField(fields.providerRequestId, 100),
    rounds: fields.rounds,
  };

  const write = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  write(JSON.stringify(payload));
}
