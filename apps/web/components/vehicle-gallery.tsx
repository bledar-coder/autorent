"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { VehiclePhoto } from "./vehicle-photo";

export function VehicleGallery({
  photos,
  name,
  vehicleClass,
}: {
  photos: string[];
  name: string;
  vehicleClass: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const count = photos.length;

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % count)), [count]);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, next, prev]);

  // No photos → branded placeholder, nothing to open.
  if (count === 0) {
    return (
      <VehiclePhoto
        src={null}
        alt={name}
        vehicleClass={vehicleClass}
        className="aspect-video rounded-xl border border-border"
      />
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(0)}
        className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border"
        aria-label={`${name} — view photos`}
      >
        <VehiclePhoto
          src={photos[0]}
          alt={name}
          vehicleClass={vehicleClass}
          priority
          sizes="(max-width: 1024px) 100vw, 600px"
          className="aspect-video transition-transform duration-500 hover:scale-105"
        />
      </button>

      {count > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {photos.slice(1, 5).map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => setOpen(i + 1)}
              className="block cursor-zoom-in overflow-hidden rounded-md border border-border"
              aria-label={`${name} — photo ${i + 2}`}
            >
              <VehiclePhoto
                src={photo}
                alt={`${name} — ${i + 2}`}
                vehicleClass={vehicleClass}
                sizes="150px"
                className="aspect-video transition-transform duration-300 hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : null}

      {open !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div
            className="relative h-[82vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[open]!}
              alt={`${name} — ${open + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {open + 1} / {count}
          </span>
        </div>
      ) : null}
    </div>
  );
}
