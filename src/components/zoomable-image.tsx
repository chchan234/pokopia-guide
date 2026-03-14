'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} 확대 이미지`}
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/55 p-3 sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div className="flex min-h-full items-start justify-center sm:items-center">
              <div
                className="my-3 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="sticky top-0 z-10 flex items-center justify-end border-b border-border bg-white/95 px-3 py-3 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-black/80"
                  >
                    닫기
                  </button>
                </div>
                <div className="overflow-y-auto p-3 sm:p-4">
                  <Image
                    src={src}
                    alt={alt}
                    width={1200}
                    height={1200}
                    className="mx-auto max-h-[calc(100dvh-7rem)] w-full rounded-xl object-contain"
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

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
      {modal}
    </>
  );
}
