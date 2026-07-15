import Link from "next/link";

export default function NotFound() {
  return (
    <main className="q-page">
      <div className="q-page-header">
        <h1 className="q-display q-display--medium">404</h1>
        <p className="q-lead">Страница не найдена или ещё не опубликована.</p>
      </div>
      <div className="q-page-body">
        <Link className="q-button" href="/ru">
          Вернуться на главную <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}

