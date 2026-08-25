import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_UPLOAD_BYTES = 32 * 1024 * 1024;

/**
 * Видає короткоживучий токен, з яким браузер вантажить файл прямо у Blob.
 * Так обходимо ліміт ~4.5MB на тіло запиту до серверної функції.
 *
 * onUploadCompleted свідомо не використовуємо: Blob не може викликати callback
 * на localhost, тож маніфест оновлює server action finalizeUpload після upload().
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Немає доступу" }, { status: 401 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Некоректний запит" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("works/")) {
          throw new Error("Дозволено завантаження лише у теку works/");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося завантажити файл";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
