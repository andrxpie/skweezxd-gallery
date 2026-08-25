"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-line bg-surface p-8"
      >
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Адмінка
        </h1>
        <p className="mt-2 text-sm text-ash">
          Введи пароль, щоб керувати галереєю.
        </p>

        <label className="mt-8 block text-xs uppercase tracking-[0.2em] text-ash">
          Пароль
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
            className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-base tracking-normal text-bone normal-case outline-none focus:border-ember"
          />
        </label>

        {state.error && (
          <p role="alert" className="mt-4 text-sm text-ember">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition hover:bg-ember disabled:opacity-50"
        >
          {pending ? "Заходжу…" : "Увійти"}
        </button>
      </form>
    </div>
  );
}
