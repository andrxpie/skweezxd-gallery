import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isStorageConfigured, presignUpload, publicUrl } from "@/lib/storage";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_UPLOAD_BYTES = 32 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * Ключ формуємо на сервері: ім'я з браузера чистимо, а випадковий суфікс
 * гарантує, що два однойменні файли не перезапишуть один одного.
 */
function buildKey(filename: string, contentType: string): string {
  const base = filename
    .replace(/\.[^.]*$/, "")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);

  const suffix = crypto.randomUUID().slice(0, 8);
  const extension = EXTENSION_BY_TYPE[contentType] ?? "bin";

  return `works/${base || "work"}-${suffix}.${extension}`;
}

/**
 * Видає підписане посилання, за яким браузер кладе файл прямо в R2. Так
 * обходимо ліміт ~4.5MB на тіло запиту до серверної функції.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Немає доступу" }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Сховище не налаштоване: бракує змінних R2_*" },
      { status: 503 },
    );
  }

  let body: { filename?: unknown; contentType?: unknown; size?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректний запит" }, { status: 400 });
  }

  const filename = typeof body.filename === "string" ? body.filename : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : 0;

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Дозволені лише JPG, PNG, WebP, AVIF і GIF" },
      { status: 400 },
    );
  }

  if (size <= 0 || size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Розмір файлу має бути від 1 байта до 32 МБ" },
      { status: 400 },
    );
  }

  try {
    const key = buildKey(filename, contentType);

    return NextResponse.json({
      key,
      uploadUrl: await presignUpload(key),
      publicUrl: publicUrl(key),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося підготувати завантаження";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
