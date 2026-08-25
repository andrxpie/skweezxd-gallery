import GalleryGrid from "@/components/GalleryGrid";
import type { Work } from "@/lib/works";

export default function Works({ works }: { works: Work[] }) {
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
          {works.length > 0
            ? `${works.length} ${pluralWorks(works.length)}`
            : "Портфоліо оновлюється"}
        </p>
      </div>

      {works.length > 0 ? (
        <GalleryGrid works={works} />
      ) : (
        <p className="rounded-sm border border-dashed border-line px-6 py-16 text-center text-ash">
          Тут поки порожньо. Додай зображення через адмінку на{" "}
          <code className="text-bone">/admin</code> — вони одразу
          з&apos;являться у галереї.
        </p>
      )}
    </section>
  );
}

function pluralWorks(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;

  if (mod100 >= 11 && mod100 <= 14) return "робіт";
  if (mod10 === 1) return "робота";
  if (mod10 >= 2 && mod10 <= 4) return "роботи";
  return "робіт";
}
