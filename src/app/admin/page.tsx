import type { Metadata } from "next";
import AdminDashboard from "@/app/admin/AdminDashboard";
import LoginForm from "@/app/admin/LoginForm";
import { isAdminConfigured, isAuthenticated } from "@/lib/auth";
import { isBlobConfigured } from "@/lib/blob-store";
import { getSettings } from "@/lib/settings";
import { getWorks } from "@/lib/works";

export const metadata: Metadata = {
  title: "Адмінка",
  robots: { index: false, follow: false },
};

/**
 * Перевірка сесії має виконуватись на кожен запит. Без цього Next може
 * пререндерити сторінку на етапі збірки й віддавати закешовану гілку.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Адмінка не налаштована
        </h1>
        <p className="mt-4 leading-relaxed text-ash">
          Додай змінну оточення{" "}
          <code className="text-bone">ADMIN_PASSWORD</code> у налаштуваннях
          проєкту на Vercel (Settings → Environment Variables) і зроби редеплой.
          Це пароль для входу сюди.
        </p>
      </div>
    );
  }

  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  const [works, settings] = await Promise.all([getWorks(), getSettings()]);

  return (
    <AdminDashboard
      works={works}
      settings={settings}
      blobReady={isBlobConfigured()}
    />
  );
}
