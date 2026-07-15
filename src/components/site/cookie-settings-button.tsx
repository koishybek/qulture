"use client";

export function CookieSettingsButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("qulture:cookie-settings"))}>
      {children}
    </button>
  );
}

