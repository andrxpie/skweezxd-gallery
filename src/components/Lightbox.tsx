"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Work } from "@/lib/works";

type LightboxProps = {
  works: Work[];
  index: number;
  onClose: () => void;
  onNavigate: (update: (current: number) => number) => void;
};

export default function Lightbox({
  works,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const work = works[index];

  // Рахуємо від актуального індексу, щоб швидкі поспіль натискання не збивались.
  const goTo = useCallback(
    (step: number) => {
      onNavigate((current) => (current + step + works.length) % works.length);
    },
    [works.length, onNavigate],
  );

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        goTo(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        goTo(-1);
        return;
      }

      // Замикаємо Tab усередині оверлея, щоб фокус не блукав по схованій сторінці.
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll("button");
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (!dialogRef.current?.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [goTo, onClose]);

  // Блокуємо скрол сторінки під оверлеєм, компенсуючи ширину скролбара,
  // щоб контент позаду не смикався.
  useEffect(() => {
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  if (!work) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Перегляд роботи: ${work.title}`}
      className="animate-fade fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <span className="text-xs tracking-widest text-ash tabular-nums">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(works.length).padStart(2, "0")}
        </span>

        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Закрити перегляд"
          onClick={onClose}
          className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.2em] text-ash transition hover:border-ember hover:text-ember"
        >
          Закрити
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-8"
        onClick={(event) => event.stopPropagation()}
      >
        {works.length > 1 && (
          <button
            type="button"
            aria-label="Попередня робота"
            onClick={() => goTo(-1)}
            className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full border border-line bg-ink/70 text-lg text-bone transition hover:border-ember hover:text-ember sm:left-6"
          >
            ←
          </button>
        )}

        <Image
          key={work.src}
          src={work.src}
          alt={work.title}
          width={work.width}
          height={work.height}
          placeholder="blur"
          blurDataURL={work.blurDataURL}
          sizes="100vw"
          className="animate-fade h-auto max-h-full w-auto max-w-full rounded-sm object-contain"
        />

        {works.length > 1 && (
          <button
            type="button"
            aria-label="Наступна робота"
            onClick={() => goTo(1)}
            className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full border border-line bg-ink/70 text-lg text-bone transition hover:border-ember hover:text-ember sm:right-6"
          >
            →
          </button>
        )}
      </div>

      <p className="px-5 pb-6 text-center text-sm text-ash sm:px-8">
        {work.title}
      </p>
    </div>
  );
}
