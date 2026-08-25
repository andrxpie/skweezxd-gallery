import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer
      id="contact"
      className="mt-auto border-t border-line scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
        <p className="text-xs uppercase tracking-[0.25em] text-ember">
          Контакти
        </p>

        <div className="mt-6 flex flex-col gap-8 border-b border-line pb-12 md:flex-row md:items-end md:justify-between">
          <a
            href={`mailto:${site.email}`}
            className="font-display text-[clamp(1.75rem,6vw,4rem)] leading-none font-semibold tracking-tight break-all text-bone transition hover:text-ember"
          >
            {site.email}
          </a>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ash transition-colors hover:text-bone"
                >
                  {social.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-ash">
          <p>
            © {new Date().getFullYear()} {site.name}. Усі роботи належать
            їхнім авторам.
          </p>
          <a href="#top" className="transition-colors hover:text-bone">
            Нагору ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
