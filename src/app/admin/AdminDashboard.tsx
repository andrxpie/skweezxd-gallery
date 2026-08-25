"use client";

import { useCallback, useState } from "react";
import { logout, type ActionState } from "@/app/admin/actions";
import SettingsPanel from "@/app/admin/SettingsPanel";
import WorksPanel from "@/app/admin/WorksPanel";
import type { SiteSettings } from "@/lib/settings";
import type { Work } from "@/lib/works";

type Tab = "works" | "texts";

export default function AdminDashboard({
  works,
  settings,
  blobReady,
}: {
  works: Work[];
  settings: SiteSettings;
  blobReady: boolean;
}) {
  const [tab, setTab] = useState<Tab>("works");
  const [message, setMessage] = useState<ActionState>({});

  const handleMessage = useCallback((state: ActionState) => {
    setMessage(state);
  }, []);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "works", label: "Роботи" },
    { id: "texts", label: "Тексти" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Адмінка
          </h1>
          <p className="mt-1 text-sm text-ash">
            Зміни з&apos;являються на сайті одразу.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-5 py-2.5 text-sm transition hover:border-ember hover:text-ember"
          >
            Відкрити сайт ↗
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-line px-5 py-2.5 text-sm transition hover:border-ember hover:text-ember"
            >
              Вийти
            </button>
          </form>
        </div>
      </header>

      {!blobReady && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-ember/40 bg-ember/5 px-5 py-4 text-sm"
        >
          Сховище не налаштоване, тому зміни зберегти не вийде. Створи Blob
          store у Vercel (Storage → Create Blob store) і підключи його до цього
          проєкту. Зараз показано демо-роботи з коду.
        </p>
      )}

      <nav className="mt-8 flex gap-2" aria-label="Розділи адмінки">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => {
              setTab(item.id);
              setMessage({});
            }}
            className={`rounded-full px-5 py-2.5 text-sm transition ${
              tab === item.id
                ? "bg-bone text-ink"
                : "border border-line text-ash hover:text-bone"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {(message.error || message.success) && (
        <p
          role="status"
          className={`mt-6 rounded-md border px-5 py-3 text-sm ${
            message.error
              ? "border-ember/40 bg-ember/5 text-ember"
              : "border-line bg-surface text-ash"
          }`}
        >
          {message.error ?? message.success}
        </p>
      )}

      <div className="mt-8">
        {tab === "works" ? (
          <WorksPanel works={works} onMessage={handleMessage} />
        ) : (
          <SettingsPanel settings={settings} onMessage={handleMessage} />
        )}
      </div>
    </div>
  );
}
