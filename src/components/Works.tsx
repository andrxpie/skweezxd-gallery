import AlbumsGrid from "@/components/AlbumsGrid";
import GalleryGrid from "@/components/GalleryGrid";
import type { Album } from "@/lib/albums";
import { pluralAlbums, pluralWorks } from "@/lib/plural";
import type { Work } from "@/lib/works";

export default function Works({
  albums,
  works,
}: {
  albums: Album[];
  works: Work[];
}) {
  const hasAlbums = albums.length > 0;
  const count = hasAlbums ? albums.length : works.length;
  const label = hasAlbums ? pluralAlbums(count) : pluralWorks(count);

  return (
    <section
      id="works"
      className="mx-auto w-full max-w-[1400px] scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12"
    >
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Вибрані роботи
        </h2>
        <p className="text-sm text-ash tabular-nums">
          {count > 0 ? `${count} ${label}` : "Портфоліо оновлюється"}
        </p>
      </div>

      {hasAlbums ? (
        <AlbumsGrid albums={albums} works={works} />
      ) : works.length > 0 ? (
        // Резервний режим (сховище не налаштоване): альбомів немає, показуємо
        // роботи однією сіткою, як було до появи альбомів.
        <GalleryGrid works={works} />
      ) : (
        <p className="rounded-sm border border-dashed border-line px-6 py-16 text-center text-ash">
          Тут поки порожньо. Створи альбом і додай у нього роботи через адмінку
          на <code className="text-bone">/admin</code> — вони одразу
          з&apos;являться у галереї.
        </p>
      )}
    </section>
  );
}
