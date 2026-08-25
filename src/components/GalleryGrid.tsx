"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Lightbox from "@/components/Lightbox";
import type { Work } from "@/lib/works";

/** Спільний для обкладинок альбомів і робіт розмір під формат 16:9. */
export const TILE_SIZES =
  "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export default function GalleryGrid({ works }: { works: Work[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Повертаємо фокус на ту роботу, яку щойно дивилися, а не на ту, з якої
  // відкрили перегляд. Фокусуємо до зняття стану: плитка вже є в DOM, тож
  // не залежимо від rAF, який не спрацьовує у фоновій вкладці.
  function handleClose() {
    if (openIndex !== null) tileRefs.current[openIndex]?.focus();
    setOpenIndex(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {works.map((work, index) => (
          <button
            key={work.id}
            ref={(element) => {
              tileRefs.current[index] = element;
            }}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Відкрити роботу: ${work.title}`}
            // Плитки однакові (16:9), тож зображення обрізається по центру —
            // повний кадр видно у повноекранному перегляді.
            className="group relative block aspect-video w-full overflow-hidden rounded-sm border border-line/60 bg-surface text-left"
          >
            <Image
              src={work.src}
              alt={work.title}
              fill
              placeholder="blur"
              blurDataURL={work.blurDataURL}
              loading={index < 3 ? "eager" : "lazy"}
              sizes={TILE_SIZES}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />

            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

            <span className="pointer-events-none absolute bottom-0 left-0 flex w-full items-end justify-between gap-3 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="text-sm font-medium text-bone">
                {work.title}
              </span>
              <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-ember">
                Дивитись
              </span>
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          works={works}
          index={openIndex}
          onClose={handleClose}
          onNavigate={(update) =>
            setOpenIndex((current) => (current === null ? null : update(current)))
          }
        />
      )}
    </>
  );
}
