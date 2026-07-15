"use client";

import { usePathname } from "next/navigation";
import { localeFromPath, type Locale } from "@/lib/i18n";

const copy: Record<Locale, { title: string; body: string; action: string }> = {
  en: {
    title: "Something went wrong",
    body: "The page could not be loaded. Purchases and forms are protected from duplicate submission.",
    action: "Try again safely",
  },
  ru: {
    title: "Что-то пошло не так",
    body: "Контент не загрузился. Покупка и формы защищены от повторной отправки.",
    action: "Повторить безопасно",
  },
  kz: {
    title: "Бірдеңе дұрыс болмады",
    body: "Бет жүктелмеді. Сатып алу мен формалар қайталап жіберуден қорғалған.",
    action: "Қауіпсіз қайталау",
  },
};

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = localeFromPath(usePathname());
  const text = copy[locale];

  return (
    <main className="q-page">
      <div className="q-page-header">
        <h1 className="q-heading">{text.title}</h1>
        <p className="q-lead">{text.body}</p>
      </div>
      <div className="q-page-body">
        <button className="q-button" type="button" onClick={reset}>
          {text.action} <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}
