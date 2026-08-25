import { cache } from "react";
import { isBlobConfigured, readDocument } from "@/lib/blob-store";
import type { Work } from "@/lib/works";

export type Album = {
  /** Стабільний ідентифікатор, він же сегмент URL: /album/<id> */
  id: string;
  title: string;
  /** id роботи-обкладинки; null — береться перша робота альбому */
  coverId: string | null;
};

export const ALBUMS_DOCUMENT = "albums";

export const getAlbums = cache(async (): Promise<Album[]> => {
  if (!isBlobConfigured()) return [];

  return (await readDocument<Album[]>(ALBUMS_DOCUMENT)) ?? [];
});

export function worksOfAlbum(albumId: string, works: Work[]): Work[] {
  return works.filter((work) => work.albumId === albumId);
}

/**
 * Обкладинка — обрана робота альбому, а якщо її не обрали або вона зникла,
 * то перша робота. Порожній альбом обкладинки не має.
 */
export function coverForAlbum(album: Album, works: Work[]): Work | null {
  const albumWorks = worksOfAlbum(album.id, works);

  if (album.coverId) {
    const chosen = albumWorks.find((work) => work.id === album.coverId);
    if (chosen) return chosen;
  }

  return albumWorks[0] ?? null;
}
