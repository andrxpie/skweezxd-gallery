"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  deleteWork,
  finalizeUpload,
  moveWork,
  updateWorkTitle,
  type ActionState,
} from "@/app/admin/actions";
import type { Work } from "@/lib/works";

type Upload = { key: string; name: string; percentage: number };

/** Файли з великими розмірами вантажимо частинами — так надійніше на слабкій мережі. */
const MULTIPART_THRESHOLD = 10 * 1024 * 1024;

function safeFilename(name: string): string {
  const cleaned = name
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^[-.]+|-+$/g, "");
  return cleaned || `work-${Date.now()}.jpg`;
}

export default function WorksPanel({
  works,
  onMessage,
}: {
  works: Work[];
  onMessage: (state: ActionState) => void;
}) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function run(action: () => Promise<ActionState>) {
    startTransition(async () => onMessage(await action()));
  }

  async function uploadFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));

    if (images.length !== files.length) {
      onMessage({ error: "Пропущено файли, які не є зображеннями" });
    }

    for (const file of images) {
      const key = `${file.name}-${crypto.randomUUID()}`;
      setUploads((prev) => [
        ...prev,
        { key, name: file.name, percentage: 0 },
      ]);

      try {
        const blob = await upload(`works/${safeFilename(file.name)}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          multipart: file.size > MULTIPART_THRESHOLD,
          onUploadProgress: ({ percentage }) => {
            setUploads((prev) =>
              prev.map((item) =>
                item.key === key ? { ...item, percentage } : item,
              ),
            );
          },
        });

        const result = await finalizeUpload(blob.url, blob.pathname);
        onMessage(result);
      } catch (error) {
        onMessage({
          error: `${file.name}: ${
            error instanceof Error ? error.message : "не вдалося завантажити"
          }`,
        });
      } finally {
        setUploads((prev) => prev.filter((item) => item.key !== key));
      }
    }
  }

  return (
    <div className="space-y-8">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className={`rounded-lg border border-dashed px-6 py-12 text-center transition ${
          dragging ? "border-ember bg-ember/5" : "border-line"
        }`}
      >
        <p className="text-lg">Перетягни фото сюди</p>
        <p className="mt-1 text-sm text-ash">
          JPG, PNG, WebP, AVIF або GIF, до 32 МБ
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm transition hover:border-ember hover:text-ember"
        >
          Обрати файли
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            void uploadFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-3">
          {uploads.map((item) => (
            <li key={item.key} className="rounded-md border border-line p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate">{item.name}</span>
                <span className="text-ash tabular-nums">
                  {Math.round(item.percentage)}%
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-ember transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {works.length === 0 ? (
        <p className="rounded-md border border-line px-6 py-10 text-center text-ash">
          Робіт ще немає. Завантаж перше фото.
        </p>
      ) : (
        <ul className="space-y-3">
          {works.map((work, index) => (
            <li
              key={work.id}
              className="flex flex-wrap items-center gap-4 rounded-md border border-line p-3"
            >
              <Image
                src={work.src}
                alt={work.title}
                width={work.width}
                height={work.height}
                sizes="80px"
                className="size-20 shrink-0 rounded object-cover"
              />

              <label className="min-w-48 flex-1 text-xs uppercase tracking-[0.2em] text-ash">
                Підпис
                <input
                  type="text"
                  defaultValue={work.title}
                  disabled={pending}
                  onBlur={(event) => {
                    const value = event.target.value.trim();
                    if (value && value !== work.title) {
                      run(() => updateWorkTitle(work.id, value));
                    }
                  }}
                  className="mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-base tracking-normal text-bone normal-case outline-none focus:border-ember"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Підняти вище"
                  disabled={pending || index === 0}
                  onClick={() => run(() => moveWork(work.id, -1))}
                  className="flex size-9 items-center justify-center rounded-full border border-line transition hover:border-ember hover:text-ember disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Опустити нижче"
                  disabled={pending || index === works.length - 1}
                  onClick={() => run(() => moveWork(work.id, 1))}
                  className="flex size-9 items-center justify-center rounded-full border border-line transition hover:border-ember hover:text-ember disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Видалити «${work.title}»?`)) {
                      run(() => deleteWork(work.id));
                    }
                  }}
                  className="rounded-full border border-line px-4 py-2 text-sm transition hover:border-ember hover:text-ember disabled:opacity-30"
                >
                  Видалити
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
