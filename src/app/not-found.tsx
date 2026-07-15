import Link from "next/link";
import { headers } from "next/headers";
import { DOCUMENT_LANGUAGE_HEADER, parseDocumentLanguage } from "@/lib/i18n/document-language";

const copy = {
  en: { body: "This page is not available or has not been published yet.", action: "Back to home" },
  ru: { body: "Страница не найдена или ещё не опубликована.", action: "Вернуться на главную" },
  kz: { body: "Бұл бет табылмады немесе әлі жарияланбаған.", action: "Басты бетке оралу" },
} as const;

export default async function NotFound() {
  const documentLanguage = parseDocumentLanguage((await headers()).get(DOCUMENT_LANGUAGE_HEADER));
  const locale = documentLanguage === "kk" ? "kz" : documentLanguage;
  const text = copy[locale];

  return (
    <main className="q-page">
      <div className="q-page-header">
        <h1 className="q-display q-display--medium">404</h1>
        <p className="q-lead">{text.body}</p>
      </div>
      <div className="q-page-body">
        <Link className="q-button" href={`/${locale}`}>
          {text.action} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
