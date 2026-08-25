"use server";

import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { deleteBlob, isBlobConfigured, writeDocument } from "@/lib/blob-store";
import {
  SETTINGS_DOCUMENT,
  getSettings,
  type SiteSettings,
  type SocialLink,
} from "@/lib/settings";
import {
  WORKS_DOCUMENT,
  buildImageMeta,
  getWorks,
  titleFromFilename,
  type Work,
} from "@/lib/works";

export type ActionState = { error?: string; success?: string };

/** Оновлюємо і головну, і саму адмінку: обидві читають ті самі документи. */
function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/admin");
}

function requireBlob() {
  if (!isBlobConfigured()) {
    throw new Error(
      "Сховище не налаштоване. Створи Blob store у Vercel і зроби редеплой.",
    );
  }
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Щось пішло не так";
}

async function saveWorks(works: Work[]): Promise<void> {
  await writeDocument(WORKS_DOCUMENT, works);
  revalidateSite();
}

export async function login(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");

  if (!password) return { error: "Введи пароль" };
  if (!verifyPassword(password)) return { error: "Невірний пароль" };

  await createSession();
  revalidatePath("/admin");
  return {};
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath("/admin");
}

/**
 * Викликається після того, як браузер завантажив файл у Blob: дочитуємо байти,
 * рахуємо розміри й blur, додаємо запис у маніфест.
 */
export async function finalizeUpload(
  url: string,
  pathname: string,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    if (!pathname.startsWith("works/")) {
      return { error: "Некоректний шлях файлу" };
    }

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return { error: "Не вдалося прочитати завантажений файл" };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const meta = await buildImageMeta(buffer);

    const works = await getWorks();
    const work: Work = {
      id: pathname,
      src: url,
      pathname,
      title: titleFromFilename(pathname.slice("works/".length)),
      ...meta,
    };

    await saveWorks([...works, work]);
    return { success: `Додано: ${work.title}` };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function deleteWork(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const works = await getWorks();
    const target = works.find((work) => work.id === id);
    if (!target) return { error: "Роботу не знайдено" };

    await saveWorks(works.filter((work) => work.id !== id));

    // Сам файл прибираємо після маніфесту: якщо видалення впаде, у галереї
    // вже не буде посилання на нього, лишиться тільки сирота у сховищі.
    if (target.pathname) {
      await deleteBlob(target.pathname).catch((error) => {
        console.warn("[works] не вдалося видалити файл зі сховища", error);
      });
    }

    return { success: "Роботу видалено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function updateWorkTitle(
  id: string,
  title: string,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const trimmed = title.trim();
    if (!trimmed) return { error: "Підпис не може бути порожнім" };

    const works = await getWorks();
    if (!works.some((work) => work.id === id)) {
      return { error: "Роботу не знайдено" };
    }

    await saveWorks(
      works.map((work) => (work.id === id ? { ...work, title: trimmed } : work)),
    );

    return { success: "Підпис збережено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function moveWork(
  id: string,
  direction: -1 | 1,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const works = await getWorks();
    const index = works.findIndex((work) => work.id === id);
    if (index === -1) return { error: "Роботу не знайдено" };

    const target = index + direction;
    if (target < 0 || target >= works.length) return {};

    const reordered = [...works];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    await saveWorks(reordered);
    return { success: "Порядок оновлено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

/** Багаторядкове поле -> масив непорожніх рядків. */
function parseLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSocials(formData: FormData): SocialLink[] {
  const labels = formData.getAll("social-label").map(String);
  const hrefs = formData.getAll("social-href").map(String);

  return labels
    .map((label, index) => ({
      label: label.trim(),
      href: (hrefs[index] ?? "").trim(),
    }))
    .filter((social) => social.label && social.href);
}

export async function saveSettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const current = await getSettings();
    const text = (key: string, fallback: string) =>
      String(formData.get(key) ?? "").trim() || fallback;

    const settings: SiteSettings = {
      ...current,
      name: text("name", current.name),
      role: text("role", current.role),
      location: text("location", current.location),
      tagline: text("tagline", current.tagline),
      description: text("description", current.description),
      email: text("email", current.email),
      available: formData.get("available") === "on",
      aboutHeading: text("aboutHeading", current.aboutHeading),
      aboutParagraphs: parseLines(formData.get("aboutParagraphs")),
      services: parseLines(formData.get("services")),
      tools: parseLines(formData.get("tools")),
      socials: parseSocials(formData),
    };

    await writeDocument(SETTINGS_DOCUMENT, settings);
    revalidateSite();

    return { success: "Тексти збережено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}
