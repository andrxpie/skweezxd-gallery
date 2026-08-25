"use client";

import { useActionState, useEffect, useTransition } from "react";
import {
  createAlbum,
  deleteAlbum,
  moveAlbum,
  renameAlbum,
  setAlbumCover,
  type ActionState,
} from "@/app/admin/actions";
import { coverForAlbum, worksOfAlbum, type Album } from "@/lib/albums";
import { pluralWorks } from "@/lib/plural";
import type { Work } from "@/lib/works";

const initialState: ActionState = {};

const fieldClass =
  "w-full rounded-md border border-line bg-ink px-3 py-2 text-base tracking-normal text-bone normal-case outline-none focus:border-ember";
const labelClass = "block text-xs uppercase tracking-[0.2em] text-ash";

export default function AlbumsPanel({
  albums,
  works,
  onMessage,
}: {
  albums: Album[];
  works: Work[];
  onMessage: (state: ActionState) => void;
}) {
  const [createState, createAction, creating] = useActionState(
    createAlbum,
    initialState,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (createState.error || createState.success) onMessage(createState);
  }, [createState, onMessage]);

  function run(action: () => Promise<ActionState>) {
    startTransition(async () => onMessage(await action()));
  }

  const unassigned = works.filter((work) => !work.albumId).length;

  return (
    <div className="space-y-8">
      <form
        action={createAction}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-line p-5"
      >
        <label className={`${labelClass} min-w-56 flex-1`}>
          Назва нового альбому
          <input
            name="title"
            required
            placeholder="Наприклад: Айдентика кав’ярні"
            className={`mt-1.5 ${fieldClass}`}
          />
        </label>

        <button
          type="submit"
          disabled={creating}
          className="rounded-full bg-bone px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-ember disabled:opacity-50"
        >
          {creating ? "Створюю…" : "Створити"}
        </button>
      </form>

      {unassigned > 0 && (
        <p className="rounded-md border border-line bg-surface px-5 py-3 text-sm text-ash">
          Робіт поза альбомами: <span className="text-bone">{unassigned}</span>.
          Вони не показуються на сайті — признач їм альбом у вкладці «Роботи».
        </p>
      )}

      {albums.length === 0 ? (
        <p className="rounded-md border border-line px-6 py-10 text-center text-ash">
          Альбомів ще немає. Створи перший — саме вони показуються на головній.
        </p>
      ) : (
        <ul className="space-y-3">
          {albums.map((album, index) => {
            const albumWorks = worksOfAlbum(album.id, works);
            const cover = coverForAlbum(album, works);

            return (
              <li
                key={album.id}
                className="space-y-4 rounded-md border border-line p-4"
              >
                <div className="flex flex-wrap items-end gap-4">
                  <label className={`${labelClass} min-w-56 flex-1`}>
                    Назва
                    <input
                      type="text"
                      defaultValue={album.title}
                      disabled={pending}
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (value && value !== album.title) {
                          run(() => renameAlbum(album.id, value));
                        }
                      }}
                      className={`mt-1.5 ${fieldClass}`}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Підняти вище"
                      disabled={pending || index === 0}
                      onClick={() => run(() => moveAlbum(album.id, -1))}
                      className="flex size-9 items-center justify-center rounded-full border border-line transition hover:border-ember hover:text-ember disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Опустити нижче"
                      disabled={pending || index === albums.length - 1}
                      onClick={() => run(() => moveAlbum(album.id, 1))}
                      className="flex size-9 items-center justify-center rounded-full border border-line transition hover:border-ember hover:text-ember disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        const warning =
                          albumWorks.length > 0
                            ? `Видалити альбом «${album.title}»? ${albumWorks.length} ${pluralWorks(albumWorks.length)} зникнуть із сайту, але залишаться в адмінці.`
                            : `Видалити альбом «${album.title}»?`;
                        if (confirm(warning)) {
                          run(() => deleteAlbum(album.id));
                        }
                      }}
                      className="rounded-full border border-line px-4 py-2 text-sm transition hover:border-ember hover:text-ember disabled:opacity-30"
                    >
                      Видалити
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <label className={`${labelClass} min-w-56 flex-1`}>
                    Обкладинка
                    <select
                      value={album.coverId ?? ""}
                      disabled={pending || albumWorks.length === 0}
                      onChange={(event) =>
                        run(() =>
                          setAlbumCover(album.id, event.target.value || null),
                        )
                      }
                      className={`mt-1.5 ${fieldClass} disabled:opacity-40`}
                    >
                      <option value="">Перша робота альбому</option>
                      {albumWorks.map((work) => (
                        <option key={work.id} value={work.id}>
                          {work.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <p className="py-2 text-sm text-ash tabular-nums">
                    {albumWorks.length > 0
                      ? `${albumWorks.length} ${pluralWorks(albumWorks.length)}`
                      : "Порожній — не буде обкладинки"}
                    {cover && ` · зараз: ${cover.title}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
