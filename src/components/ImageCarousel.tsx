"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export function ImageCarousel({ images, alt }: { images: { id: string; url: string }[]; alt: string }) {
  const [i, setI] = useState(0);
  const many = images.length > 1;
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-ink/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]?.url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      {many && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => setI((i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-[#0b1a22] shadow"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setI((i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-[#0b1a22] shadow"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((img, n) => (
              <span key={img.id} className={clsx("h-2 w-2 rounded-full", n === i ? "bg-white" : "bg-white/50")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
