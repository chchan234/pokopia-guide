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
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-[#e8eaf0] px-2.5 py-1 text-xs text-foreground dark:bg-card ${className ?? ''}`}>
      {resolvedImage && (
        <Image
          src={resolvedImage}
          alt=""
          aria-hidden
          width={22}
          height={22}
          className="h-[22px] w-[22px] flex-shrink-0 object-contain"
        />
      )}
      {material}
    </span>
  );
}
