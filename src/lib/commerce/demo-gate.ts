export const DEMO_QUERY_VALUE = "1";

export function isDemoCommerceRequested(
  value: string | string[] | undefined,
  settingsDemoMode = false,
): boolean {
  const queryEnabled = Array.isArray(value)
    ? value.includes(DEMO_QUERY_VALUE)
    : value === DEMO_QUERY_VALUE;

  return (
    (process.env.NODE_ENV !== "production" && queryEnabled) ||
    process.env.QULTURE_DEMO_COMMERCE === "1" ||
    (process.env.NODE_ENV !== "production" && settingsDemoMode)
  );
}

export function isDemoOrderApiEnabled(): boolean {
  return process.env.NODE_ENV !== "production" ||
    process.env.QULTURE_DEMO_COMMERCE === "1";
}

export function canPersistDemoModeSetting(): boolean {
  return process.env.NODE_ENV !== "production" ||
    process.env.QULTURE_DEMO_COMMERCE === "1";
}
