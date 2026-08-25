import { site } from "@/lib/site";

export default function About() {
  return (
    <section
      id="about"
      className="border-t border-line bg-surface/40 scroll-mt-24"
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-24 lg:px-12">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ember">
            Про мене
          </p>
          <h2 className="mt-5 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Роблю графіку, яка працює на впізнаваність
          </h2>

          <div className="mt-7 space-y-5 text-lg leading-relaxed text-ash">
            <p>
              Я {site.name} — {site.role.toLowerCase()}. Працюю з айдентикою,
              постерами та digital-графікою: від першого скетчу до готових
              файлів для друку й соцмереж.
            </p>
            <p>
              Починаю з задачі, а не з красивої картинки. Розбираюсь, для кого
              продукт і чим він відрізняється, і вже потім будую візуальну
              систему, яку легко масштабувати на всі носії.
            </p>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1 lg:gap-12">
          <div>
            <h3 className="border-b border-line pb-3 text-xs uppercase tracking-[0.25em] text-ash">
              Що я роблю
            </h3>
            <ul className="mt-5 space-y-3">
              {site.services.map((service) => (
                <li key={service} className="flex items-baseline gap-3">
                  <span aria-hidden className="text-ember">
                    —
                  </span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="border-b border-line pb-3 text-xs uppercase tracking-[0.25em] text-ash">
              Інструменти
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {site.tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ash"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
