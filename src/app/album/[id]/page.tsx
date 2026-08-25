import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GalleryGrid from "@/components/GalleryGrid";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getAlbums, worksOfAlbum } from "@/lib/albums";
import { pluralWorks } from "@/lib/plural";
import { getSettings } from "@/lib/settings";
import { getWorks } from "@/lib/works";

export const revalidate = 60;

export async function generateMetadata(
  props: PageProps<"/album/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const album = (await getAlbums()).find((item) => item.id === id);

  if (!album) return { title: "Альбом не знайдено" };

  return {
    title: album.title,
    description: `Роботи з альбому «${album.title}».`,
  };
}

export default async function AlbumPage(props: PageProps<"/album/[id]">) {
  const { id } = await props.params;

  const [albums, works, settings] = await Promise.all([
    getAlbums(),
    getWorks(),
    getSettings(),
  ]);

  const album = albums.find((item) => item.id === id);
  if (!album) notFound();

  const albumWorks = worksOfAlbum(album.id, works);

  return (
    <>
      <SiteHeader settings={settings} />

      {/* id="top" — щоб посилання «Нагору» у футері працювало й тут */}
      <main
        id="top"
        className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <Link
          href="/#works"
          className="text-sm text-ash transition-colors hover:text-bone"
        >
          ← Усі альбоми
        </Link>

        <div className="mt-8 mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-6">
          <h1 className="font-display text-[clamp(2rem,7vw,4rem)] leading-tight font-semibold tracking-tight break-words text-bone">
            {album.title}
          </h1>
          <p className="text-sm text-ash tabular-nums">
            {albumWorks.length > 0
              ? `${albumWorks.length} ${pluralWorks(albumWorks.length)}`
              : "Альбом порожній"}
          </p>
        </div>

        {albumWorks.length > 0 ? (
          <GalleryGrid works={albumWorks} />
        ) : (
          <p className="rounded-sm border border-dashed border-line px-6 py-16 text-center text-ash">
            У цьому альбомі поки немає робіт.
          </p>
        )}
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
