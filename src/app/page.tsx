import About from "@/components/About";
import Hero from "@/components/Hero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Works from "@/components/Works";
import { getAlbums } from "@/lib/albums";
import { getSettings } from "@/lib/settings";
import { getWorks } from "@/lib/works";

/**
 * Сторінка кешується, але кожна зміна в адмінці викликає revalidatePath("/"),
 * тож Роман бачить результат одразу, а відвідувачі — готовий HTML.
 */
export const revalidate = 60;

export default async function Home() {
  const [albums, works, settings] = await Promise.all([
    getAlbums(),
    getWorks(),
    getSettings(),
  ]);

  // На головній рахуємо лише опубліковані роботи — ті, що вже в альбомах.
  const publishedCount =
    albums.length > 0
      ? works.filter((work) => work.albumId).length
      : works.length;

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <Hero settings={settings} workCount={publishedCount} />
        <Works albums={albums} works={works} />
        <About settings={settings} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
