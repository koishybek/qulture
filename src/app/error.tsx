"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="q-page">
      <div className="q-page-header">
        <h1 className="q-heading">Что-то пошло не так</h1>
        <p className="q-lead">Контент не загрузился. Покупка и формы защищены от повторной отправки.</p>
      </div>
      <div className="q-page-body">
        <button className="q-button" type="button" onClick={reset}>
          Повторить безопасно <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}

