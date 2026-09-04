import { AwsClient } from "aws4fetch";

/**
 * Сховище — Cloudflare R2 через S3-сумісний API.
 *
 * Документи (список робіт, альбоми, тексти) лежать на фіксованих ключах і
 * просто перезаписуються. Версіонування, яке було в реалізації на Vercel Blob,
 * тут не потрібне: воно існувало лише щоб обійти CDN-кеш при перезаписі шляху,
 * а читання з S3-API строго консистентні й повз CDN не йдуть.
 */
const DOCUMENT_DIR = "data";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

function readConfig(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBaseUrl
  ) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
  };
}

export function isStorageConfigured(): boolean {
  return readConfig() !== null;
}

function requireConfig(): R2Config {
  const config = readConfig();
  if (!config) {
    throw new Error(
      "Сховище не налаштоване: бракує змінних оточення R2_* (див. README).",
    );
  }
  return config;
}

let cached: { accessKeyId: string; client: AwsClient } | null = null;

function client(config: R2Config): AwsClient {
  // service/region задаємо явно: за хостом r2.cloudflarestorage.com
  // aws4fetch їх не вгадує, а без service === "s3" ще й неправильно
  // кодує шлях для ключів із не-ASCII символами.
  if (cached?.accessKeyId !== config.accessKeyId) {
    cached = {
      accessKeyId: config.accessKeyId,
      client: new AwsClient({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        service: "s3",
        region: "auto",
      }),
    };
  }
  return cached.client;
}

function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

function objectUrl(config: R2Config, key: string): string {
  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${encodeKey(key)}`;
}

/** Публічна адреса файлу — через Public Development URL бакета. */
export function publicUrl(key: string): string {
  return `${requireConfig().publicBaseUrl}/${encodeKey(key)}`;
}

export function documentKey(name: string): string {
  return `${DOCUMENT_DIR}/${name}.json`;
}

export async function readDocument<T>(name: string): Promise<T | null> {
  const config = readConfig();
  if (!config) return null;

  try {
    const response = await client(config).fetch(
      objectUrl(config, documentKey(name)),
    );

    // Документа ще немає — це нормальний стан для щойно створеного бакета.
    if (response.status === 404) return null;

    if (!response.ok) {
      console.error(`[r2] читання "${name}" повернуло ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[r2] не вдалося прочитати документ "${name}"`, error);
    return null;
  }
}

export async function writeDocument<T>(name: string, data: T): Promise<void> {
  const config = requireConfig();

  const response = await client(config).fetch(
    objectUrl(config, documentKey(name)),
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Не вдалося зберегти "${name}": ${response.status}`);
  }
}

export async function deleteObject(key: string): Promise<void> {
  const config = readConfig();
  if (!config) return;

  const response = await client(config).fetch(objectUrl(config, key), {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Не вдалося видалити "${key}": ${response.status}`);
  }
}

/**
 * Підписане посилання, за яким браузер кладе файл прямо в R2, минаючи
 * серверну функцію (і її ліміт ~4.5MB на тіло запиту).
 *
 * Content-Type у aws4fetch не входить до підписаних заголовків, тож браузер
 * вільний надіслати свій — саме він і збережеться в об'єкта. Тип ми валідуємо
 * на сервері до видачі посилання, а сам ендпоінт закритий сесією адміна.
 */
export async function presignUpload(
  key: string,
  expiresInSeconds = 600,
): Promise<string> {
  const config = requireConfig();

  const url = new URL(objectUrl(config, key));
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));

  const signed = await client(config).sign(url.toString(), {
    method: "PUT",
    aws: { signQuery: true },
  });

  return signed.url;
}
