"use client";

export function CookiePreferencesButton({ label }: { label: string }) {
  return (
    <button
      className="q-button q-button--solid"
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("qulture:cookie-settings"))}
    >
      {label}
    </button>
  );
}
