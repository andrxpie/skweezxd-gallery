import About from "@/components/About";
import Hero from "@/components/Hero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Works from "@/components/Works";
import { getWorks } from "@/lib/works";

export default async function Home() {
  const works = await getWorks();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero workCount={works.length} />
        <Works works={works} />
        <About />
      </main>
      <SiteFooter />
    </>
  );
}
