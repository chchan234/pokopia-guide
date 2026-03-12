'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  buttonClassName?: string;
  priority?: boolean;
}

export default function ZoomableImage({
  src,
  alt,
  width,
  height,
  className,
  buttonClassName,
  priority = false,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName ?? 'inline-flex cursor-zoom-in items-center justify-center'}
        aria-label={`${alt} 이미지 확대`}
      >
        <Image src={src} alt={alt} width={width} height={height} className={className} priority={priority} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} 확대 이미지`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-[min(92vw,560px)] rounded-2xl border border-border bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white hover:bg-black/70"
            >
              닫기
            </button>
            <div className="pt-5">
              <Image src={src} alt={alt} width={900} height={900} className="max-h-[68vh] w-full rounded-xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
