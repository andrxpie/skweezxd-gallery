import About from "@/components/About";
import Hero from "@/components/Hero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Works from "@/components/Works";
import { getSettings } from "@/lib/settings";
import { getWorks } from "@/lib/works";

/**
 * Сторінка кешується, але кожна зміна в адмінці викликає revalidatePath("/"),
 * тож Роман бачить результат одразу, а відвідувачі — готовий HTML.
 */
export const revalidate = 60;

export default async function Home() {
  const [works, settings] = await Promise.all([getWorks(), getSettings()]);

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <Hero settings={settings} workCount={works.length} />
        <Works works={works} />
        <About settings={settings} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
