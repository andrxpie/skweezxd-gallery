import { del, list, put } from "@vercel/blob";

/**
 * JSON-документи (список робіт, тексти сайту) зберігаються у Vercel Blob як
 * версії: кожне збереження створює новий файл з випадковим суфіксом, а старі
 * видаляються. Завдяки унікальним URL вміст незмінний, тож CDN не віддає
 * застарілу версію — типова проблема, якщо перезаписувати один і той самий шлях.
 */
const DOCUMENT_DIR = "data";

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function documentPath(name: string): string {
  return `${DOCUMENT_DIR}/${name}.json`;
}

/**
 * Без завершального дефіса: так префікс збігається з будь-яким форматом
 * випадкового суфікса, який додасть Blob. Імена документів між собою не
 * перетинаються, тож зайвого не зачепить.
 */
function documentPrefix(name: string): string {
  return `${DOCUMENT_DIR}/${name}`;
}

export async function readDocument<T>(name: string): Promise<T | null> {
  if (!isBlobConfigured()) return null;

  try {
    const { blobs } = await list({ prefix: documentPrefix(name), limit: 100 });
    if (blobs.length === 0) return null;

    const latest = blobs.reduce((newest, blob) =>
      blob.uploadedAt > newest.uploadedAt ? blob : newest,
    );

    const response = await fetch(latest.url, { cache: "force-cache" });
    if (!response.ok) return null;

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[blob] не вдалося прочитати документ "${name}"`, error);
    return null;
  }
}

export async function writeDocument<T>(name: string, data: T): Promise<void> {
  if (!isBlobConfigured()) {
    throw new Error("Сховище не налаштоване: немає BLOB_READ_WRITE_TOKEN");
  }

  // Список старих версій беремо до запису, щоб не видалити щойно створену.
  const { blobs: previous } = await list({
    prefix: documentPrefix(name),
    limit: 100,
  });

  await put(documentPath(name), JSON.stringify(data), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });

  if (previous.length > 0) {
    await del(previous.map((blob) => blob.url)).catch((error) => {
      console.warn(`[blob] не вдалося прибрати старі версії "${name}"`, error);
    });
  }
}

export async function deleteBlob(pathname: string): Promise<void> {
  if (!isBlobConfigured()) return;
  await del(pathname);
}
