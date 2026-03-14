import Image from 'next/image';
import { getMaterialImage } from '@/lib/material-images';

interface MaterialTagProps {
  material: string;
  imageSrc?: string | null;
  className?: string;
}

export default function MaterialTag({ material, imageSrc, className }: MaterialTagProps) {
  const resolvedImage = imageSrc ?? getMaterialImage(material);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground ${className ?? ''}`}>
      {resolvedImage && (
        <Image
          src={resolvedImage}
          alt=""
          aria-hidden
          width={16}
          height={16}
          className="h-4 w-4 object-contain mix-blend-multiply dark:mix-blend-normal dark:brightness-90"
        />
      )}
      {material}
    </span>
  );
}
