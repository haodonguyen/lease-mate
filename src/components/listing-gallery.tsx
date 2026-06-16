"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface GalleryPhoto {
  url: string;
  alt?: string;
}

export function ListingGallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const count = photos.length;

  const goTo = useCallback(
    (index: number) => {
      setActive((index + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      else if (event.key === "ArrowRight") goTo(active + 1);
      else if (event.key === "ArrowLeft") goTo(active - 1);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, active, goTo]);

  const current = photos[active];

  return (
    <div className="listing-gallery">
      <button
        type="button"
        className="gallery-main"
        onClick={() => setLightboxOpen(true)}
        aria-label="Open photo gallery"
      >
        <Image
          src={current.url}
          alt={current.alt || title}
          width={1200}
          height={675}
          priority
          className="detail-image"
        />
        <span className="gallery-expand-hint">
          <Expand size={16} />
          View
        </span>
      </button>

      {count > 1 ? (
        <div className="gallery-thumbs" role="tablist" aria-label="Listing photos">
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={`gallery-thumb${index === active ? " is-active" : ""}`}
              onClick={() => setActive(index)}
            >
              <Image src={photo.url} alt={photo.alt || `${title} photo ${index + 1}`} width={160} height={120} />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
          <button
            type="button"
            className="gallery-lightbox-close icon-button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close gallery"
          >
            <X size={22} />
          </button>

          {count > 1 ? (
            <button
              type="button"
              className="gallery-nav gallery-nav-prev icon-button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
            >
              <ChevronLeft size={26} />
            </button>
          ) : null}

          <div className="gallery-lightbox-image">
            <Image
              src={current.url}
              alt={current.alt || title}
              width={1600}
              height={1000}
              className="gallery-lightbox-img"
            />
            {count > 1 ? (
              <span className="gallery-lightbox-counter">
                {active + 1} / {count}
              </span>
            ) : null}
          </div>

          {count > 1 ? (
            <button
              type="button"
              className="gallery-nav gallery-nav-next icon-button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
            >
              <ChevronRight size={26} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
