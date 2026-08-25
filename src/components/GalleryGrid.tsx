"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Lightbox from "@/components/Lightbox";
import type { Work } from "@/lib/works";

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
      <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3">
        {works.map((work, index) => (
          <button
            key={work.src}
            ref={(element) => {
              tileRefs.current[index] = element;
            }}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Відкрити роботу: ${work.title}`}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-sm border border-line/60 bg-surface text-left sm:mb-5"
          >
            <span className="relative block overflow-hidden">
              <Image
                src={work.src}
                alt={work.title}
                width={work.width}
                height={work.height}
                placeholder="blur"
                blurDataURL={work.blurDataURL}
                loading={index < 3 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />

              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

              <span className="pointer-events-none absolute bottom-0 left-0 flex w-full items-end justify-between gap-3 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-sm font-medium text-bone">
                  {work.title}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-ember">
                  Дивитись
                </span>
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
