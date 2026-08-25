import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import sharp from "sharp";

export type Work = {
  /** Публічний шлях, напр. "/works/01-poster.jpg" */
  src: string;
  width: number;
  height: number;
  /** Підпис під роботою, виведений з імені файлу */
  title: string;
  /** Крихітний розмитий прев'ю-варіант, щоб не було порожніх прямокутників при завантаженні */
  blurDataURL: string;
};

const WORKS_DIR = path.join(process.cwd(), "public", "works");

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

/**
 * "01-brand-identity.jpg" -> "Brand identity"
 * Числовий префікс керує порядком у галереї і в підпис не потрапляє.
 */
function titleFromFilename(filename: string): string {
  const base = path
    .basename(filename, path.extname(filename))
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[._-]+/g, " ")
    .trim();

  if (!base) return "Без назви";

  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function readWork(filename: string): Promise<Work | null> {
  const filePath = path.join(WORKS_DIR, filename);

  try {
    const image = sharp(filePath);
    const { width, height } = await image.metadata();

    if (!width || !height) return null;

    const blurBuffer = await image
      .clone()
      .resize(16, null, { fit: "inside" })
      .webp({ quality: 40 })
      .toBuffer();

    return {
      src: `/works/${encodeURIComponent(filename)}`,
      width,
      height,
      title: titleFromFilename(filename),
      blurDataURL: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
    };
  } catch {
    // Пошкоджений або нечитабельний файл не має ламати збірку всього сайту.
    console.warn(`[works] не вдалося прочитати ${filename} — пропускаю`);
    return null;
  }
}

/**
 * Читає всі зображення з public/works. Щоб додати роботу — просто поклади файл
 * у цю папку; порядок задається числовим префіксом в імені.
 */
export const getWorks = cache(async (): Promise<Work[]> => {
  let filenames: string[];

  try {
    filenames = await fs.readdir(WORKS_DIR);
  } catch {
    return [];
  }

  const candidates = filenames
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "uk", { numeric: true }));

  const works = await Promise.all(candidates.map(readWork));

  return works.filter((work): work is Work => work !== null);
});
