import type { SiteSettings } from "@/lib/settings";

export default function Hero({
  settings,
  workCount,
}: {
  settings: SiteSettings;
  workCount: number;
}) {
  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden sm:min-h-[calc(100svh-4.25rem)]"
    >
      {/* М'яке світло за заголовком, щоб чорний фон не був плоским */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 size-[min(120vw,900px)] -translate-x-1/2 rounded-full bg-ember/10 blur-[140px]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
        {settings.available && (
          <p className="animate-rise mb-8 inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-ash">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-ember" />
            </span>
            Відкритий до нових проєктів
          </p>
        )}

        {/* Розмір ведемо від ширини екрана, а break-words страхує від обрізання:
            імʼя задається в адмінці, тож одне довге слово може не вміститись. */}
        <h1 className="animate-rise font-display text-[clamp(2rem,10.5vw,10rem)] leading-[0.9] font-bold tracking-[-0.04em] break-words text-bone">
          {settings.name}
        </h1>

        <div className="mt-10 flex flex-col gap-10 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <div className="animate-rise max-w-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-ember">
              {settings.role} — {settings.location}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ash sm:text-xl">
              {settings.tagline}
            </p>
          </div>

          <div className="animate-rise flex flex-wrap items-center gap-3">
            <a
              href="#works"
              className="rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition hover:bg-ember"
            >
              Переглянути роботи
              {workCount > 0 && (
                <span className="ml-2 tabular-nums opacity-60">
                  {workCount}
                </span>
              )}
            </a>
            <a
              href="#contact"
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-bone transition hover:border-ember hover:text-ember"
            >
              Написати мені
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
