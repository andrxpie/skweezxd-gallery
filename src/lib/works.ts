import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import sharp from "sharp";
import { isStorageConfigured, readDocument } from "@/lib/storage";

export type Work = {
  /** Стабільний ідентифікатор: ключ у сховищі або ім'я локального файлу */
  id: string;
  /** Публічний URL зображення */
  src: string;
  /** Ключ обʼєкта у сховищі; null для файлів із public/works */
  pathname: string | null;
  /**
   * Альбом, до якого належить робота. Відсутнє поле — робота ще не розподілена
   * (у старих записах його немає зовсім), тож публічно вона не показується.
   */
  albumId?: string | null;
  width: number;
  height: number;
  /** Підпис під роботою */
  title: string;
  /** Крихітний розмитий прев'ю-варіант, щоб не було порожніх прямокутників при завантаженні */
  blurDataURL: string;
};

export const WORKS_DOCUMENT = "works";

const WORKS_DIR = path.join(process.cwd(), "public", "works");

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

export function isSupportedImage(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/**
 * "01-brand-identity.jpg" -> "Brand identity"
 * Числовий префікс керує порядком у галереї і в підпис не потрапляє.
 */
export function titleFromFilename(filename: string): string {
  const base = path
    .basename(filename, path.extname(filename))
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[._-]+/g, " ")
    .trim();

  if (!base) return "Без назви";

  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Рахує розміри та blur-прев'ю один раз — при завантаженні роботи. Далі вони
 * живуть у маніфесті, тож рендер головної не торкається самих зображень.
 */
export async function buildImageMeta(input: Buffer): Promise<{
  width: number;
  height: number;
  blurDataURL: string;
}> {
  const image = sharp(input);
  const { width, height } = await image.metadata();

  if (!width || !height) {
    throw new Error("Не вдалося визначити розміри зображення");
  }

  const blurBuffer = await image
    .clone()
    .resize(16, null, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    width,
    height,
    blurDataURL: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
  };
}

/**
 * Резервний режим: поки сховище не налаштоване, галерея читає public/works —
 * так проєкт працює одразу після клонування й у локальній розробці.
 */
async function readWorksFromDisk(): Promise<Work[]> {
  let filenames: string[];

  try {
    filenames = await fs.readdir(WORKS_DIR);
  } catch {
    return [];
  }

  const candidates = filenames
    .filter(isSupportedImage)
    .sort((a, b) => a.localeCompare(b, "uk", { numeric: true }));

  const works = await Promise.all(
    candidates.map(async (filename): Promise<Work | null> => {
      try {
        const meta = await buildImageMeta(
          await fs.readFile(path.join(WORKS_DIR, filename)),
        );

        return {
          id: filename,
          src: `/works/${encodeURIComponent(filename)}`,
          pathname: null,
          title: titleFromFilename(filename),
          ...meta,
        };
      } catch {
        // Пошкоджений або нечитабельний файл не має ламати збірку всього сайту.
        console.warn(`[works] не вдалося прочитати ${filename} — пропускаю`);
        return null;
      }
    }),
  );

  return works.filter((work): work is Work => work !== null);
}

export const getWorks = cache(async (): Promise<Work[]> => {
  if (isStorageConfigured()) {
    // null означає, що маніфеста ще немає — Роман не зберіг жодної зміни, тож
    // лишаємо демо з диска. Порожній масив — це вже свідомо порожня галерея.
    const stored = await readDocument<Work[]>(WORKS_DOCUMENT);
    if (stored) return stored;
  }

  return readWorksFromDisk();
});
