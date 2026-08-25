import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

// Абсолютні посилання, а не голі якорі: шапка є і на сторінці альбому,
// звідки «#works» вело б у нікуди.
const navigation = [
  { label: "Роботи", href: "/#works" },
  { label: "Про мене", href: "/#about" },
  { label: "Контакти", href: "/#contact" },
];

export default function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-md">
      {/*
        На вузьких екранах імʼя й меню разом не вміщаються в рядок (при 320px це
        427px проти 280px доступних), тому там вони йдуть двома рядками. Обрізати
        імʼя не можна — воно має читатися повністю за будь-якої довжини.
      */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-4 lg:px-12">
        <Link
          href="/#top"
          className="font-display text-lg font-semibold tracking-tight break-words text-bone transition hover:text-ember"
        >
          {settings.name}
        </Link>

        <nav aria-label="Основна навігація" className="sm:shrink-0">
          <ul className="flex items-center gap-5 text-sm text-ash sm:gap-8">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
