import { site } from "@/lib/site";

const navigation = [
  { label: "Роботи", href: "#works" },
  { label: "Про мене", href: "#about" },
  { label: "Контакти", href: "#contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-bone transition hover:text-ember"
        >
          {site.name}
        </a>

        <nav aria-label="Основна навігація">
          <ul className="flex items-center gap-5 text-sm text-ash sm:gap-8">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-bone"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
