"use client";

import { useState, type FormEvent } from "react";

export function AdminLogin({ disabled }: { disabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || pending) return;
    setPending(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error("login_failed");
      window.location.reload();
    } catch {
      setError("Доступ не подтверждён. Проверьте пароль или конфигурацию.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={login}>
        <p className="q-meta">QULTURE / CONTROL ROOM</p>
        <h1>ADMIN</h1>
        {disabled ? (
          <div className="admin-notice" role="status">
            <strong>Admin отключён.</strong>
            <p>
              Добавьте ADMIN_PASSWORD и SESSION_SECRET в локальное окружение, затем
              перезапустите сервер.
            </p>
          </div>
        ) : (
          <>
            <label className="q-field" htmlFor="admin-password">
              <span>Пароль</span>
              <input
                autoComplete="current-password"
                className="q-input"
                id="admin-password"
                name="password"
                required
                type="password"
              />
            </label>
            <button className="q-button q-button--solid" disabled={pending} type="submit">
              {pending ? "Проверяем…" : "Войти →"}
            </button>
          </>
        )}
        <p aria-live="assertive" className="q-status" data-kind="error">
          {error}
        </p>
      </form>
    </main>
  );
}
