import Image from "next/image";
import Link from "next/link";
import { TILE_SIZES } from "@/components/GalleryGrid";
import { coverForAlbum, worksOfAlbum, type Album } from "@/lib/albums";
import { pluralWorks } from "@/lib/plural";
import type { Work } from "@/lib/works";

export default function AlbumsGrid({
  albums,
  works,
}: {
  albums: Album[];
  works: Work[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {albums.map((album, index) => {
        const cover = coverForAlbum(album, works);
        const count = worksOfAlbum(album.id, works).length;

        return (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="group relative block aspect-video w-full overflow-hidden rounded-sm border border-line/60 bg-surface"
          >
            {cover && (
              <Image
                src={cover.src}
                alt=""
                fill
                placeholder="blur"
                blurDataURL={cover.blurDataURL}
                loading={index < 3 ? "eager" : "lazy"}
                sizes={TILE_SIZES}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            )}

            {/* Назву альбому видно завжди — вона тут головна, на відміну від
                підписів робіт, які з'являються лише на наведення. */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-90" />

            <span className="absolute bottom-0 left-0 flex w-full items-end justify-between gap-3 p-5">
              <span>
                <span className="block font-display text-lg leading-tight font-semibold tracking-tight text-bone">
                  {album.title}
                </span>
                <span className="mt-1 block text-sm text-ash tabular-nums">
                  {count > 0 ? `${count} ${pluralWorks(count)}` : "Порожній"}
                </span>
              </span>

              <span
                aria-hidden
                className="shrink-0 text-xs uppercase tracking-[0.2em] text-ember opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                Дивитись
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
