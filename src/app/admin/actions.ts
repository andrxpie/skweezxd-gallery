"use server";

import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import {
  ALBUMS_DOCUMENT,
  getAlbums,
  worksOfAlbum,
  type Album,
} from "@/lib/albums";
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

/**
 * Скидаємо кеш усіх сторінок, які читають ці документи: головна, адмінка
 * і сторінки альбомів. "layout" охоплює вкладені маршрути на кшталт /album/*.
 */
function revalidateSite() {
  revalidatePath("/", "layout");
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

async function saveAlbums(albums: Album[]): Promise<void> {
  await writeDocument(ALBUMS_DOCUMENT, albums);
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
  albumId: string | null = null,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    if (!pathname.startsWith("works/")) {
      return { error: "Некоректний шлях файлу" };
    }

    // Альбом міг зникнути, поки тривало завантаження — тоді робота просто
    // лишається нерозподіленою, а не посилається в нікуди.
    const albums = await getAlbums();
    const targetAlbum =
      albumId && albums.some((album) => album.id === albumId) ? albumId : null;

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
      albumId: targetAlbum,
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

export async function setWorkAlbum(
  id: string,
  albumId: string | null,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    if (albumId) {
      const albums = await getAlbums();
      if (!albums.some((album) => album.id === albumId)) {
        return { error: "Альбом не знайдено" };
      }
    }

    const works = await getWorks();
    if (!works.some((work) => work.id === id)) {
      return { error: "Роботу не знайдено" };
    }

    await saveWorks(
      works.map((work) => (work.id === id ? { ...work, albumId } : work)),
    );

    return { success: albumId ? "Роботу перенесено" : "Роботу знято з альбому" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function createAlbum(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Введи назву альбому" };

    const albums = await getAlbums();
    const album: Album = { id: crypto.randomUUID(), title, coverId: null };

    await saveAlbums([...albums, album]);
    return { success: `Альбом «${title}» створено` };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function renameAlbum(
  id: string,
  title: string,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const trimmed = title.trim();
    if (!trimmed) return { error: "Назва не може бути порожньою" };

    const albums = await getAlbums();
    if (!albums.some((album) => album.id === id)) {
      return { error: "Альбом не знайдено" };
    }

    await saveAlbums(
      albums.map((album) =>
        album.id === id ? { ...album, title: trimmed } : album,
      ),
    );

    return { success: "Назву збережено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function setAlbumCover(
  id: string,
  coverId: string | null,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const albums = await getAlbums();
    const album = albums.find((item) => item.id === id);
    if (!album) return { error: "Альбом не знайдено" };

    if (coverId) {
      const works = await getWorks();
      const belongs = worksOfAlbum(id, works).some((work) => work.id === coverId);
      if (!belongs) return { error: "Обкладинкою може бути робота з цього альбому" };
    }

    await saveAlbums(
      albums.map((item) => (item.id === id ? { ...item, coverId } : item)),
    );

    return { success: "Обкладинку оновлено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

export async function moveAlbum(
  id: string,
  direction: -1 | 1,
): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const albums = await getAlbums();
    const index = albums.findIndex((album) => album.id === id);
    if (index === -1) return { error: "Альбом не знайдено" };

    const target = index + direction;
    if (target < 0 || target >= albums.length) return {};

    const reordered = [...albums];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];

    await saveAlbums(reordered);
    return { success: "Порядок оновлено" };
  } catch (error) {
    return { error: toMessage(error) };
  }
}

/**
 * Видаляє альбом, але не роботи — вони стають нерозподіленими й зникають із
 * сайту, лишаючись в адмінці. Так випадковий клік не знищує файли.
 */
export async function deleteAlbum(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    requireBlob();

    const albums = await getAlbums();
    if (!albums.some((album) => album.id === id)) {
      return { error: "Альбом не знайдено" };
    }

    const works = await getWorks();
    const released = works.filter((work) => work.albumId === id);

    if (released.length > 0) {
      await saveWorks(
        works.map((work) =>
          work.albumId === id ? { ...work, albumId: null } : work,
        ),
      );
    }

    await saveAlbums(albums.filter((album) => album.id !== id));

    return {
      success:
        released.length > 0
          ? `Альбом видалено, робіт знято з публікації: ${released.length}`
          : "Альбом видалено",
    };
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
