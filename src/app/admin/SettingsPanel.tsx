"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings, type ActionState } from "@/app/admin/actions";
import type { SiteSettings, SocialLink } from "@/lib/settings";

const initialState: ActionState = {};

const fieldClass =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-base tracking-normal text-bone normal-case outline-none focus:border-ember";
const labelClass = "block text-xs uppercase tracking-[0.2em] text-ash";

export default function SettingsPanel({
  settings,
  onMessage,
}: {
  settings: SiteSettings;
  onMessage: (state: ActionState) => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveSettings,
    initialState,
  );
  const [socials, setSocials] = useState<SocialLink[]>(settings.socials);

  useEffect(() => {
    if (state.error || state.success) onMessage(state);
  }, [state, onMessage]);

  return (
    <form action={formAction} className="space-y-10">
      <section className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Ім&apos;я / нік
          <input
            name="name"
            defaultValue={settings.name}
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Роль
          <input
            name="role"
            defaultValue={settings.role}
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Локація
          <input
            name="location"
            defaultValue={settings.location}
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Email
          <input
            name="email"
            type="email"
            defaultValue={settings.email}
            className={fieldClass}
          />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Слоган на першому екрані
          <input
            name="tagline"
            defaultValue={settings.tagline}
            className={fieldClass}
          />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Опис для пошуку та соцмереж
          <textarea
            name="description"
            rows={2}
            defaultValue={settings.description}
            className={fieldClass}
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-bone normal-case sm:col-span-2">
          <input
            type="checkbox"
            name="available"
            defaultChecked={settings.available}
            className="size-4 accent-ember"
          />
          Показувати бейдж «Відкритий до нових проєктів»
        </label>
      </section>

      <section>
        <h3 className="border-b border-line pb-3 text-xs uppercase tracking-[0.25em] text-ash">
          Про мене
        </h3>

        <label className={`${labelClass} mt-5`}>
          Заголовок секції
          <input
            name="aboutHeading"
            defaultValue={settings.aboutHeading}
            className={fieldClass}
          />
        </label>

        <label className={`${labelClass} mt-5`}>
          Абзаци — по одному в рядку
          <textarea
            name="aboutParagraphs"
            rows={6}
            defaultValue={settings.aboutParagraphs.join("\n")}
            className={fieldClass}
          />
        </label>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Послуги — по одній у рядку
          <textarea
            name="services"
            rows={5}
            defaultValue={settings.services.join("\n")}
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Інструменти — по одному в рядку
          <textarea
            name="tools"
            rows={5}
            defaultValue={settings.tools.join("\n")}
            className={fieldClass}
          />
        </label>
      </section>

      <section>
        <h3 className="border-b border-line pb-3 text-xs uppercase tracking-[0.25em] text-ash">
          Соцмережі
        </h3>

        <ul className="mt-5 space-y-3">
          {socials.map((social, index) => (
            <li key={index} className="flex flex-wrap items-end gap-3">
              <label className={`${labelClass} w-40`}>
                Назва
                <input
                  name="social-label"
                  defaultValue={social.label}
                  className={fieldClass}
                />
              </label>

              <label className={`${labelClass} min-w-56 flex-1`}>
                Посилання
                <input
                  name="social-href"
                  type="url"
                  defaultValue={social.href}
                  className={fieldClass}
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setSocials((prev) => prev.filter((_, i) => i !== index))
                }
                className="rounded-full border border-line px-4 py-2 text-sm transition hover:border-ember hover:text-ember"
              >
                Прибрати
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() =>
            setSocials((prev) => [...prev, { label: "", href: "" }])
          }
          className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm transition hover:border-ember hover:text-ember"
        >
          Додати соцмережу
        </button>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition hover:bg-ember disabled:opacity-50"
      >
        {pending ? "Зберігаю…" : "Зберегти тексти"}
      </button>
    </form>
  );
}
